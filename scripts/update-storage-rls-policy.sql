-- Modificar a política de inserção para incluir também o proprietário da empresa
DROP POLICY IF EXISTS "Usuários podem adicionar arquivos a seus projetos" ON storage.objects;

CREATE POLICY "Usuários podem adicionar arquivos a seus projetos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-gallery'
  AND (
    -- Verificar se o usuário está na tabela company_user_roles
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.company_user_roles cur ON cur.company_id = p.company_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND cur.user_id = auth.uid()
    )
    OR
    -- Verificar se o usuário é o proprietário da empresa (mesmo email)
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.companies c ON c.id = p.company_id
      JOIN public.users u ON u.email = c.email
      WHERE p.id::text = split_part(name, '/', 1)
        AND u.id = auth.uid()
    )
  )
);

-- Modificar a política de leitura para incluir também o proprietário da empresa
DROP POLICY IF EXISTS "Usuários podem ler arquivos de seus projetos" ON storage.objects;

CREATE POLICY "Usuários podem ler arquivos de seus projetos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-gallery'
  AND (
    -- Verificar se o usuário está na tabela company_user_roles
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.company_user_roles cur ON cur.company_id = p.company_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND cur.user_id = auth.uid()
    )
    OR
    -- Verificar se o usuário é o proprietário da empresa (mesmo email)
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.companies c ON c.id = p.company_id
      JOIN public.users u ON u.email = c.email
      WHERE p.id::text = split_part(name, '/', 1)
        AND u.id = auth.uid()
    )
  )
);

-- Modificar a política de exclusão para incluir também o proprietário da empresa
DROP POLICY IF EXISTS "Usuários podem excluir arquivos de seus projetos" ON storage.objects;

CREATE POLICY "Usuários podem excluir arquivos de seus projetos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-gallery'
  AND (
    -- Verificar se o usuário está na tabela company_user_roles
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.company_user_roles cur ON cur.company_id = p.company_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND cur.user_id = auth.uid()
    )
    OR
    -- Verificar se o usuário é o proprietário da empresa (mesmo email)
    EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.companies c ON c.id = p.company_id
      JOIN public.users u ON u.email = c.email
      WHERE p.id::text = split_part(name, '/', 1)
        AND u.id = auth.uid()
    )
  )
);
