-- Adiciona enums para LastLink
DO $$
BEGIN
    -- Verificar se o tipo já existe antes de criar
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_enum') THEN
        CREATE TYPE plan_enum AS ENUM ('free', 'paid');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_interval_enum') THEN
        CREATE TYPE billing_interval_enum AS ENUM ('monthly', 'annual');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lastlink_status_enum') THEN
        CREATE TYPE lastlink_status_enum AS ENUM ('incomplete', 'active', 'past_due', 'canceled', 'expired');
    END IF;
END
$$;

-- Adiciona colunas à tabela companies se não existirem
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS plan plan_enum NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS billing_interval billing_interval_enum NULL,
ADD COLUMN IF NOT EXISTS lastlink_status lastlink_status_enum NOT NULL DEFAULT 'incomplete',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS tax_id TEXT NULL;

-- Adiciona tabela lastlink_subscriptions se não existir
CREATE TABLE IF NOT EXISTS lastlink_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id TEXT NOT NULL,
    billing_interval billing_interval_enum NOT NULL,
    status lastlink_status_enum NOT NULL,
    current_period_end TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, subscription_id)
);

-- Adiciona tabela lastlink_products se não existir
CREATE TABLE IF NOT EXISTS lastlink_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL UNIQUE,
    billing_interval billing_interval_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insere produtos LastLink se ainda não existirem
INSERT INTO lastlink_products (product_id, billing_interval)
VALUES 
    ('CC84FA160', 'monthly'),
    ('C11C022E9', 'annual')
ON CONFLICT (product_id) DO NOTHING;

-- Adiciona tabela lastlink_events para log se não existir
CREATE TABLE IF NOT EXISTS lastlink_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id TEXT NULL,
    data JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cria trigger para atualizar o campo updated_at 
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger na tabela lastlink_subscriptions
DROP TRIGGER IF EXISTS update_lastlink_subscriptions_updated_at ON lastlink_subscriptions;
CREATE TRIGGER update_lastlink_subscriptions_updated_at
BEFORE UPDATE ON lastlink_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 