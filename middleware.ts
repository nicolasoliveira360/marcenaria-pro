import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Configuração de rotas que necessitam de verificação de plano premium
const PROTECTED_CRUD_ROUTES = [
  '/api/clients',     // Rotas para clientes
  '/api/projects',    // Rotas para projetos
  '/api/collaborators', // Rotas para colaboradores
  '/api/files',       // Rotas para arquivos
]

// Função para verificar se é uma rota de CRUD protegida
function isCrudProtectedPath(path: string): boolean {
  return PROTECTED_CRUD_ROUTES.some(route => path.startsWith(route))
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se o usuário não estiver autenticado e estiver tentando acessar uma rota protegida
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se o usuário estiver autenticado e estiver tentando acessar login/cadastro
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/cadastro")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  // Verificar se é uma rota de API de CRUD que precisa ser protegida
  if (isCrudProtectedPath(req.nextUrl.pathname)) {
    try {
      // Verificar se há sessão
      if (!session) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      }
      
      // Obter o ID do usuário
      const userId = session.user.id
      
      // Buscar a empresa associada ao usuário
      const { data: userRole } = await supabase
        .from('company_user_roles')
        .select('company_id')
        .eq('user_id', userId)
        .single()
      
      if (!userRole?.company_id) {
        return NextResponse.json({ error: 'Usuário não está associado a uma empresa' }, { status: 403 })
      }
      
      // Buscar dados da empresa para verificar o plano
      const { data: company } = await supabase
        .from('companies')
        .select('plan')
        .eq('id', userRole.company_id)
        .single()
      
      // Verificar se tem plano pago
      const hasPremiumPlan = company && company.plan === 'paid'
      
      if (!hasPremiumPlan) {
        return NextResponse.json({ 
          error: 'Plano necessário', 
          message: 'É necessário um plano pago para realizar esta operação',
          code: 'SUBSCRIPTION_REQUIRED'
        }, { status: 403 })
      }
    } catch (error) {
      console.error('Erro no middleware de CRUD:', error)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/cadastro", "/api/clients/:path*", "/api/projects/:path*", "/api/collaborators/:path*", "/api/files/:path*"],
}
