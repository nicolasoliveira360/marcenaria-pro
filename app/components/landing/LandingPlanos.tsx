import { CheckCircle } from "lucide-react"

const planos = [
  {
    nome: "Mensal",
    preco: "R$ 99,90",
    periodo: "/mês",
    destaque: false,
    beneficios: [
      "Projetos ilimitados",
      "Clientes ilimitados",
      "Controle financeiro completo",
      "Portal do cliente",
      "Suporte prioritário",
    ],
    cta: "Contratar Mensal",
    link: "/cadastro",
  },
  {
    nome: "Anual",
    preco: "R$ 74,90",
    periodo: "/mês (pago anual)",
    destaque: true,
    beneficios: [
      "Projetos ilimitados",
      "Clientes ilimitados",
      "Controle financeiro completo",
      "Portal do cliente",
      "Suporte prioritário",
      "Economize 25% no ano",
    ],
    cta: "Contratar Anual",
    link: "/cadastro",
  },
]

export default function LandingPlanos() {
  return (
    <section id="planos" className="py-20 bg-[#f9fafb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Planos <span className="text-[#70645C]">acessíveis</span> para sua marcenaria
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Escolha o plano ideal para o tamanho e necessidades do seu negócio.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {planos.map((plano, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-xl overflow-hidden border transition-all ${
                plano.destaque
                  ? "border-[#70645C] shadow-lg scale-105 z-10"
                  : "border-[#70645C]/10 hover:shadow-md"
              }`}
            >
              {plano.destaque && (
                <div className="absolute -right-10 top-5 bg-[#16a34a] text-white text-xs px-10 py-1 rotate-45 font-medium">
                  Economize 25%
                </div>
              )}
              <div className="p-8">
                <h3 className="text-xl font-bold text-[#0f172a]">{plano.nome}</h3>
                <div className="mb-6 mt-2">
                  <span className="text-4xl font-bold text-[#0f172a]">{plano.preco}</span>
                  <span className="text-[#475569] ml-1">{plano.periodo}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plano.beneficios.map((beneficio, j) => (
                    <li key={j} className="flex items-start">
                      <CheckCircle size={18} className="text-[#70645C] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-[#475569]">{beneficio}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plano.link}
                  className={`block w-full text-center rounded-lg py-3 font-semibold transition-colors text-base ${
                    plano.destaque
                      ? "bg-[#70645C] text-white hover:bg-[#5A534B]"
                      : "bg-white border border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10"
                  }`}
                >
                  {plano.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-[#475569] text-sm">Profissionalize sua marcenaria com a Marcenaria PRO</p>
        </div>
      </div>
    </section>
  )
} 