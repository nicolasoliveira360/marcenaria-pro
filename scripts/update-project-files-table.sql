-- Verificar se a coluna file_name existe e adicioná-la se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'project_files'
        AND column_name = 'file_name'
    ) THEN
        ALTER TABLE public.project_files
        ADD COLUMN file_name text NOT NULL DEFAULT '';
    END IF;
END
$$;

-- Atualizar registros existentes que não têm file_name
UPDATE public.project_files
SET file_name = COALESCE(
    NULLIF(SUBSTRING(storage_path FROM '[^/]+$'), ''),
    'arquivo'
)
WHERE file_name = '' OR file_name IS NULL;
