-- Adiciona a coluna data à tabela lastlink_events se não existir
ALTER TABLE lastlink_events
ADD COLUMN IF NOT EXISTS data JSONB NULL; 