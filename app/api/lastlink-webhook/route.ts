import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Tipos para os eventos da LastLink
type LastlinkEvent = {
  id: string
  type: 'subscription.created' | 'subscription.updated' | 'payment.succeeded' | 'payment.failed' | 'subscription.canceled' | 'subscription.expired'
  data: {
    subscription_id: string
    company_id: string
    product_id?: string
    status?: string
    period_end?: string
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    
    // Obter o corpo da requisição
    const payload = await request.json() as LastlinkEvent
    
    // Registrar o evento recebido para debug
    console.log('Evento LastLink recebido:', payload.type, 'ID da assinatura:', payload.data.subscription_id)
    
    // Verificar se temos os dados necessários
    if (!payload.data.subscription_id || !payload.data.company_id) {
      console.error('Dados obrigatórios ausentes no evento LastLink')
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }
    
    // Registrar o evento no banco de dados para auditoria
    const { error: logError } = await supabase.from('lastlink_events').insert({
      event_type: payload.type,
      company_id: payload.data.company_id,
      subscription_id: payload.data.subscription_id,
      data: payload
    })
    
    if (logError) {
      console.error('Erro ao registrar evento LastLink:', logError)
    }
    
    // Processar o evento com base no tipo
    let result
    
    switch (payload.type) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'payment.succeeded':
        // Ativar ou renovar assinatura
        if (payload.data.product_id) {
          const { data, error } = await supabase.rpc('handle_lastlink_active', {
            p_company_id: payload.data.company_id,
            p_sub_id: payload.data.subscription_id,
            p_product_id: payload.data.product_id,
            p_period_end: payload.data.period_end || null
          })
          
          result = { data, error }
        } else {
          console.warn('product_id ausente para evento', payload.type)
        }
        break
        
      case 'payment.failed':
        // Marcar como pendente (past_due)
        const { data: pastDueData, error: pastDueError } = await supabase.rpc('handle_lastlink_past_due', {
          p_company_id: payload.data.company_id,
          p_sub_id: payload.data.subscription_id,
          p_period_end: payload.data.period_end || null
        })
        
        result = { data: pastDueData, error: pastDueError }
        break
        
      case 'subscription.canceled':
        // Cancelar assinatura
        const { data: cancelData, error: cancelError } = await supabase.rpc('handle_lastlink_canceled', {
          p_company_id: payload.data.company_id,
          p_sub_id: payload.data.subscription_id,
          p_period_end: payload.data.period_end || null
        })
        
        result = { data: cancelData, error: cancelError }
        break
        
      case 'subscription.expired':
        // Expirar assinatura
        const { data: expireData, error: expireError } = await supabase.rpc('handle_lastlink_expired', {
          p_company_id: payload.data.company_id,
          p_sub_id: payload.data.subscription_id,
          p_period_end: payload.data.period_end || null
        })
        
        result = { data: expireData, error: expireError }
        break
        
      default:
        console.warn('Tipo de evento LastLink não processado:', payload.type)
    }
    
    if (result?.error) {
      console.error('Erro ao processar evento LastLink:', result.error)
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 })
    }
    
    // Responder com sucesso
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro no webhook LastLink:', error.message)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Opcional: Implementar um método GET para verificação de saúde da rota
export async function GET() {
  return NextResponse.json({ status: 'LastLink webhook disponível' })
} 