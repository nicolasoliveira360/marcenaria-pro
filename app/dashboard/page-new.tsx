import { SubscriptionInfo } from '@/components/subscription-info'

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Painel de Controle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Outros componentes do painel */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Projetos recentes</h2>
            <p className="text-gray-500">Seus projetos aparecerão aqui...</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <SubscriptionInfo />
          
          {/* Outros cards laterais */}
        </div>
      </div>
    </div>
  )
} 