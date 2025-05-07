import { useSubscription } from '@/hooks/use-subscription'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'

export function SubscriptionInfo() {
  const { subscription, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados da Assinatura</CardTitle>
          <CardDescription>Informações sobre sua assinatura</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os dados da assinatura.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = () => {
    const statusMap = {
      active: { label: 'Ativa', variant: 'success' },
      past_due: { label: 'Pagamento pendente', variant: 'warning' },
      canceled: { label: 'Cancelada', variant: 'destructive' },
      expired: { label: 'Expirada', variant: 'destructive' },
      incomplete: { label: 'Incompleta', variant: 'secondary' }
    }

    const status = statusMap[subscription.status] || statusMap.incomplete
    return (
      <Badge variant={status.variant as any} className="ml-2">
        {status.label}
      </Badge>
    )
  }

  const getPlanBadge = () => {
    if (subscription.plan === 'paid') {
      return (
        <Badge variant="premium" className="uppercase">
          {subscription.billingInterval === 'annual' ? 'Anual' : 'Mensal'}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="uppercase">
        Gratuito
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Assinatura {getStatusBadge()}
        </CardTitle>
        <CardDescription>Detalhes do seu plano atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-sm">Plano</h3>
          <div className="mt-1 flex items-center">
            {getPlanBadge()}
            {subscription.isPaid && (
              <span className="text-sm text-muted-foreground ml-2">
                {subscription.billingInterval === 'annual' ? 'Cobrança anual' : 'Cobrança mensal'}
              </span>
            )}
          </div>
        </div>

        {subscription.isPaid && subscription.formattedPeriodEnd && (
          <div>
            <h3 className="font-medium text-sm">Próxima renovação</h3>
            <p className="text-sm">{subscription.formattedPeriodEnd}</p>
          </div>
        )}

        {!subscription.isPaid && (
          <div>
            <h3 className="font-medium text-sm">Limite do plano gratuito</h3>
            <p className="text-sm text-muted-foreground">
              Até 3 projetos ativos
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <a
          href="https://lastlink.com/p/CC84FA160"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {subscription.isPaid ? 'Gerenciar assinatura' : 'Fazer upgrade para o plano pago'}
        </a>
      </CardFooter>
    </Card>
  )
} 