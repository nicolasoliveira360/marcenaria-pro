"use client"

import type React from "react"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronDown, Menu, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <NavBar />
      <HeroSection />
      <BenefitsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  )
}

function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#70645C]/10 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Logo />
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="#beneficios">Benefícios</NavLink>
          <NavLink href="#funcionalidades">Funcionalidades</NavLink>
          <NavLink href="#depoimentos">Depoimentos</NavLink>
          <NavLink href="#precos">Preços</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" className="border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button className="bg-[#70645C] text-white hover:bg-[#5A534B]">Começar Grátis</Button>
          </Link>
        </div>

        <button className="md:hidden text-[#70645C]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white p-4">
          <nav className="flex flex-col space-y-4 py-4">
            <MobileNavLink href="#beneficios" onClick={() => setMobileMenuOpen(false)}>
              Benefícios
            </MobileNavLink>
            <MobileNavLink href="#funcionalidades" onClick={() => setMobileMenuOpen(false)}>
              Funcionalidades
            </MobileNavLink>
            <MobileNavLink href="#depoimentos" onClick={() => setMobileMenuOpen(false)}>
              Depoimentos
            </MobileNavLink>
            <MobileNavLink href="#precos" onClick={() => setMobileMenuOpen(false)}>
              Preços
            </MobileNavLink>
            <MobileNavLink href="#faq" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </MobileNavLink>

            <div className="flex flex-col space-y-3 pt-4 border-t border-[#70645C]/10">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro" className="w-full">
                <Button className="w-full bg-[#70645C] text-white hover:bg-[#5A534B]">Começar Grátis</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[#0f172a] hover:text-[#70645C] font-medium transition-colors">
      {children}
    </Link>
  )
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[#0f172a] hover:text-[#70645C] font-medium text-lg py-2 transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-b from-white to-[#f9fafb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#0f172a] leading-tight">
              Gerencie seus projetos de marcenaria com <span className="text-[#70645C]">eficiência</span> e{" "}
              <span className="text-[#70645C]">precisão</span>
            </h1>
            <p className="mt-6 text-xl text-[#475569]">
              O Marcenaria PRO é o sistema completo para gestão de projetos, clientes e finanças da sua marcenaria.
              Aumente sua produtividade e reduza erros.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/cadastro">
                <Button className="w-full sm:w-auto bg-[#70645C] text-white hover:bg-[#5A534B] h-12 px-8 text-base">
                  Começar Grátis por 14 dias
                </Button>
              </Link>
              <Link href="#demonstracao">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10 h-12 px-8 text-base"
                >
                  Ver demonstração
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center text-sm text-[#475569]">
              <CheckCircle size={16} className="text-[#70645C] mr-2" />
              <span>Não precisa de cartão de crédito</span>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-[#70645C]/10">
              <img src="/marcenaria-dashboard.png" alt="Dashboard Marcenaria PRO" className="w-full h-auto" />
            </div>
            <div className="absolute -z-10 top-1/2 right-1/2 w-[200%] aspect-square bg-[#70645C]/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const benefits = [
    {
      title: "Aumente sua produtividade",
      description: "Gerencie todos os seus projetos em um só lugar, com visão clara de prazos e responsáveis.",
      icon: "/brown-productivity-icon.png",
    },
    {
      title: "Reduza erros de medição",
      description: "Registre todas as medidas com precisão e evite retrabalho e desperdício de material.",
      icon: "/brown-measurement-icon.png",
    },
    {
      title: "Melhore a comunicação",
      description: "Compartilhe projetos com clientes e colaboradores, mantendo todos atualizados.",
      icon: "/brown-communication-icon.png",
    },
    {
      title: "Controle financeiro",
      description: "Acompanhe orçamentos, pagamentos e lucros de cada projeto com facilidade.",
      icon: "/brown-finance-icon.png",
    },
    {
      title: "Gestão de clientes",
      description: "Mantenha um cadastro completo de clientes com histórico de projetos e preferências.",
      icon: "/placeholder.svg?height=48&width=48&query=customer management icon in brown color",
    },
    {
      title: "Acesso de qualquer lugar",
      description: "Acesse seus projetos de qualquer dispositivo, a qualquer hora, de qualquer lugar.",
      icon: "/placeholder.svg?height=48&width=48&query=cloud access icon in brown color",
    },
  ]

  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Por que escolher o <span className="text-[#70645C]">Marcenaria PRO</span>?
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Desenvolvido especialmente para marcenarias, nosso sistema resolve os desafios específicos do seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-[#f9fafb] p-6 rounded-xl border border-[#70645C]/10 hover:shadow-md transition-shadow"
            >
              <img src={benefit.icon || "/placeholder.svg"} alt={benefit.title} className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold text-[#0f172a] mb-2">{benefit.title}</h3>
              <p className="text-[#475569]">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-20 bg-[#f9fafb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Funcionalidades <span className="text-[#70645C]">completas</span> para sua marcenaria
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Tudo o que você precisa para gerenciar projetos, clientes e equipe em uma única plataforma.
          </p>
        </div>

        <Tabs defaultValue="projetos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-transparent">
            <TabsTrigger value="projetos" className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white">
              Projetos
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white">
              Clientes
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white">
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="equipe" className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white">
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projetos" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Gestão completa de projetos</h3>
                <ul className="space-y-4">
                  {[
                    "Kanban visual para acompanhamento de etapas",
                    "Registro detalhado de medidas e especificações",
                    "Galeria de imagens e arquivos para cada projeto",
                    "Cronograma com prazos e alertas",
                    "Compartilhamento de projetos com clientes",
                    "Histórico completo de alterações",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={20} className="text-[#70645C] mr-2 mt-1 flex-shrink-0" />
                      <span className="text-[#475569]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2 rounded-xl overflow-hidden shadow-lg border border-[#70645C]/10">
                <img
                  src="/placeholder.svg?height=500&width=700&query=project management kanban board for woodworking projects"
                  alt="Gestão de Projetos"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clientes" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-xl overflow-hidden shadow-lg border border-[#70645C]/10">
                <img
                  src="/placeholder.svg?height=500&width=700&query=customer management dashboard for woodworking business"
                  alt="Gestão de Clientes"
                  className="w-full h-auto"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Gestão eficiente de clientes</h3>
                <ul className="space-y-4">
                  {[
                    "Cadastro completo com dados e preferências",
                    "Histórico de projetos e interações",
                    "Envio automático de atualizações",
                    "Área do cliente para acompanhamento",
                    "Gestão de aprovações e feedback",
                    "Notificações personalizadas",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={20} className="text-[#70645C] mr-2 mt-1 flex-shrink-0" />
                      <span className="text-[#475569]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financeiro" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Controle financeiro completo</h3>
                <ul className="space-y-4">
                  {[
                    "Orçamentos detalhados com materiais e mão de obra",
                    "Controle de pagamentos e parcelas",
                    "Relatórios de lucratividade por projeto",
                    "Gestão de custos de materiais",
                    "Previsão financeira e fluxo de caixa",
                    "Exportação de relatórios financeiros",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={20} className="text-[#70645C] mr-2 mt-1 flex-shrink-0" />
                      <span className="text-[#475569]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2 rounded-xl overflow-hidden shadow-lg border border-[#70645C]/10">
                <img
                  src="/placeholder.svg?height=500&width=700&query=financial dashboard for woodworking business with charts"
                  alt="Controle Financeiro"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipe" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-xl overflow-hidden shadow-lg border border-[#70645C]/10">
                <img
                  src="/placeholder.svg?height=500&width=700&query=team management dashboard for woodworking business"
                  alt="Gestão de Equipe"
                  className="w-full h-auto"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Gestão eficiente de equipe</h3>
                <ul className="space-y-4">
                  {[
                    "Atribuição de tarefas e responsabilidades",
                    "Controle de produtividade por colaborador",
                    "Comunicação interna integrada",
                    "Níveis de acesso personalizados",
                    "Calendário compartilhado de atividades",
                    "Avaliação de desempenho",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={20} className="text-[#70645C] mr-2 mt-1 flex-shrink-0" />
                      <span className="text-[#475569]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "O Marcenaria PRO transformou meu negócio. Reduzi erros de medição em 90% e aumentei minha produtividade em mais de 30%.",
      author: "Carlos Silva",
      role: "Proprietário, Móveis Silva",
      avatar: "/placeholder.svg?height=64&width=64&query=middle aged man with beard",
    },
    {
      quote:
        "Meus clientes adoram poder acompanhar o progresso dos projetos. A comunicação melhorou muito e o número de alterações de última hora diminuiu drasticamente.",
      author: "Ana Oliveira",
      role: "Gerente, Marcenaria Moderna",
      avatar: "/placeholder.svg?height=64&width=64&query=professional woman with short hair",
    },
    {
      quote:
        "O controle financeiro do sistema é excelente. Agora sei exatamente a margem de lucro de cada projeto e posso precificar com mais precisão.",
      author: "Roberto Santos",
      role: "Diretor, RS Planejados",
      avatar: "/placeholder.svg?height=64&width=64&query=older man with glasses",
    },
  ]

  return (
    <section id="depoimentos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            O que nossos <span className="text-[#70645C]">clientes</span> dizem
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Centenas de marcenarias já transformaram sua gestão com o Marcenaria PRO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#f9fafb] p-6 rounded-xl border border-[#70645C]/10 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-[#0f172a]">{testimonial.author}</h4>
                  <p className="text-sm text-[#475569]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-[#475569] italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-[#70645C]/10">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 text-[#70645C]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="mt-2 text-[#475569]">
            <span className="font-semibold">4.9/5</span> baseado em mais de{" "}
            <span className="font-semibold">200 avaliações</span>
          </p>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: "Básico",
      price: "R$ 97",
      period: "/mês",
      description: "Ideal para marcenarias iniciantes",
      features: [
        "Até 10 projetos ativos",
        "Até 2 usuários",
        "Gestão de clientes",
        "Gestão básica de projetos",
        "Compartilhamento com clientes",
        "Suporte por email",
      ],
      cta: "Começar Grátis",
      popular: false,
    },
    {
      name: "Profissional",
      price: "R$ 197",
      period: "/mês",
      description: "Perfeito para marcenarias em crescimento",
      features: [
        "Projetos ilimitados",
        "Até 5 usuários",
        "Gestão avançada de projetos",
        "Controle financeiro completo",
        "Relatórios personalizados",
        "Suporte prioritário",
        "Backup diário",
      ],
      cta: "Começar Grátis",
      popular: true,
    },
    {
      name: "Empresarial",
      price: "R$ 347",
      period: "/mês",
      description: "Para marcenarias de médio e grande porte",
      features: [
        "Projetos ilimitados",
        "Usuários ilimitados",
        "Gestão avançada de projetos",
        "Controle financeiro completo",
        "Relatórios avançados",
        "API para integração",
        "Suporte VIP",
        "Treinamento personalizado",
      ],
      cta: "Começar Grátis",
      popular: false,
    },
  ]

  return (
    <section id="precos" className="py-20 bg-[#f9fafb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Planos <span className="text-[#70645C]">acessíveis</span> para sua marcenaria
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Escolha o plano ideal para o tamanho e necessidades do seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                bg-white rounded-xl overflow-hidden border transition-all
                ${
                  plan.popular
                    ? "border-[#70645C] shadow-lg scale-105 md:scale-110 z-10"
                    : "border-[#70645C]/10 hover:shadow-md"
                }
              `}
            >
              {plan.popular && <div className="bg-[#70645C] text-white text-center py-2 font-medium">Mais Popular</div>}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#0f172a]">{plan.name}</h3>
                <p className="text-[#475569] mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#0f172a]">{plan.price}</span>
                  <span className="text-[#475569]">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={18} className="text-[#70645C] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-[#475569]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cadastro">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-[#70645C] text-white hover:bg-[#5A534B]"
                        : "bg-white border border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[#475569]">Todos os planos incluem teste gratuito de 14 dias. Sem compromisso.</p>
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  const faqs = [
    {
      question: "Preciso instalar algum software?",
      answer:
        "Não, o Marcenaria PRO é um sistema 100% online (SaaS). Você pode acessar de qualquer dispositivo com conexão à internet, sem necessidade de instalação ou configuração complexa.",
    },
    {
      question: "Como funciona o período de teste gratuito?",
      answer:
        "Você tem acesso a todas as funcionalidades do plano escolhido por 14 dias, sem compromisso. Não é necessário cartão de crédito para começar. Ao final do período, você pode escolher assinar ou cancelar sem custos.",
    },
    {
      question: "Posso mudar de plano depois?",
      answer:
        "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.",
    },
    {
      question: "Meus dados estão seguros?",
      answer:
        "Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos rigorosos protocolos de segurança. Realizamos backups diários e nossos servidores são monitorados 24/7.",
    },
    {
      question: "Oferecem treinamento para minha equipe?",
      answer:
        "Sim, todos os planos incluem acesso à nossa base de conhecimento e vídeos tutoriais. Os planos Profissional e Empresarial incluem sessões de treinamento personalizadas.",
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer:
        "Sim, não há contratos de fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Perguntas <span className="text-[#70645C]">frequentes</span>
          </h2>
          <p className="mt-4 text-lg text-[#475569]">Tire suas dúvidas sobre o Marcenaria PRO.</p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-[#70645C]/10">
          {faqs.map((faq, index) => (
            <details key={index} className="group py-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-lg text-[#0f172a] list-none">
                {faq.question}
                <span className="transition group-open:rotate-180">
                  <ChevronDown size={20} className="text-[#70645C]" />
                </span>
              </summary>
              <p className="mt-3 text-[#475569] group-open:animate-fadeIn">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[#475569]">
            Ainda tem dúvidas?{" "}
            <a href="#contato" className="text-[#70645C] font-medium hover:underline">
              Entre em contato
            </a>{" "}
            com nossa equipe.
          </p>
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section id="contato" className="py-20 bg-[#70645C]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para transformar a gestão da sua marcenaria?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de marcenarias que já estão economizando tempo, reduzindo erros e aumentando a
            satisfação dos clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button className="w-full sm:w-auto bg-white text-[#70645C] hover:bg-white/90 h-12 px-8 text-base">
                Começar Grátis por 14 dias
              </Button>
            </Link>
            <Link href="#demonstracao">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 h-12 px-8 text-base"
              >
                Agendar Demonstração
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-white/80 text-sm">Não precisa de cartão de crédito • Cancele quando quiser</p>
        </div>
      </div>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="bg-[#0f172a] text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className="mt-4 text-white/60 text-sm">
              Sistema completo para gestão de projetos, clientes e finanças da sua marcenaria.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <a href="#beneficios" className="text-white/60 hover:text-white">
                  Benefícios
                </a>
              </li>
              <li>
                <a href="#funcionalidades" className="text-white/60 hover:text-white">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#precos" className="text-white/60 hover:text-white">
                  Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="text-white/60 hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Sobre nós
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="#contato" className="text-white/60 hover:text-white">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Termos de Serviço
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} Marcenaria PRO. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
