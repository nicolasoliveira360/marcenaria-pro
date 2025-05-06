import { Logo } from "@/components/logo"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#70645C] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando projeto...</p>
        </div>
      </main>
    </div>
  )
}
