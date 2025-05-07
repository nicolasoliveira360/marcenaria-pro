-- Função para verificar se um usuário tem plano premium
CREATE OR REPLACE FUNCTION public.has_premium_plan()
RETURNS BOOLEAN AS $$
DECLARE
  company_id UUID;
  is_premium BOOLEAN;
BEGIN
  -- Obter o ID da empresa do usuário logado
  SELECT cur.company_id INTO company_id
  FROM public.company_user_roles cur
  WHERE cur.user_id = auth.uid();
  
  -- Se não encontrou empresa, retorna falso
  IF company_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se a empresa tem plano premium (apenas verificando se é 'paid')
  SELECT (plan = 'paid') INTO is_premium
  FROM public.companies
  WHERE id = company_id;
  
  -- Se não encontrou plano ou não é premium, retorna falso
  RETURN COALESCE(is_premium, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS para bloquear operações CRUD para usuários sem plano ativo

-- Clients table
DROP POLICY IF EXISTS "Premium required for client operations" ON public.clients;
CREATE POLICY "Premium required for client operations" 
ON public.clients
USING (has_premium_plan())
WITH CHECK (has_premium_plan());

-- Projects table
DROP POLICY IF EXISTS "Premium required for project operations" ON public.projects;
CREATE POLICY "Premium required for project operations" 
ON public.projects
USING (has_premium_plan())
WITH CHECK (has_premium_plan());

-- Collaborators table
DROP POLICY IF EXISTS "Premium required for collaborator operations" ON public.collaborators;
CREATE POLICY "Premium required for collaborator operations" 
ON public.collaborators
USING (has_premium_plan())
WITH CHECK (has_premium_plan());

-- Project files table
DROP POLICY IF EXISTS "Premium required for project file operations" ON public.project_files;
CREATE POLICY "Premium required for project file operations" 
ON public.project_files
USING (has_premium_plan())
WITH CHECK (has_premium_plan());

-- Storage objects
DROP POLICY IF EXISTS "Premium required for storage operations" ON storage.objects;
CREATE POLICY "Premium required for storage operations" 
ON storage.objects
USING (has_premium_plan())
WITH CHECK (has_premium_plan()); 