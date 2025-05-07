"use client"

// Nova landing page será composta por componentes menores em app/components/landing/
// O conteúdo antigo foi removido para dar lugar à nova estrutura.

import LandingHero from "./components/landing/LandingHero"
import LandingDores from "./components/landing/LandingDores"
import LandingFuncionalidades from "./components/landing/LandingFuncionalidades"
import LandingDepoimentos from "./components/landing/LandingDepoimentos"
import LandingPlanos from "./components/landing/LandingPlanos"
import LandingCtaFinal from "./components/landing/LandingCtaFinal"
import LandingFooter from "./components/landing/LandingFooter"
import { Logo } from "../components/logo"
import Link from "next/link"
import { Button } from "../components/ui/button"

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#70645C]/10 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" className="border-[#70645C] text-[#70645C] hover:bg-[#70645C]/10">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button className="bg-[#70645C] text-white hover:bg-[#5A534B]">Cadastrar-se</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />
      <LandingHero />
      <LandingDores />
      <LandingFuncionalidades />
      <LandingDepoimentos />
      <LandingPlanos />
      <LandingCtaFinal />
      <LandingFooter />
    </div>
  )
}
