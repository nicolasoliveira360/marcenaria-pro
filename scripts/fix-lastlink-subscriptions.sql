-- Script para corrigir product_id na tabela lastlink_subscriptions
DO $$
DECLARE
    missing_product RECORD;
    product_exists INTEGER;
BEGIN
    -- 1. Verificar se a coluna product_id existe e adicioná-la se necessário
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lastlink_subscriptions' 
        AND column_name = 'product_id'
    ) THEN
        RAISE NOTICE 'Adicionando coluna product_id à tabela lastlink_subscriptions';
        ALTER TABLE lastlink_subscriptions
        ADD COLUMN product_id TEXT;
    END IF;
    
    -- 2. Identificar produtos que não existem na tabela lastlink_products
    FOR missing_product IN
        SELECT DISTINCT ls.product_id
        FROM lastlink_subscriptions ls
        LEFT JOIN lastlink_products lp ON ls.product_id = lp.product_id
        WHERE lp.product_id IS NULL
        AND ls.product_id IS NOT NULL
    LOOP
        RAISE NOTICE 'Produto não encontrado na tabela lastlink_products: %', missing_product.product_id;
        
        -- Verificar se o produto já existe com outro formato de ID
        IF missing_product.product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            -- É um UUID, provavelmente precisamos substituir por um código curto
            RAISE NOTICE 'ID em formato UUID detectado: %', missing_product.product_id;
            
            -- Verificar se já temos o produto mensal padrão
            SELECT COUNT(*) INTO product_exists FROM lastlink_products WHERE product_id = 'CC84FA160';
            IF product_exists = 0 THEN
                RAISE NOTICE 'Inserindo produto mensal padrão: CC84FA160';
                INSERT INTO lastlink_products (product_id, billing_interval)
                VALUES ('CC84FA160', 'monthly');
            END IF;
            
            -- Atualizar todas as assinaturas que usam esse UUID para usar o ID padrão
            RAISE NOTICE 'Atualizando assinaturas para usar produto padrão em vez de UUID';
            UPDATE lastlink_subscriptions
            SET product_id = 'CC84FA160'
            WHERE product_id = missing_product.product_id;
        ELSE
            -- Não é um UUID, então vamos adicioná-lo como um novo produto
            RAISE NOTICE 'Inserindo produto ausente: %', missing_product.product_id;
            INSERT INTO lastlink_products (product_id, billing_interval)
            VALUES (missing_product.product_id, 'monthly');
        END IF;
    END LOOP;
    
    -- 3. Garantir que a coluna product_id não é nula 
    -- Primeiro, definimos um valor padrão para registros com valor nulo
    UPDATE lastlink_subscriptions
    SET product_id = 'CC84FA160'
    WHERE product_id IS NULL;
    
    -- Depois aplicamos a restrição NOT NULL
    ALTER TABLE lastlink_subscriptions
    ALTER COLUMN product_id SET NOT NULL;
    
    -- 4. Adicionar a constraint de chave estrangeira se não existir
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'lastlink_subscriptions'
        AND ccu.column_name = 'product_id'
        AND ccu.table_name = 'lastlink_products'
    ) THEN
        RAISE NOTICE 'Adicionando constraint de chave estrangeira';
        ALTER TABLE lastlink_subscriptions
        ADD CONSTRAINT fk_lastlink_subscriptions_product_id
        FOREIGN KEY (product_id) 
        REFERENCES lastlink_products(product_id);
        
        RAISE NOTICE 'Constraint adicionada com sucesso';
    END IF;
    
    RAISE NOTICE 'Script executado com sucesso';
END;
$$; 