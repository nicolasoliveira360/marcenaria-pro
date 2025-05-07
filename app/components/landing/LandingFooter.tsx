import { Logo } from "../../../components/logo"

export default function LandingFooter() {
  return (
    <footer className="bg-[#0f172a] text-white py-10">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <Logo className="mb-3" />
        <p className="text-white/70 text-sm mb-2 text-center">
          Marcenaria PRO — Sistema completo para gestão de projetos, clientes e finanças da sua marcenaria.
        </p>
        <p className="text-white/40 text-xs text-center">
          © {new Date().getFullYear()} Marcenaria PRO. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
} 