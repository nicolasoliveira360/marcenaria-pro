-- Criar o tipo enum para funções de usuário
CREATE TYPE role_enum AS ENUM ('admin', 'collaborator', 'client_viewer');

-- Criar a tabela de funções de usuários em empresas
CREATE TABLE public.company_user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role        role_enum NOT NULL DEFAULT 'collaborator',
  created_at  timestamptz DEFAULT now(),

  UNIQUE (company_id, user_id)
);

-- Adicionar índices para melhorar a performance de consultas
CREATE INDEX idx_company_user_roles_company_id ON public.company_user_roles(company_id);
CREATE INDEX idx_company_user_roles_user_id ON public.company_user_roles(user_id);

-- Comentários para documentação
COMMENT ON TABLE public.company_user_roles IS 'Armazena as funções dos usuários em cada empresa';
COMMENT ON COLUMN public.company_user_roles.role IS 'Função do usuário: admin (acesso total), collaborator (acesso a funções não críticas), client_viewer (apenas visualização de projetos compartilhados)';
