# Scripts de Migração

## Script para Adicionar Colunas Lastlink

O arquivo `add-lastlink-columns.sql` contém um script SQL para adicionar as colunas necessárias para integração com o Lastlink à tabela `companies` e criar outras tabelas relacionadas.

### Resumo das alterações

O script realiza as seguintes alterações:

1. Cria os tipos enumerados necessários:
   - `plan_enum`: 'free' ou 'paid'
   - `billing_interval_enum`: 'monthly' ou 'annual'
   - `lastlink_status_enum`: 'incomplete', 'active', 'past_due', 'canceled', 'expired'

2. Adiciona as colunas à tabela `companies`:
   - `plan`: plano atual (free ou paid)
   - `billing_interval`: intervalo de faturamento (monthly ou annual)
   - `lastlink_status`: status da assinatura
   - `current_period_end`: data de término do período atual
   - `tax_id`: CPF/CNPJ

3. Cria as tabelas adicionais:
   - `lastlink_subscriptions`: para armazenar dados de assinaturas
   - `lastlink_products`: para armazenar informações de produtos
   - `lastlink_events`: para registrar eventos do Lastlink

4. Insere os produtos Lastlink predefinidos:
   - Mensal: 'CC84FA160'
   - Anual: 'C11C022E9'

### Como executar

Você pode executar este script de duas maneiras:

#### 1. Usando o Studio do Supabase

1. Acesse o Supabase Studio do seu projeto
2. Navegue até a seção SQL Editor
3. Cole o conteúdo do arquivo `add-lastlink-columns.sql`
4. Execute o script

#### 2. Usando Migration com Supabase CLI

Se você estiver usando o Supabase CLI para migrations:

1. Coloque o arquivo em sua pasta de migrações
2. Execute:

```bash
supabase db push
```

### Solução de problemas na página de faturamento

Se você estiver vendo erros na página de faturamento relacionados a colunas ausentes, é provável que este script de migração precise ser executado. 