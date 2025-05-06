-- Adiciona a coluna de descrição à tabela de pagamentos se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN description TEXT;
    END IF;
END $$;
