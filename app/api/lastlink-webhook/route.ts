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
  console.log('🔍 Buscando empresa pelo e-mail:', email)
  
  const { data: company, error } = await supabase
    .from('companies')
    .select('id')
    .eq('email', email)
    .single()
  
  if (error || !company) {
    console.error('❌ Empresa não encontrada pelo email:', email, error)
    return null
  }
  
  console.log('✅ Empresa encontrada pelo e-mail:', company.id)
  return company.id
}

// Função auxiliar para encontrar a empresa pelo ID da assinatura
async function findCompanyBySubscriptionId(supabase: any, subscriptionId: string): Promise<string | null> {
  // Buscar empresa pelo ID da assinatura
  console.log('🔍 Buscando empresa pelo ID da assinatura:', subscriptionId)
  
  const { data: subscription, error } = await supabase
    .from('lastlink_subscriptions')
    .select('company_id')
    .eq('subscription_id', subscriptionId)
    .single()
  
  if (error || !subscription) {
    console.error('❌ Assinatura não encontrada:', subscriptionId, error)
    return null
  }
  
  console.log('✅ Empresa encontrada pelo ID da assinatura:', subscription.company_id)
  return subscription.company_id
}

// Função auxiliar para obter o ID do produto
function getProductId(payload: LastlinkPayload): string | null {
  let productId = null
  
  // PRIORIDADE 1: Extrair o ID do produto da URL da oferta
  if (payload.Data.Offer?.Url) {
    const url = payload.Data.Offer.Url
    // Extrair ID do produto da URL do Lastlink (https://lastlink.com/p/CC84FA160)
    const match = url.match(/\/p\/([A-Z0-9]+)/)
    if (match && match[1]) {
      productId = match[1]
      console.log('✅ ID do produto extraído da URL:', productId)
      return productId
    } else {
      console.log('⚠️ Não foi possível extrair o ID do produto da URL:', url)
    }
  }
  
  // PRIORIDADE 2: Usar o ID da oferta se compatível com o formato esperado (código curto)
  if (payload.Data.Offer?.Id) {
    // Verificar se o ID da oferta parece ser um ID curto (por exemplo, apenas caracteres alfanuméricos)
    if (/^[A-Z0-9]{9}$/.test(payload.Data.Offer.Id)) {
      productId = payload.Data.Offer.Id
      console.log('✅ ID do produto extraído da Offer.Id (formato curto):', productId)
      return productId
    } else {
      console.log('⚠️ ID da oferta não está no formato esperado:', payload.Data.Offer.Id)
    }
  }
  
  // PRIORIDADE 3: Tentar obter dos Subscriptions (apenas se for um ID no formato curto)
  if (!productId && payload.Data.Subscriptions && payload.Data.Subscriptions.length > 0) {
    const subProductId = payload.Data.Subscriptions[0].ProductId
    if (subProductId && /^[A-Z0-9]{9}$/.test(subProductId)) {
      productId = subProductId
      console.log('✅ ID do produto extraído de Subscriptions:', productId)
    } else {
      console.log('⚠️ ID do produto de Subscriptions não está no formato esperado:', subProductId)
    }
  }
  
  // PRIORIDADE 4: Tentar dos Products (apenas se for um ID no formato curto)
  if (!productId && payload.Data.Products && payload.Data.Products.length > 0) {
    const prodId = payload.Data.Products[0].Id
    if (prodId && /^[A-Z0-9]{9}$/.test(prodId)) {
      productId = prodId
      console.log('✅ ID do produto extraído de Products:', productId)
    } else {
      console.log('⚠️ ID do produto de Products não está no formato esperado:', prodId)
    }
  }
  
  // Se nenhum ID válido foi encontrado, usar o código padrão do plano mensal
  if (!productId) {
    productId = 'CC84FA160' // ID padrão do plano mensal
    console.log('⚠️ Nenhum ID válido encontrado, usando ID padrão do plano mensal:', productId)
  }
  
  return productId
}

// Função auxiliar para obter o ID da assinatura
function getSubscriptionId(payload: LastlinkPayload): string | null {
  if (payload.Data.Subscriptions && payload.Data.Subscriptions.length > 0) {
    return payload.Data.Subscriptions[0].Id
  }
  
  return null
}

