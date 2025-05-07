import { CheckCircle } from "lucide-react"

const dores = [
  {
    title: "Desorganização de projetos",
    description: "Dificuldade para acompanhar o andamento, prazos e responsáveis. Tudo se perde em planilhas e papéis.",
    icon: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80",
  },
  {
    title: "Erros de orçamento e retrabalho",
    description: "Orçamentos imprecisos, esquecidos ou perdidos. Retrabalho e desperdício de material viram rotina.",
    icon: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=80&q=80",
  },
  {
    title: "Falta de controle financeiro",
    description: "Não sabe quanto realmente lucra em cada projeto. Perde prazos de cobrança e deixa dinheiro na mesa.",
    icon: "https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?auto=format&fit=crop&w=80&q=80",
  },
]

export default function LandingDores() {
  return (
    <section className="py-20 bg-white" id="dores">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Chega de <span className="text-[#70645C]">desorganização</span> e prejuízo
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Veja como o MarcenariaPRO resolve as principais dores do seu dia a dia:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dores.map((dor, i) => (
            <div
              key={i}
              className="group bg-[#f9fafb] p-6 rounded-xl border border-[#70645C]/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            >
              <img src={dor.icon} alt={dor.title} className="w-12 h-12 mb-4 rounded-full object-cover" />
              <h3 className="text-xl font-semibold text-[#0f172a] mb-2 group-hover:text-[#70645C] transition-colors">
                {dor.title}
              </h3>
              <p className="text-[#475569] mb-4">{dor.description}</p>
              <div className="flex items-center text-[#70645C] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle size={18} className="mr-2" />
                Resolvido com MarcenariaPRO
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 