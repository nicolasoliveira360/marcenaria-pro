# Documentação do Projeto Marcenaria Pro Cadastro

## 1. Visão Geral

O projeto é uma aplicação web completa para gerenciamento de projetos de marcenaria, construída com Next.js, Supabase (para banco de dados e autenticação), e Tailwind CSS para a interface. A aplicação permite o gerenciamento de empresas, projetos, clientes, colaboradores e pagamentos.

## 2. Tecnologias Principais

- **Frontend**: Next.js 15.x (App Router), React 19.x
- **UI**: Tailwind CSS, Radix UI (componentes acessíveis)
- **Backend/Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage
- **Integração de Pagamentos**: LastLink

## 3. Estrutura do Projeto

### 3.1 Diretórios Principais

- `/app`: Páginas e rotas da aplicação (Next.js App Router)
  - `/api`: Endpoints de API
  - `/dashboard`: Interface principal pós-login
  - `/login`, `/cadastro`: Fluxo de autenticação
  - `/p`: Rotas públicas de projetos
- `/components`: Componentes reutilizáveis
  - `/ui`: Componentes de UI (baseados em shadcn/ui)
- `/lib`: Utilidades e clientes
  - `/supabase`: Clientes e tipos para Supabase
- `/hooks`: Custom hooks
- `/public`: Ativos estáticos
- `/styles`: Estilos globais

### 3.2 Fluxos Principais

- **Autenticação**: Login, cadastro, recuperação de senha e convites
- **Dashboard**: Visão geral de projetos, clientes, tarefas e pagamentos
- **Projetos**: CRUD de projetos, status de progressão, tarefas e arquivos
- **Clientes**: Gerenciamento de clientes da empresa
- **Colaboradores**: Gerenciamento de usuários com acesso à empresa
- **Configurações**: Ajustes da empresa e integração de pagamentos

## 4. Banco de Dados (Supabase)

### 4.1 Esquema Principal (Schema `public`)

- **Usuários e Empresas**:
  - `users`: Informações de usuários
  - `companies`: Perfis de empresas com planos e dados de faturamento
  - `company_user_roles`: Relacionamento entre usuários e empresas (com controle de acesso)
  - `company_invites`: Convites para novos colaboradores

- **Clientes**:
  - `clients`: Clientes das empresas

- **Projetos e Tarefas**:
  - `projects`: Projetos da empresa
  - `project_status`: Status de progressão dos projetos
  - `project_task`: Tarefas associadas a cada status de projeto
  - `project_files`: Arquivos anexados aos projetos
  - `payments`: Pagamentos associados aos projetos

- **Status Macro**:
  - `macro_status`: Status predefinidos para projetos
  - `macro_status_task`: Tarefas predefinidas para cada status

- **Integração LastLink**:
  - `lastlink_events`: Eventos recebidos da LastLink
  - `lastlink_products`: Produtos do sistema de pagamento
  - `lastlink_subscriptions`: Assinaturas associadas às empresas
  - `plans`: Planos disponíveis na plataforma

### 4.2 Schemas Adicionais

- **Schema `storage`**: Gerencia o armazenamento de arquivos
- **Schema `realtime`**: Suporta funcionalidades de tempo real

## 5. Funcionalidades Principais

### 5.1 Autenticação e Autorização

- Sistema de login, cadastro e recuperação de senha
- Convites para colaboradores
- Middleware de proteção de rotas
- RLS (Row Level Security) no Supabase para segurança dos dados

### 5.2 Dashboard

- Visão geral de KPIs: projetos, clientes, valores, pagamentos
- Listagem de projetos recentes
- Tarefas pendentes
- Próximos pagamentos
- Filtros por período (mês, trimestre, ano)

### 5.3 Gerenciamento de Projetos

- Criação e edição de projetos
- Fluxo de status personalizável (kanban)
- Tarefas associadas a cada status
- Upload e gerenciamento de arquivos
- Controle de pagamentos

### 5.4 Gerenciamento de Clientes

- CRUD de clientes com informações de contato
- Associação de clientes a projetos

### 5.5 Colaboradores

- Convite e gerenciamento de colaboradores
- Controle de permissões por papel (role)

### 5.6 Compartilhamento Público

- Links públicos para projetos (protegidos por senha opcional)
- Visualização de status e progresso para clientes

### 5.7 Integração de Pagamentos (LastLink)

- Assinaturas para o sistema (planos free/paid)
- Webhook para processamento de eventos
- Controle de acesso baseado no status da assinatura

### 5.8 Configuração de Fluxos de Trabalho

