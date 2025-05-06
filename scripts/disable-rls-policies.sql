-- Desativar temporariamente as políticas de RLS para a tabela projects
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Você pode reativar mais tarde com:
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
