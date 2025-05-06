-- Função para definir a variável local app.current_company
CREATE OR REPLACE FUNCTION public.set_current_company(company_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_company', company_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão para todos os usuários autenticados
GRANT EXECUTE ON FUNCTION public.set_current_company TO authenticated;
