import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { CheckCircle } from "lucide-react"

const categoriasTabs = [
  {
    key: "projetos",
    title: "Gestão de Projetos",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Kanban visual para acompanhar etapas e prazos",
      "Catálogo de projetos com detalhamento completo",
      "Gestão de tarefas e cronograma",
      "Galeria de fotos dos projetos",
    ],
    description:
      "Organize, acompanhe e otimize todos os seus projetos em um só lugar, com visão clara de prazos, responsáveis e status.",
  },
  {
    key: "clientes",
    title: "Gestão de Clientes",
    image: "https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Cadastro completo de clientes",
      "Histórico de projetos por cliente",
      "Filtros avançados e busca inteligente",
      "Proteção de dados sensíveis",
    ],
    description:
      "Tenha controle total sobre sua carteira de clientes, histórico de projetos e preferências, com segurança e praticidade.",
  },
  {
    key: "portal",
    title: "Portal do Cliente",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Acesso exclusivo para clientes acompanharem o projeto",
      "Transparência e comunicação facilitada",
      "Redução de ligações e dúvidas",
    ],
    description:
      "Ofereça uma experiência diferenciada para seus clientes, com acompanhamento online e comunicação transparente.",
  },
  {
    key: "equipe",
    title: "Equipe & Colaboradores",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Gestão de usuários e permissões",
      "Acompanhamento de atividades",
      "Controle de produtividade",
    ],
    description:
      "Gerencie sua equipe de forma eficiente, atribua tarefas e acompanhe o desempenho de cada colaborador.",
  },
]

const categoriasCards = [
  {
    key: "financeiro",
    title: "Financeiro & Pagamentos",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Controle de orçamentos e custos",
      "Gestão de pagamentos e parcelas",
      "Alertas automáticos de cobrança",
      "Relatórios de lucratividade",
    ],
    description:
      "Tenha controle financeiro preciso, visualize margens de lucro e mantenha as finanças da sua marcenaria sempre em dia.",
  },
  {
    key: "dashboard",
    title: "Dashboard & Relatórios",
    image: "https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Visão 360° do negócio",
      "Indicadores de performance",
      "Filtros por período e status",
      "Alertas inteligentes",
    ],
    description:
      "Tome decisões baseadas em dados, acompanhe indicadores e visualize o status do seu negócio em tempo real.",
  },
  {
    key: "seguranca",
    title: "Segurança & Acesso",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    bullets: [
      "Acesso de qualquer lugar, a qualquer hora",
      "Backups automáticos",
      "Proteção de dados e permissões personalizadas",
    ],
    description:
      "Seu negócio protegido com tecnologia de ponta, backups automáticos e acesso seguro em qualquer dispositivo.",
  },
]

export default function LandingFuncionalidades() {
  return (
    <>
      {/* Seção 1: Tabs */}
      <section className="py-20 bg-[#f9fafb]" id="funcionalidades">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
              Acabe com a desorganização e o retrabalho
            </h2>
            <p className="mt-4 text-lg text-[#475569]">
              Centralize projetos, clientes, equipe e atendimento em um só lugar.
            </p>
          </div>
          <Tabs defaultValue={categoriasTabs[0].key} className="w-full">
            <TabsList className="flex flex-wrap gap-1 mb-10 bg-transparent px-1 sm:px-0">
              {categoriasTabs.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  className="data-[state=active]:bg-[#70645C] data-[state=active]:text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap min-w-[90px] sm:min-w-[120px]"
                >
                  {cat.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {categoriasTabs.map((cat) => (
              <TabsContent key={cat.key} value={cat.key} className="mt-0">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="order-2 lg:order-1 w-full">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-3 sm:mb-4 mt-6 lg:mt-0">
                      {cat.title}
                    </h3>
                    <p className="text-[#475569] mb-5 sm:mb-6 text-base sm:text-lg">
                      {cat.description}
                    </p>
                    <ul className="space-y-3 sm:space-y-4">
                      {cat.bullets.map((item, i) => (
                        <li key={i} className="flex items-start text-sm sm:text-base">
                          <CheckCircle size={20} className="text-[#70645C] mr-2 mt-1 flex-shrink-0" />
                          <span className="text-[#475569]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-1 lg:order-2 w-full flex justify-center items-center mb-6 lg:mb-0">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full max-w-[420px] h-auto object-cover rounded-xl shadow-lg border border-[#70645C]/10"
                      loading="lazy"
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Seção 2: Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
              Tenha controle total e segurança no seu negócio
            </h2>
            <p className="mt-4 text-lg text-[#475569]">
              Controle financeiro, inteligência de dados e proteção para sua marcenaria crescer sem sustos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoriasCards.map((cat) => (
              <div
                key={cat.key}
                className="bg-[#f9fafb] p-6 rounded-xl border border-[#70645C]/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full max-w-[400px] h-56 object-cover rounded-lg mb-4 shadow-md"
                  loading="lazy"
                />
                <h3 className="text-lg font-semibold text-[#0f172a] mb-2 group-hover:text-[#70645C] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[#475569] text-sm mb-3">{cat.description}</p>
                <ul className="space-y-2">
                  {cat.bullets.map((item, i) => (
                    <li key={i} className="flex items-start justify-center text-sm">
                      <CheckCircle size={18} className="text-[#70645C] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-[#475569]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
} 