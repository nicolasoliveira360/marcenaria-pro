import { Star } from "lucide-react"

const depoimentos = [
  {
    quote: "Reduzi em 70% o tempo gasto com orçamentos e acompanhamento de projetos.",
    author: "João Batista",
    role: "Proprietário, JB Marcenaria",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote: "Aumentei minha carteira de clientes em 40% mantendo a mesma equipe.",
    author: "Maria Fernanda",
    role: "Gestora, Móveis Planejados MF",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote: "Meus clientes adoram poder acompanhar o progresso dos seus móveis diretamente pelo sistema.",
    author: "Carlos Souza",
    role: "Diretor, Souza & Filhos",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    quote: "Acabaram-se os problemas de comunicação entre escritório e oficina.",
    author: "Patrícia Lima",
    role: "Sócia, Marcenaria Lima",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    quote: "Finalmente tenho controle real sobre meus custos e margem de lucro em cada projeto.",
    author: "Roberto Dias",
    role: "Empresário, RD Móveis",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
  },
]

export default function LandingDepoimentos() {
  return (
    <section id="depoimentos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            O que nossos clientes dizem
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Marcenarias de todo o Brasil já transformaram sua gestão com o MarcenariaPRO.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {depoimentos.map((dep, i) => (
            <div
              key={i}
              className="bg-[#f9fafb] p-6 rounded-xl border border-[#70645C]/10 shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
            >
              <div className="flex items-center mb-4">
                <img
                  src={dep.avatar}
                  alt={dep.author}
                  className="w-12 h-12 rounded-full mr-4 object-cover border border-[#70645C]/20"
                />
                <div>
                  <h4 className="font-semibold text-[#0f172a]">{dep.author}</h4>
                  <p className="text-sm text-[#475569]">{dep.role}</p>
                </div>
              </div>
              <p className="text-[#475569] italic mb-2">"{dep.quote}"</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-[#70645C]/10">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 text-[#70645C] fill-[#70645C]" />
            ))}
          </div>
          <p className="mt-2 text-[#475569]">
            <span className="font-semibold">4.9/5</span> de satisfação entre marcenarias de todo o Brasil
          </p>
        </div>
      </div>
    </section>
  )
} 