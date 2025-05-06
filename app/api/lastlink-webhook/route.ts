import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Token de segurança da LastLink para validação
const LASTLINK_TOKEN = 'bae0fd8318294c4d97c8311ab4a569d9'

// Tipos para os eventos da LastLink conforme documentação
type LastlinkPayload = {
  Id: string
  IsTest: boolean
  Event: string
  CreatedAt: string
  Data: {
    Products: Array<{
      Id: string
      Name: string
    }>
    Buyer: {
      Id: string
      Email: string
      Name: string
      Document: string
      PhoneNumber?: string
    }
    Offer?: {
      Id: string
      Name: string
      Url: string
    }
    Subscriptions?: Array<{
      Id: string
      ProductId: string
      ExpiredDate?: string
    }>
    Purchase?: {
      PaymentId?: string
      PaymentDate?: string
      Recurrency?: number
    }
  }
}

// Função auxiliar para mapear eventos da LastLink para tipos internos
function mapLastlinkEventType(lastlinkEvent: string): string {
  switch (lastlinkEvent) {
    case 'Purchase_Order_Confirmed':
    case 'Recurrent_Payment':
      return 'subscription.created'
    case 'Purchase_Request_Expired':
      return 'payment.failed'
    case 'Subscription_Canceled':
      return 'subscription.canceled'
    case 'Subscription_Expired':
      return 'subscription.expired'
    default:
      return 'unknown'
  }
}

// Função auxiliar para encontrar a empresa pelo e-mail
async function findCompanyByEmail(supabase: any, email: string): Promise<string | null> {
  // Buscar empresa pelo email
  const { data: company, error } = await supabase
    .from('companies')
    .select('id')
    .eq('email', email)
    .single()
  
  if (error || !company) {
    console.error('❌ Empresa não encontrada pelo email:', email, error)
    return null
  }
  
  return company.id
}

// Função auxiliar para encontrar a empresa pelo ID do produto
async function findCompanyBySubscriptionId(supabase: any, subscriptionId: string): Promise<string | null> {
  // Buscar empresa pelo ID da assinatura
  const { data: subscription, error } = await supabase
    .from('lastlink_subscriptions')
    .select('company_id')
    .eq('subscription_id', subscriptionId)
    .single()
  
  if (error || !subscription) {
    console.error('❌ Assinatura não encontrada:', subscriptionId, error)
    return null
  }
  
  return subscription.company_id
}

