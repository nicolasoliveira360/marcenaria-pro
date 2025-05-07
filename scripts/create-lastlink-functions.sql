-- Função para manipular eventos 'active' ou 'created' vindos da LastLink
CREATE OR REPLACE FUNCTION handle_lastlink_active(
  p_company_id UUID,
  p_sub_id TEXT,
  p_product_id TEXT,
  p_period_end TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_plan plan_enum;
  v_interval billing_interval_enum;
BEGIN
  -- Log da operação para debug
  RAISE NOTICE 'handle_lastlink_active - company_id: %, sub_id: %, product_id: %, period_end: %', 
    p_company_id, p_sub_id, p_product_id, p_period_end;
    
  -- Verificar se o p_product_id é válido
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'product_id não pode ser nulo';
  END IF;

  -- Obter o intervalo de cobrança do produto
  SELECT billing_interval INTO v_interval
  FROM lastlink_products
  WHERE product_id = p_product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', p_product_id;
  END IF;
  
  -- Determinar o plano (sempre 'paid' para assinaturas LastLink)
  v_plan := 'paid';
  
  -- Verificar se a assinatura já existe
  -- Se não existir no lastlink_subscriptions, inserir
  INSERT INTO lastlink_subscriptions (
    company_id, 
    subscription_id,
    product_id,
    billing_interval,
    status,
    current_period_end
  )
  VALUES (
    p_company_id,
    p_sub_id,
    p_product_id,
    v_interval,
    'active',
    p_period_end
  )
  ON CONFLICT (company_id, subscription_id) 
  DO UPDATE SET
    product_id = p_product_id,
    status = 'active',
    current_period_end = p_period_end,
    billing_interval = v_interval,
    updated_at = NOW();
    
  -- Atualizar a empresa para o plano pago
  UPDATE companies
  SET 
    plan = v_plan,
    billing_interval = v_interval,
    lastlink_status = 'active',
    lastlink_sub_id = p_sub_id,
    current_period_end = p_period_end,
    updated_at = NOW()
  WHERE id = p_company_id;
  
  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_id', p_sub_id,
    'plan', v_plan,
    'billing_interval', v_interval,
    'status', 'active'
  );
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  -- Log de erro e retorno de falha
  RAISE NOTICE 'Erro em handle_lastlink_active: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Função para manipular eventos 'past_due' (pagamento falhou)
CREATE OR REPLACE FUNCTION handle_lastlink_past_due(
  p_company_id UUID,
  p_sub_id TEXT,
  p_period_end TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Atualizar status da assinatura para past_due
  UPDATE lastlink_subscriptions
  SET 
    status = 'past_due',
    current_period_end = p_period_end,
    updated_at = NOW()
  WHERE 
    company_id = p_company_id AND 
    subscription_id = p_sub_id;
    
  -- Atualizar status na empresa
  UPDATE companies
  SET 
    lastlink_status = 'past_due',
    lastlink_sub_id = p_sub_id,
    current_period_end = p_period_end,
    updated_at = NOW()
  WHERE id = p_company_id;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_id', p_sub_id,
    'status', 'past_due'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Função para manipular eventos 'canceled'
CREATE OR REPLACE FUNCTION handle_lastlink_canceled(
  p_company_id UUID,
  p_sub_id TEXT,
  p_period_end TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Atualizar status da assinatura para canceled
  UPDATE lastlink_subscriptions
  SET 
    status = 'canceled',
    current_period_end = p_period_end,
    updated_at = NOW()
  WHERE 
    company_id = p_company_id AND 
    subscription_id = p_sub_id;
    
  -- Atualizar status na empresa
  UPDATE companies
  SET 
    plan = 'free',
    lastlink_status = 'canceled',
    lastlink_sub_id = p_sub_id,
    current_period_end = p_period_end,
    updated_at = NOW()
  WHERE id = p_company_id;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_id', p_sub_id,
    'status', 'canceled'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Função para manipular eventos 'expired'
CREATE OR REPLACE FUNCTION handle_lastlink_expired(
  p_company_id UUID,
  p_sub_id TEXT,
  p_period_end TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Atualizar status da assinatura para expired
  UPDATE lastlink_subscriptions
  SET 
    status = 'expired',
    current_period_end = p_period_end,
    updated_at = NOW()
  WHERE 
    company_id = p_company_id AND 
    subscription_id = p_sub_id;
    
  -- Atualizar status na empresa e voltar para plano free
  UPDATE companies
  SET 
    plan = 'free',
    lastlink_status = 'expired',
    lastlink_sub_id = p_sub_id,
    current_period_end = p_period_end,
    updated_at = NOW()
  WHERE id = p_company_id;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'subscription_id', p_sub_id,
    'plan', 'free',
    'status', 'expired'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$; 