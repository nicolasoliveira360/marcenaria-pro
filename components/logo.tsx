import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 bg-[#70645C] text-white font-bold text-xl rounded-lg">
        M
      </div>
      <span className="text-xl font-bold text-[#0f172a]">Marcenaria PRO</span>
    </Link>
  )
}