// Função auxiliar para obter o ID do produto
function getProductId(payload: LastlinkPayload): string | null {
  // Tentar obter dos Subscriptions
  if (payload.Data.Subscriptions && payload.Data.Subscriptions.length > 0) {
    return payload.Data.Subscriptions[0].ProductId
  }
  
  // Tentar obter do Offer
  if (payload.Data.Offer) {
    const url = payload.Data.Offer.Url
    // Extrair ID do produto da URL do Lastlink (https://lastlink.com/p/CC84FA160)
    const match = url.match(/\/p\/([A-Z0-9]+)/)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

// Função auxiliar para obter o ID da assinatura
function getSubscriptionId(payload: LastlinkPayload): string | null {
  if (payload.Data.Subscriptions && payload.Data.Subscriptions.length > 0) {
    return payload.Data.Subscriptions[0].Id
  }
  
  return null
}

export async function POST(request: Request) {
  try {
    console.log('🔄 Webhook LastLink - Iniciando processamento')
    
    // Verificar token de segurança
    const lastlinkToken = request.headers.get('x-lastlink-token')
    
    if (!lastlinkToken || lastlinkToken !== LASTLINK_TOKEN) {
      console.error('❌ Token de segurança inválido ou ausente')
      return NextResponse.json({ error: 'Token de segurança inválido' }, { status: 401 })
    }
    
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Webhook LastLink - Variáveis de ambiente ausentes', {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey
      })
      return NextResponse.json({ 
        error: 'Configuração do servidor incompleta - Variáveis de ambiente ausentes' 
      }, { status: 500 })
    }
    
    try {
      // Inicializar o cliente Supabase com permissões administrativas
      const supabase = createAdminClient()
      
      // Extrair o corpo da requisição - pode ser um objeto único ou um array
      const reqBody = await request.json()
      
      // Verificar se é um array e pegar o primeiro item, ou usar diretamente
      const rawPayload = Array.isArray(reqBody) ? reqBody[0].body : reqBody
      const payload = rawPayload as LastlinkPayload
      
      // Verificar se temos o payload correto
      if (!payload || !payload.Event || !payload.Data) {
        console.error('❌ Formato de payload inválido:', payload)
        return NextResponse.json({ error: 'Formato de payload inválido' }, { status: 400 })
      }
      
      // Obter dados importantes do payload
      const eventId = payload.Id
      const lastlinkEvent = payload.Event
      const mappedEventType = mapLastlinkEventType(lastlinkEvent)
      const subscriptionId = getSubscriptionId(payload)
      const productId = getProductId(payload)
      const buyerEmail = payload.Data.Buyer?.Email
      
      console.log('📥 Evento LastLink recebido:', {
        eventId,
        eventType: lastlinkEvent,
        mappedType: mappedEventType,
        subscriptionId,
        productId,
        buyerEmail
      })
      
      // Validar dados essenciais
      if (!subscriptionId) {
        console.error('❌ ID da assinatura não encontrado no payload')
        return NextResponse.json({ error: 'ID da assinatura não encontrado' }, { status: 400 })
      }
      
      // Encontrar a empresa relacionada à assinatura
      let companyId = await findCompanyBySubscriptionId(supabase, subscriptionId)
      
      // Se não encontrar pelo ID da assinatura, tentar pelo email
      if (!companyId && buyerEmail) {
        companyId = await findCompanyByEmail(supabase, buyerEmail)
      }
      
      // Se ainda não encontrou a empresa, não podemos continuar
      if (!companyId) {
        console.error('❌ Não foi possível determinar a empresa para a assinatura:', subscriptionId)
        return NextResponse.json({ 
          error: 'Empresa não encontrada para esta assinatura' 
        }, { status: 404 })
      }
      
      // Registrar o evento no banco para auditoria
      const { error: logError } = await supabase.from('lastlink_events').insert({
        event_id: eventId,
        company_id: companyId,
        event_type: lastlinkEvent,
        subscription_id: subscriptionId,
        payload: payload
      })
      
      if (logError) {
        console.error('❌ Erro ao registrar evento LastLink no banco:', logError)
      }
      
      // Processar o evento com base no tipo mapeado
      let result
      
      switch (mappedEventType) {
        case 'subscription.created':
          // Ativar ou renovar assinatura
          if (productId) {
            console.log('🔄 Processando ativação/renovação de assinatura:', {
              companyId,
              subscriptionId,
              productId
            })
            
            const periodEnd = payload.Data.Subscriptions?.[0]?.ExpiredDate || null
            
            const { data, error } = await supabase.rpc('handle_lastlink_active', {
              p_company_id: companyId,
              p_sub_id: subscriptionId,
              p_product_id: productId,
              p_period_end: periodEnd
            })
            
            result = { data, error }
          } else {
            console.warn('⚠️ ID do produto ausente para evento', lastlinkEvent)
          }
          break
          
        case 'payment.failed':
          // Marcar como pendente (past_due)
          console.log('🔄 Processando pagamento com falha:', {
            companyId,
            subscriptionId
          })
          
          const { data: pastDueData, error: pastDueError } = await supabase.rpc('handle_lastlink_past_due', {
            p_company_id: companyId,
            p_sub_id: subscriptionId,
            p_period_end: null
          })
          
          result = { data: pastDueData, error: pastDueError }
          break
          
        case 'subscription.canceled':
          // Cancelar assinatura
          console.log('🔄 Processando cancelamento de assinatura:', {
            companyId,
            subscriptionId
          })
          
          const { data: cancelData, error: cancelError } = await supabase.rpc('handle_lastlink_canceled', {
            p_company_id: companyId,
            p_sub_id: subscriptionId,
            p_period_end: null
          })
          
          result = { data: cancelData, error: cancelError }
          break
          
        case 'subscription.expired':
          // Expirar assinatura
          console.log('🔄 Processando expiração de assinatura:', {
            companyId,
            subscriptionId
          })
          
          const { data: expireData, error: expireError } = await supabase.rpc('handle_lastlink_expired', {
            p_company_id: companyId,
            p_sub_id: subscriptionId,
            p_period_end: null
          })
          
          result = { data: expireData, error: expireError }
          break
          
        default:
          console.log('ℹ️ Evento LastLink não processado, apenas registrado:', lastlinkEvent)
          // Não processamos este tipo de evento, mas o registramos para auditoria
          result = { data: null, error: null }
      }
      
      if (result?.error) {
        console.error('❌ Erro ao processar evento LastLink:', result.error)
        return NextResponse.json({ success: false, error: result.error.message }, { status: 500 })
      }
      
      console.log('✅ Evento LastLink processado com sucesso:', lastlinkEvent)
      // Responder com sucesso
      return NextResponse.json({ success: true })
    } catch (innerError: any) {
      console.error('❌ Erro no processamento do webhook LastLink:', innerError.message, innerError.stack)
      return NextResponse.json({ error: 'Erro no processamento da requisição' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Erro crítico no webhook LastLink:', error.message, error.stack)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Implementar um método GET para verificação de saúde da rota
export async function GET() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const config = {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      lastlinkToken: !!LASTLINK_TOKEN
    }
    
    return NextResponse.json({ 
      status: 'LastLink webhook disponível',
      config
    })
  } catch (error: any) {
    console.error('❌ Erro na verificação de saúde do webhook:', error.message)
    return NextResponse.json({ status: 'Erro', message: error.message }, { status: 500 })
  }
} 