- Sistema de definição de macro status para projetos
- Configuração de tarefas padrão para cada status
- Reordenação de status e tarefas
- Interface interativa para gerenciar fluxos de trabalho

## 6. Integrações Externas

### 6.1 LastLink

- Integração de pagamentos e assinaturas
- Webhook para processamento de eventos (rota `/api/lastlink-webhook` ou Edge Function)
- Gerenciamento de status (active, past_due, canceled, expired)
- Produtos configurados no sistema com IDs predefinidos:
  - Mensal: 'prod_monthly_123'
  - Anual: 'prod_annual_456'

### 6.2 Integração Pendente

O guia de integração do LastLink indica que ainda é necessário implementar:

- Funcionalidade de webhook para receber eventos
- Hook `useCompany()` para dados em tempo real
- Componente `<BillingBadge>` para exibir status de assinatura
- Página de faturamento com opções de assinatura
- Rota de proteção para recursos premium

## 7. Considerações Técnicas

### 7.1 Segurança

- Autenticação gerenciada pelo Supabase
- RLS no banco de dados
- Middleware para proteção de rotas
- Validação de formulários com Zod

### 7.2 Performance

- SSR para páginas críticas
- Client Components para interatividade
- Realtime para atualizações em tempo real

### 7.3 Armazenamento

- Supabase Storage para arquivos
- Limpeza de arquivos órfãos

### 7.4 Escalabilidade

- Estrutura modular
- Separação clara entre cliente e servidor
- Tipos TypeScript para manutenção

## 8. Recursos Pendentes de Implementação

De acordo com o guia de integração do LastLink, os seguintes recursos precisam ser implementados:

1. Constante `PRODUCT_ID` para mapear produtos
2. Hook `useCompany()` para buscar dados com suporte a realtime
3. Página `/billing` com badge de status e botões de ação
4. Rota de proteção para recursos premium
5. Testes manuais e validação de fluxo de pagamento

## 9. Recomendações para Desenvolvimento Futuro

### 9.1 Melhorias Arquiteturais

1. **Refatoração de Componentes**:
   - Dividir componentes grandes (como o Dashboard) em componentes menores e reutilizáveis
   - Criar uma biblioteca de componentes de negócio específicos do domínio

2. **Organização de Hooks**:
   - Desenvolver hooks personalizados para lógicas de negócio comuns
   - Implementar o hook `useCompany()` conforme especificado no guia LastLink
   - Criar hooks para gerenciamento de estado global (`useProjects`, `useClients`, etc.)

3. **Tratamento de Erros**:
   - Implementar uma estratégia consistente de tratamento de erros
   - Criar componentes de feedback para erros comuns
   - Melhorar as mensagens de erro para o usuário final

### 9.2 Novas Funcionalidades

1. **Módulo de Faturamento**:
   - Implementar toda a integração LastLink conforme guia
   - Adicionar página de faturamento com histórico de transações
   - Implementar relatórios financeiros

2. **Relatórios e Análises**:
   - Desenvolver dashboard analítico com gráficos e métricas
   - Implementar exportação de relatórios (PDF, Excel)
   - Adicionar previsões e tendências baseadas em histórico

3. **Comunicação com Clientes**:
   - Adicionar sistema de notificações para clientes
   - Implementar comentários em projetos
   - Desenvolver chat interno ou integração com plataformas de comunicação

4. **Calendário e Agendamento**:
   - Criar visualização de calendário para projetos
   - Implementar sistema de prazos e alertas
   - Adicionar integração com Google Calendar/Microsoft Calendar

### 9.3 Melhorias Técnicas

1. **Testes**:
   - Implementar testes unitários para componentes críticos
   - Adicionar testes de integração para fluxos importantes
   - Configurar CI/CD para execução automática de testes

2. **Performance**:
   - Otimizar carregamento de dados com estratégias de cache
   - Implementar lazy loading para componentes pesados
   - Adicionar SSG para páginas estáticas

3. **Mobile**:
   - Melhorar a experiência em dispositivos móveis
   - Considerar desenvolvimento de um PWA
   - Otimizar interações touch e gestos

4. **Segurança**:
   - Realizar auditoria de segurança completa
   - Implementar autenticação multifator
   - Adicionar monitoramento de atividades suspeitas

### 9.4 Prioridades Imediatas

1. Completar a integração com LastLink conforme especificado no guia
2. Refatorar páginas extensas do dashboard em componentes menores
3. Implementar testes para funcionalidades críticas
4. Otimizar consultas ao banco de dados para melhorar performance 