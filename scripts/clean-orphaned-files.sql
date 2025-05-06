-- Este script identifica e lista arquivos órfãos no bucket project-gallery
-- (arquivos que existem no storage mas não têm registro correspondente na tabela project_files)

-- Primeiro, vamos criar uma função temporária para listar arquivos no bucket
CREATE OR REPLACE FUNCTION list_bucket_files(bucket_name text)
RETURNS TABLE(name text) AS $$
BEGIN
  RETURN QUERY
  SELECT objects.name
  FROM storage.objects
  WHERE bucket_id = bucket_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agora, vamos listar os arquivos órfãos
SELECT o.name AS orphaned_file_path
FROM (SELECT name FROM list_bucket_files('project-gallery')) o
LEFT JOIN project_files pf ON pf.storage_path = o.name
WHERE pf.id IS NULL;

-- Para limpar os arquivos órfãos, você pode executar manualmente:
-- DELETE FROM storage.objects WHERE name = 'caminho/do/arquivo/orfao' AND bucket_id = 'project-gallery';

-- Remover a função temporária
DROP FUNCTION IF EXISTS list_bucket_files;
