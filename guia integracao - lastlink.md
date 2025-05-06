# 🎟️ Integração Lastlink – Guia para o Front‑end (Cursor)

> **Contexto**: o back‑end Supabase já possui todas as tabelas, funções RPC e políticas RLS descritas abaixo. Seu trabalho é ligar o front‑end (Next.js + Supabase JS) a essa infra, sem inventar nomes ou colunas.

---

## 1. Visão Geral da Arquitetura

```text
Lastlink Checkout  ─▶  Webhook (Edge Function /api/lastlink-webhook)
                           │  (valida assinatura + chama funções SQL)
                           ▼
                    Supabase Postgres (tabelas abaixo)
                           ▲
Next.js Front‑end  ────────┘
```

* **Chave pública** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) no cliente.
* Todas as queries RLS‑safe – o front não usa Service Role.

---

## 2. Esquema de Dados (cheat‑sheet)

| Tabela                                                    | Colunas úteis no front‑end                                                                                                                                                                                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`companies`**                                           | `id` • `name` • `plan` `plan_enum('free','paid')` • `billing_interval` `billing_interval_enum('monthly','annual')` • `lastlink_status` `lastlink_status_enum('active','past_due','canceled','expired','incomplete')` • `current_period_end` *(timestamp)* |
| **`lastlink_subscriptions`**                              | `subscription_id` • `billing_interval` • `status` • `current_period_end`                                                                                                                                                                                  |
| **`lastlink_products`** *(read‑only)*                     | `product_id` • `billing_interval`                                                                                                                                                                                                                         |
| **`lastlink_events`** *(somente log – não usar no front)* | –                                                                                                                                                                                                                                                         |

### Enums

```sql
plan_enum              : 'free' | 'paid'
billing_interval_enum  : 'monthly' | 'annual'
lastlink_status_enum   : 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired'
```

---

## 3. Funções SQL já existentes (RPC)

| Nome                       | Para quê?                                  | Parâmetros                                                                            |
| -------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `handle_lastlink_active`   | Ativa / renova assinatura                  | `p_company_id uuid`, `p_sub_id text`, `p_product_id text`, `p_period_end timestamptz` |
| `handle_lastlink_past_due` | Marca como **past\_due** (fatura pendente) | `p_company_id`, `p_sub_id`, `p_period_end?`                                           |
| `handle_lastlink_canceled` | Cancela (plano volta a **free**)           | `p_company_id`, `p_sub_id`, `p_period_end?`                                           |
| `handle_lastlink_expired`  | Expira (plano volta a **free**)            | `p_company_id`, `p_sub_id`, `p_period_end?`                                           |

> **Você NÃO chama essas funções no front‑end**. Elas são usadas apenas pelo webhook. O que importa para a UI é refletir o conteúdo de `companies`.

---

## 4. Endpoints HTTP

| Método & Rota                                              | Quem usa | Descrição                                                                           |
| ---------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `POST /api/lastlink-webhook` *(ou Edge Function homônima)* | Lastlink | Recebe eventos, valida assinatura, chama funções RPC acima. Front‑end nunca acessa. |

---

## 5. Tarefas do Front‑end

### 5.1 Carregar status da assinatura

```ts
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(PROJECT_URL, PUBLIC_KEY)

export async function getCompany() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, plan, billing_interval, lastlink_status, current_period_end')
    .single()
  if (error) throw error
  return data
}
```

> **Observação**: a RLS garante que só virá a empresa corrente (campo `company_id` filtrado pelo middleware backend).

### 5.2 Componente `<BillingBadge>` (exemplo)

```tsx
// props: { plan, billing_interval, lastlink_status, nextRenewal }
// - plan === 'free'   → badge cinza  "Free"
// - active            → verde "Pago (mensal/anual)" + data de renovação
// - past_due          → amarelo "Pagamento pendente"
// - canceled/expired  → vermelho "Assinatura cancelada"
```

### 5.3 Botões de ação

| Situação                                   | Exibir Botão            | Ação                                                                                                    |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `plan='free'`                              | **Assinar**             | Redirecionar para *checkout* Lastlink do `product_id` **mensal** *(padrão)*.                            |
| `plan='paid'` & `lastlink_status='active'` | **Mudar periodicidade** | Link para checkout do outro `product_id`.<br>Ex.: se `billing_interval='monthly'`, use o product anual. |
| `past_due`                                 | **Pagar agora**         | Abrir a página Lastlink de pagamento / enviar e‑mail com boleto.                                        |
| `active`                                   | **Cancelar**            | Link de cancelamento Lastlink ou modal confirmando.                                                     |

> **Importante**: depois do retorno do checkout a Lastlink **NÃO** redireciona com status. A UI deve **ou**:
>
> 1. Polling (ex.: `getCompany()` a cada 10 s até `plan='paid'`), **ou**
> 2. Assinar **realtime**: `supabase.channel('companies').on('postgres_changes', …)` para a row da empresa.

### 5.4 Proteção de rotas / gating

```tsx
if (company.plan !== 'paid' || company.lastlink_status !== 'active') {
  router.push('/upgrade')
}
```

---

## 6. Mapeamento `product_id → billing_interval`

Coloque constante única em `lib/billing.ts` (use exatamente estes IDs):

```ts
export const PRODUCT_ID = {
  monthly: 'prod_monthly_123',
  annual : 'prod_annual_456',
} as const
```

*Se o backend mudar os IDs, **atualize só esta constante**.*

---

## 7. Boas práticas & Não‑Faça

* **NÃO** grave status localmente; sempre leia `companies`.
* **NÃO** expor Service Role Key.
* **NÃO** chamar diretamente as funções `handle_lastlink_*` no front.
* **SEMPRE** mostrar a data `current_period_end` em `America/Sao_Paulo`.
* Use **Tailwind** badges para cores consistentes: `bg-green-100 text-green-800`, `bg-yellow-100`, etc.

---

## 8. Checklist para concluir

* [ ] Constante `PRODUCT_ID` criada.
* [ ] Hook `useCompany()` para buscar + realtime.
* [ ] Página **/billing** com badge, detalhes e botões.
* [ ] Route Guard que bloqueia recursos premium se `plan !== 'paid' || lastlink_status !== 'active'`.
* [ ] Teste manual: mudar status via SQL (`update companies set lastlink_status='past_due'…`) e verificar UI.

---

### 🔑 Referência rápida de status

```text
company.plan             → 'free' | 'paid'
company.billing_interval → 'monthly' | 'annual' | null (se free)
company.lastlink_status  → 'active' | 'past_due' | 'canceled' | 'expired' | 'incomplete'
```

*Liberado ⇢ (`plan='paid'` **e** `lastlink_status='active'`)*

Boa implementação! Caso algo mude no back‑end, **consulte este documento primeiro** antes de criar novas colunas ou valores.
