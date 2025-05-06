-- Cria a função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adiciona a coluna subscription_id à tabela lastlink_events se não existir
ALTER TABLE lastlink_events
ADD COLUMN IF NOT EXISTS subscription_id TEXT NULL;

-- Recria o trigger para atualização do campo updated_at
DROP TRIGGER IF EXISTS update_lastlink_events_updated_at ON lastlink_events;
CREATE TRIGGER update_lastlink_events_updated_at
BEFORE UPDATE ON lastlink_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 