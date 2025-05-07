"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/hooks/use-supabase'
import { Lock, CreditCard, Star, ArrowUpRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface GlobalCrudProtectionProps {
  children: React.ReactNode
}

export function GlobalCrudProtection({ children }: GlobalCrudProtectionProps) {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [hasPremium, setHasPremium] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [minimized, setMinimized] = useState(false)
  
  // Verificar o status do plano diretamente do banco de dados
  useEffect(() => {
    async function checkPremiumStatus() {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        // Buscar o vínculo do usuário com a empresa
        const { data: userRole } = await supabase
          .from('company_user_roles')
          .select('company_id')
          .eq('user_id', user.id)
          .single()
        
        if (!userRole?.company_id) {
          setIsLoading(false)
          return
        }
        
        // Buscar dados da empresa para verificar o plano
        const { data: company } = await supabase
          .from('companies')
          .select('plan')
          .eq('id', userRole.company_id)
          .single()
        
        // Verificar se tem plano ativo (apenas verifica se é 'paid')
        const isPremium = !!(company && company.plan === 'paid')
        console.log('Status do plano:', company?.plan, 'Premium:', isPremium)
        
        setHasPremium(isPremium)
      } catch (error) {
        console.error('Erro ao verificar status premium:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkPremiumStatus()
  }, [supabase, user])
  
  // Mostrar notificação apenas na primeira carga
  useEffect(() => {
    if (!isLoading && !hasPremium && firstLoad) {
      setFirstLoad(false)
    }
  }, [isLoading, hasPremium, firstLoad])
  
  if (isLoading) {
    return <>{children}</>
  }
  
  if (hasPremium) {
    return <>{children}</>
  }
  
  // Mostrar um banner de aviso no topo quando não tem plano premium
  return (
    <div className="relative">
      <AnimatePresence>
        {!minimized ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-50 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 py-3 px-4 shadow-sm"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <Lock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900 text-sm">Funcionalidades Premium Bloqueadas</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Ative seu plano premium para desbloquear todo poder da Marcenaria PRO.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm" 
                  className="text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800"
                  onClick={() => setMinimized(true)}
                >
                  Depois
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-md hover:shadow-lg transition-all"
                  onClick={() => router.push("/dashboard/faturamento")}
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Ativar Premium
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="sticky top-0 z-50 bg-amber-50 py-1.5 px-4 border-b border-amber-200 cursor-pointer"
            onClick={() => setMinimized(false)}
          >
            <div className="container mx-auto flex items-center justify-center">
              <div className="flex items-center gap-2 text-amber-700 text-xs">
                <Lock className="h-3 w-3" />
                <span>Algumas funcionalidades estão bloqueadas</span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs font-medium text-amber-700 hover:text-amber-900"
                >
                  <span className="flex items-center">Ver detalhes <ArrowUpRight className="ml-1 h-3 w-3" /></span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </div>
  )
} 