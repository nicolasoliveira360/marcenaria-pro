"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, CreditCard, ShieldCheck, Calendar, Clock, Zap, Phone, HelpCircle, Receipt, CreditCard as CreditCardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BillingBadge } from "@/components/billing-badge"
import { useCompany } from "@/hooks/use-company"
import { PRODUCT_ID, BillingInterval, formatPeriodEnd, isPremiumActive } from "@/lib/billing"
import { createClient } from "@/lib/supabase/client"

export default function FaturamentoPage() {
  const router = useRouter()
  const supabase = createClient()
  const { company, loading, error } = useCompany()
  const [redirectingCheckout, setRedirectingCheckout] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  
  // Log para diagnóstico
  useEffect(() => {
    if (company) {
      console.log("============= DADOS DA EMPRESA =============");
      console.log("Dados da empresa carregados:", {
        plan: company.plan,
        billing_interval: company.billing_interval,
        lastlink_status: company.lastlink_status,
        current_period_end: company.current_period_end
      });
      
      console.table({
        "ID": company.id,
        "Nome": company.name,
        "Tipo de Plano": company.plan,
        "Intervalo de Cobrança": company.billing_interval || "N/A",
        "Status do Pagamento": company.lastlink_status,
        "Próxima Renovação": company.current_period_end ? formatPeriodEnd(company.current_period_end) : "N/A",
        "Email": company.email,
        "Telefone": company.phone || "N/A"
      });
      
      // Logs específicos para casos críticos
      if (company.plan === 'paid' && company.lastlink_status !== 'active') {
        console.warn("⚠️ Plano pago com status não-ativo:", company.lastlink_status);
      }
      
      if (company.plan === 'paid' && !company.billing_interval) {
        console.warn("⚠️ Plano pago sem intervalo de cobrança definido");
      }
      
      console.log("isPremiumActive:", isPremiumActive(company.plan, company.lastlink_status));
      console.log("============================================");
    }
  }, [company]);
  
  // Buscar email do usuário logado
  useEffect(() => {
    async function getUserEmail() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
        }
      } catch (err) {
        console.error("Erro ao buscar email do usuário:", err)
      }
    }
    
    getUserEmail()
  }, [supabase])
  
  // Links reais do LastLink com parâmetro de email
  const LASTLINK_URLS = {
    monthly: "https://lastlink.com/p/CC84FA160/checkout-payment",
    annual: "https://lastlink.com/p/C11C022E9/checkout-payment"
  }
  
  // Função para obter URL do checkout do Lastlink com o email pré-preenchido
  const getCheckoutUrl = (interval: BillingInterval): string => {
    const baseUrl = LASTLINK_URLS[interval]
    // Usar email da empresa, se disponível. Caso contrário, usar email do usuário logado
    const email = company?.email || userEmail || ""
    
    if (!email) {
      console.warn("Email não encontrado para checkout. Verifique se o campo email está preenchido na tabela companies.")
    }
    
    return `${baseUrl}?email=${encodeURIComponent(email)}`
  }
  
  // Função para obter o interval inverso (para trocar entre mensal e anual)
  const getAlternativeInterval = (current: BillingInterval | null | undefined): BillingInterval => {
    return current === 'monthly' ? 'annual' : 'monthly'
  }
  
  const handleSubscribe = (interval: BillingInterval = 'monthly') => {
    setRedirectingCheckout(true)
    window.location.href = getCheckoutUrl(interval)
  }
  
  const handleChangeInterval = () => {
    if (!company) return
    
    setRedirectingCheckout(true)
    const altInterval = getAlternativeInterval(company.billing_interval as BillingInterval | undefined)
    window.location.href = getCheckoutUrl(altInterval)
  }
  
  const handlePayNow = () => {
    // Para faturas pendentes, redirecionamos para a URL atual da assinatura
    if (!company || !company.billing_interval) return
    
    setRedirectingCheckout(true)
    window.location.href = getCheckoutUrl(company.billing_interval as BillingInterval)
  }
  
  const handleCancel = () => {
    // Implementação do cancelamento de assinatura
    const confirmed = window.confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium.")
    if (confirmed) {
      alert("Assinatura cancelada com sucesso.")
      // Na implementação real, redirecionaria para URL de cancelamento do Lastlink
    }
  }

  const handleContactSupport = () => {
    // Redirecionar para página de suporte ou abrir chat/whatsapp
    window.open("https://wa.me/5500000000000?text=Olá,%20gostaria%20de%20cancelar%20minha%20assinatura.", "_blank")
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-3 bg-[#70645C]/5 border-b border-[#e5e7eb]">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error) {
    // Verificar se o erro está relacionado às colunas LastLink ausentes
    const isMissingColumnsError = error.message && (
      error.message.includes('column') || 
      error.message.includes('lastlink') || 
      error.message.includes('plan')
    );
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">
          {isMissingColumnsError ? 'Migração Necessária' : 'Erro ao Carregar Dados'}
        </h2>
        <p className="text-gray-500 mb-6 max-w-2xl">
          {isMissingColumnsError ? (
            <>
              A integração com LastLink exige colunas adicionais na tabela de empresas (companies) 
              que ainda não foram criadas no seu banco de dados.
              <br /><br />
              <span className="font-medium">Solução:</span> Execute o script SQL em 
              <code className="bg-[#f9fafb] px-2 py-1 mx-1 rounded text-sm font-mono border border-[#e5e7eb]">
                scripts/add-lastlink-columns.sql
              </code> 
              no Supabase Studio para criar as colunas necessárias.
              <br /><br />
              Consulte 
              <code className="bg-[#f9fafb] px-2 py-1 mx-1 rounded text-sm font-mono border border-[#e5e7eb]">
                scripts/README.md
              </code> 
              para instruções detalhadas.
            </>
          ) : (
            `Não foi possível carregar as informações de faturamento: ${error.message || 'Erro desconhecido'}`
          )}
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => router.refresh()}
            className="bg-[#70645C] hover:bg-[#5d534c] text-white border border-[#70645C]/20"
          >
            Tentar novamente
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10"
          >
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  // Log de diagnóstico antes do render final
  if (company) {
    console.log("Renderizando com os seguintes dados:", {
      plan: company.plan,
      billing_interval: company.billing_interval,
      lastlink_status: company.lastlink_status
    });
    
    // Log adicional para condições específicas
    if (company.plan === 'paid') {
      console.log(`🔍 Avaliando status para plano PAGO:`);
      console.log(`  ↳ Status atualmente é: ${company.lastlink_status}`);
      console.log(`  ↳ Condição 'lastlink_status === active' é: ${company.lastlink_status === 'active'}`);
      console.log(`  ↳ Condição 'billing_interval === monthly' é: ${company.billing_interval === 'monthly'}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho - seguindo o mesmo padrão da página de empresa */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
        <p className="text-gray-500 mt-1">Gerencie sua assinatura e opções de pagamento</p>
      </div>
      
      {/* Status da assinatura */}
      <div className="flex items-center justify-between">
        {company && (
          <>
            <pre className="text-xs text-gray-500 hidden">
              Debug: {JSON.stringify({
                plan: company.plan,
                billing_interval: company.billing_interval,
                lastlink_status: company.lastlink_status
              }, null, 2)}
            </pre>
            <BillingBadge
              plan={company.plan}
              billing_interval={company.billing_interval}
              lastlink_status={company.lastlink_status}
              nextRenewal={company.current_period_end}
            />
          </>
        )}
      </div>
      
      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card do plano atual */}
          <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
              <CardTitle className="text-lg text-gray-900 flex items-center">
                <Receipt size={18} className="mr-2 text-[#70645C]" /> Seu Plano Atual
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                {company?.plan === 'free' 
                  ? "Você está utilizando o plano gratuito com recursos limitados." 
                  : "Detalhes da sua assinatura atual e opções de gerenciamento."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {company?.plan === 'free' ? (
                  <div className="border border-[#e5e7eb] rounded-lg p-5">
                    <h3 className="text-lg font-medium mb-3 flex items-center text-gray-900">
                      <CreditCard size={18} className="mr-2 text-[#70645C]" />
                      Plano Gratuito
                    </h3>
                    <p className="text-gray-700 mb-4">
                      O plano gratuito inclui recursos básicos para gerenciamento de projetos com algumas limitações:
                    </p>
                    
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                        <span className="text-gray-700">Até 3 projetos ativos</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                        <span className="text-gray-700">Espaço de armazenamento limitado (100MB)</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                        <span className="text-gray-700">Funcionalidades básicas de gerenciamento</span>
                      </li>
                    </ul>
                    
                    <div className="bg-[#70645C]/10 p-4 rounded-lg mb-6">
                      <h4 className="font-medium text-[#70645C] mb-2">Por que fazer upgrade?</h4>
                      <p className="text-gray-700 text-sm mb-3">
                        Com o plano premium, você ganha acesso a:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-start">
                          <Zap size={16} className="text-[#70645C] mr-2 mt-0.5" />
                          <span className="text-gray-700">Projetos e colaboradores ilimitados</span>
                        </li>
                        <li className="flex items-start">
                          <Zap size={16} className="text-[#70645C] mr-2 mt-0.5" />
                          <span className="text-gray-700">Armazenamento expandido (10GB)</span>
                        </li>
                        <li className="flex items-start">
                          <Zap size={16} className="text-[#70645C] mr-2 mt-0.5" />
                          <span className="text-gray-700">Suporte prioritário e recursos avançados</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={() => handleSubscribe('monthly')} 
                        disabled={redirectingCheckout}
                        className="bg-[#70645C] hover:bg-[#5d534c] text-white text-sm"
                      >
                        {redirectingCheckout ? "Redirecionando..." : "Assinar Plano Mensal"}
                      </Button>
                      <Button 
                        onClick={() => handleSubscribe('annual')} 
                        disabled={redirectingCheckout}
                        variant="outline"
                        className="border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10 text-sm"
                      >
                        {redirectingCheckout ? "Redirecionando..." : "Assinar Plano Anual"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-[#e5e7eb] rounded-lg p-5">
                    <h3 className="text-lg font-medium mb-3 flex items-center text-gray-900">
                      <ShieldCheck size={18} className="mr-2 text-[#16a34a]" />
                      Plano Premium {company?.billing_interval === 'monthly' ? 'Mensal' : 'Anual'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <CreditCardIcon size={16} className="mr-2 text-[#70645C]" /> Status da Assinatura
                        </h4>
                        <p className="text-sm text-gray-500 mb-1">
                          {company?.lastlink_status === 'active' 
                            ? 'Sua assinatura está ativa e todas as funcionalidades premium estão disponíveis.' 
                            : company?.lastlink_status === 'past_due'
                              ? 'Sua assinatura está pendente de pagamento. Por favor, regularize para manter o acesso.' 
                              : 'Sua assinatura está inativa. Reative para recuperar o acesso às funcionalidades premium.'}
                        </p>
                        <p className="text-sm font-medium mt-2">
                          Status: <span className={
                            company?.lastlink_status === 'active' 
                              ? 'text-[#16a34a]' 
                              : company?.lastlink_status === 'past_due' 
                                ? 'text-yellow-600' 
                                : 'text-[#dc2626]'
                          }>
                            {company?.lastlink_status === 'active' 
                              ? 'Ativo' 
                              : company?.lastlink_status === 'past_due' 
                                ? 'Pendente de Pagamento' 
                                : 'Inativo'}
                          </span>
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Calendar size={16} className="mr-2 text-[#70645C]" /> Período da Assinatura
                        </h4>
                        <p className="text-sm text-gray-500 mb-1">
                          {company?.billing_interval === 'monthly' 
                            ? 'Assinatura mensal com renovação automática' 
                            : 'Assinatura anual com renovação automática'}
                        </p>
                        {company?.current_period_end && company?.lastlink_status === 'active' && (
                          <p className="text-sm font-medium mt-2 flex items-center">
                            <Clock size={14} className="mr-1" /> Próxima renovação: {formatPeriodEnd(company.current_period_end)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-6 border-t border-[#e5e7eb] pt-4">
                      {company?.lastlink_status === 'active' && (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={handleChangeInterval} 
                            disabled={redirectingCheckout}
                            className="border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10 text-sm"
                          >
                            Mudar para plano {company.billing_interval === 'monthly' ? 'Anual' : 'Mensal'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleContactSupport} 
                            className="border-red-200 text-[#dc2626] hover:bg-red-50 text-sm"
                          >
                            <Phone size={16} className="mr-1.5" /> Solicitar Cancelamento
                          </Button>
                        </>
                      )}
                      
                      {company?.lastlink_status === 'past_due' && (
                        <Button 
                          variant="default" 
                          onClick={handlePayNow} 
                          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                        >
                          Pagar Fatura Pendente
                        </Button>
                      )}
                      
                      {(company?.lastlink_status === 'canceled' || company?.lastlink_status === 'expired') && (
                        <Button 
                          onClick={() => handleSubscribe(company.billing_interval as BillingInterval || 'monthly')} 
                          disabled={redirectingCheckout}
                          className="bg-[#70645C] hover:bg-[#5d534c] text-white text-sm"
                        >
                          {redirectingCheckout ? "Redirecionando..." : "Reativar Assinatura"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Perguntas Frequentes */}
          <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
              <CardTitle className="text-lg text-gray-900 flex items-center">
                <HelpCircle size={18} className="mr-2 text-[#70645C]" /> Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Como cancelar minha assinatura?</h3>
                  <p className="text-gray-500 text-sm">
                    Para cancelar sua assinatura, clique no botão "Solicitar Cancelamento" e um de nossos atendentes entrará em contato para ajudar você com o processo.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">O que acontece com meus dados se eu cancelar?</h3>
                  <p className="text-gray-500 text-sm">
                    Se você cancelar sua assinatura, seus dados permanecerão disponíveis por 30 dias. Após esse período, sua conta retornará ao plano gratuito com limitações.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Como obter suporte para questões de faturamento?</h3>
                  <p className="text-gray-500 text-sm">
                    Para qualquer dúvida relacionada a faturamento, envie um e-mail para suporte@marcenariapro.com.br ou clique no botão "Solicitar Cancelamento" para falar com um atendente.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Posso mudar meu plano a qualquer momento?</h3>
                  <p className="text-gray-500 text-sm">
                    Sim, você pode mudar entre os planos mensal e anual a qualquer momento. Para o plano anual, oferecemos um desconto significativo em comparação com o pagamento mensal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Card de Opções de Plano */}
          <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
              <CardTitle className="text-lg text-gray-900 flex items-center">
                <CreditCard size={18} className="mr-2 text-[#70645C]" /> Opções de Plano
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                Compare e escolha o melhor plano para o seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Plano Mensal */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-[#70645C]/30 transition-colors duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-[#70645C]">Plano Mensal</h3>
                    {company?.billing_interval === 'monthly' && company?.lastlink_status === 'active' && (
                      <span className="bg-green-100 text-[#16a34a] text-xs px-2 py-0.5 rounded-full font-medium">
                        Plano Atual
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline mb-1">
                    <div className="text-3xl font-bold text-gray-900">R$ 99,90</div>
                    <span className="text-sm font-normal text-gray-500 ml-1">/mês</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Faturado mensalmente, cancelamento a qualquer momento.</p>
                  
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">Projetos ilimitados</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">Colaboradores ilimitados</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">10GB de armazenamento</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">Suporte prioritário</span>
                    </li>
                  </ul>
                  
                  {(company?.plan !== 'paid' || 
                    (company?.billing_interval === 'annual' && company?.lastlink_status === 'active')) && (
                    <Button 
                      variant={company?.billing_interval === 'monthly' && company?.lastlink_status === 'active' ? 'outline' : 'default'} 
                      className={`w-full ${company?.billing_interval === 'monthly' && company?.lastlink_status === 'active' ? 'border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10' : 'bg-[#70645C] hover:bg-[#5d534c] text-white'} text-sm`}
                      onClick={() => handleSubscribe('monthly')}
                      disabled={company?.billing_interval === 'monthly' && company?.lastlink_status === 'active' || redirectingCheckout}
                    >
                      {company?.billing_interval === 'monthly' && company?.lastlink_status === 'active' 
                        ? 'Plano Atual' 
                        : redirectingCheckout ? "Redirecionando..." : "Escolher Plano Mensal"}
                    </Button>
                  )}
                </div>
                
                {/* Plano Anual */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-[#70645C]/30 transition-colors duration-200 relative overflow-hidden">
                  <div className="absolute -right-10 top-5 bg-[#16a34a] text-white text-xs px-10 py-1 rotate-45 font-medium">
                    Economize 25%
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-[#70645C]">Plano Anual</h3>
                    {company?.billing_interval === 'annual' && company?.lastlink_status === 'active' && (
                      <span className="bg-green-100 text-[#16a34a] text-xs px-2 py-0.5 rounded-full font-medium">
                        Plano Atual
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline mb-1">
                    <div className="text-3xl font-bold text-gray-900">R$ 749,00</div>
                    <span className="text-sm font-normal text-gray-500 ml-1">/ano</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Faturado anualmente ou em 12x de R$ 79,76</p>
                  <p className="text-sm text-gray-500 mb-4">Equivalente a R$ 62,42/mês.</p>
                  
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">Projetos ilimitados</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">Colaboradores ilimitados</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">10GB de armazenamento</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700">Suporte prioritário</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-[#16a34a] mr-2 mt-0.5" />
                      <span className="text-gray-700 font-medium">Economia de 25%</span>
                    </li>
                  </ul>
                  
                  {(company?.plan !== 'paid' || 
                    (company?.billing_interval === 'monthly' && company?.lastlink_status === 'active')) && (
                    <Button 
                      variant={company?.billing_interval === 'annual' && company?.lastlink_status === 'active' ? 'outline' : 'default'} 
                      className={`w-full ${company?.billing_interval === 'annual' && company?.lastlink_status === 'active' ? 'border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10' : 'bg-[#70645C] hover:bg-[#5d534c] text-white'} text-sm`}
                      onClick={() => handleSubscribe('annual')}
                      disabled={company?.billing_interval === 'annual' && company?.lastlink_status === 'active' || redirectingCheckout}
                    >
                      {company?.billing_interval === 'annual' && company?.lastlink_status === 'active'
                        ? 'Plano Atual' 
                        : redirectingCheckout ? "Redirecionando..." : "Escolher Plano Anual"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Suporte */}
          <Card className="border border-[#e5e7eb] shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
              <CardTitle className="text-lg text-gray-900 flex items-center">
                <Phone size={18} className="mr-2 text-[#70645C]" /> Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                Precisa de ajuda com faturamento ou tem dúvidas sobre sua assinatura? Nossa equipe está disponível para ajudar.
              </p>
              <Button 
                onClick={handleContactSupport}
                className="w-full bg-[#70645C] hover:bg-[#5d534c] text-white text-sm"
              >
                <Phone size={16} className="mr-2" /> Falar com Atendente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 