// Função auxiliar para verificar se um produto existe na tabela lastlink_products
async function verifyProductExists(supabase: any, productId: string): Promise<boolean> {
  console.log('🔍 Verificando se o produto existe na tabela lastlink_products:', productId)
  
  const { data, error } = await supabase
    .from('lastlink_products')
    .select('product_id')
    .eq('product_id', productId)
    .single()
  
  if (error) {
    console.error('❌ Erro ao verificar produto:', error)
    return false
  }
  
  if (!data) {
    console.error('❌ Produto não encontrado na tabela lastlink_products:', productId)
    return false
  }
  
  console.log('✅ Produto encontrado na tabela lastlink_products:', data)
  return true
}

// Função auxiliar para cadastrar um produto na tabela lastlink_products caso não exista
async function ensureProductExists(supabase: any, productId: string, billingInterval: string = 'monthly'): Promise<boolean> {
  console.log('🔍 Verificando se o produto existe na tabela lastlink_products:', productId)
  
  // Primeiro verificamos se o produto já existe
  const { data, error } = await supabase
    .from('lastlink_products')
    .select('product_id')
    .eq('product_id', productId)
    .single()
  
  // Se o produto já existe, retorna true
  if (data) {
    console.log('✅ Produto já existe na tabela lastlink_products:', data)
    return true
  }
  
  // Se houver erro diferente de "not found", registra o erro
  if (error && !error.message.includes('No rows found')) {
    console.error('❌ Erro ao verificar produto:', error)
    return false
  }
  
  // Se o produto não existe, tenta cadastrá-lo
  console.log('⚠️ Produto não encontrado. Tentando cadastrar:', productId, 'com billing_interval:', billingInterval)
  
  const { error: insertError } = await supabase
    .from('lastlink_products')
    .insert({
      product_id: productId,
      billing_interval: billingInterval
    })
  
  if (insertError) {
    console.error('❌ Erro ao cadastrar produto:', insertError)
    return false
  }
  
  console.log('✅ Produto cadastrado com sucesso na tabela lastlink_products:', productId)
  return true
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
        event_type: lastlinkEvent,
        company_id: companyId,
        subscription_id: subscriptionId,
        data: payload
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
            
            // Agora vamos garantir que o produto exista, tentando cadastrá-lo se não existir
            const billingInterval = payload.Data.Purchase?.Recurrency === 1 ? 'monthly' : 'annual'
            const productEnsured = await ensureProductExists(supabase, productId, billingInterval)
            
            if (!productEnsured) {
              console.error('❌ Não foi possível garantir que o produto existe na tabela lastlink_products.')
              return NextResponse.json({ 
                error: 'Falha ao processar o produto. Verifique os logs do servidor.' 
              }, { status: 500 })
            }
            
            const periodEnd = payload.Data.Subscriptions?.[0]?.ExpiredDate || null
            
            // Verificar se já existe uma entrada para essa assinatura
            const { data: existingSub, error: existingSubError } = await supabase
              .from('lastlink_subscriptions')
              .select('id')
              .eq('subscription_id', subscriptionId)
              .eq('company_id', companyId)
              .single()
            
            if (existingSubError && !existingSubError.message.includes('No rows found')) {
              console.error('❌ Erro ao verificar assinatura existente:', existingSubError)
            }
            
            if (!existingSub) {
              console.log('ℹ️ Assinatura não encontrada, criando nova entrada...')
              // Inserir nova entrada na tabela lastlink_subscriptions para garantir a associação
              const { error: insertError } = await supabase
                .from('lastlink_subscriptions')
                .insert({
                  company_id: companyId,
                  subscription_id: subscriptionId,
                  product_id: productId,
                  billing_interval: billingInterval,
                  status: 'active',
                  current_period_end: periodEnd
                })
              
              if (insertError) {
                console.error('❌ Erro ao criar entrada na tabela lastlink_subscriptions:', insertError)
              } else {
                console.log('✅ Nova assinatura registrada com sucesso')
              }
            } else {
              console.log('ℹ️ Assinatura já existente, atualizando status...')
            }
            
            console.log('📤 Enviando para RPC handle_lastlink_active com parâmetros:', {
              p_company_id: companyId,
              p_sub_id: subscriptionId,
              p_product_id: productId,
              p_period_end: periodEnd
            })
            
            const { data, error } = await supabase.rpc('handle_lastlink_active', {
              p_company_id: companyId,
              p_sub_id: subscriptionId,
              p_product_id: productId,
              p_period_end: periodEnd
            })
            
            if (error) {
              console.error('❌ Erro na chamada RPC handle_lastlink_active:', error)
            } else {
              console.log('✅ RPC handle_lastlink_active executada com sucesso')
            }
            
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