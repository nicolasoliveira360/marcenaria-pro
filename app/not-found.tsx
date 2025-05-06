import Link from "next/link"
import { Logo } from "@/components/logo"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#70645C]">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">Página não encontrada</h2>
          <p className="text-gray-600 mt-2 max-w-md">A página que você está procurando não existe ou foi removida.</p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-[#70645C] text-white rounded-md hover:bg-[#5d534c] transition-colors"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Marcenaria PRO. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
