import { Button } from "../../../components/ui/button"
import { Logo } from "../../../components/logo"
import Image from "next/image"
import { FaWhatsapp } from "react-icons/fa"

export default function LandingHero() {
  return (
    <>
      <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-b from-white to-[#f9fafb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <Logo />
            <h1 className="mt-8 text-4xl sm:text-5xl font-bold text-[#0f172a] leading-tight">
              Único sistema <span className="text-[#70645C]">100% pensado</span> para marcenarias.<br />
              <span className="text-[#70645C]">Chega de desorganização e prejuízo!</span>
            </h1>
            <p className="mt-6 text-xl text-[#475569]">
              Centralize projetos, clientes e finanças em um só lugar. Ganhe tempo, aumente o lucro e encante seus clientes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a href="/cadastro">
                <Button className="w-full sm:w-auto bg-[#70645C] text-white hover:bg-[#5A534B] h-12 px-8 text-base animate-bounce">
                  Quero organizar minha marcenaria!
                </Button>
              </a>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <Image
              src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=700&q=80"
              alt="Dashboard MarcenariaPRO"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl border border-[#70645C]/10 object-cover"
              priority
            />
            <div className="absolute -z-10 top-1/2 right-1/2 w-[200%] aspect-square bg-[#70645C]/5 rounded-full blur-3xl" />
          </div>
        </div>
      </section>
      {/* Ícone flutuante do WhatsApp */}
      <a
        href="https://wa.me/5543996096047?text=Quero%20falar%20com%20um%20especialista%20do%20MarcenariaPRO"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 bottom-6 right-6 bg-[#25D366] rounded-full shadow-lg p-4 hover:scale-110 transition-transform"
        aria-label="Fale conosco no WhatsApp"
      >
        <FaWhatsapp size={32} color="#fff" />
      </a>
    </>
  )
} 