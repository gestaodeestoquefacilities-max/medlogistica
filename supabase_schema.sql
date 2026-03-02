-- Tabela de Entregadores (Couriers)
CREATE TABLE IF NOT EXISTS couriers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL, -- Moto, Carro, Outro
  vehicle_plate TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Tabela de Chamados/Pedidos (Requests)
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  jira_code TEXT,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  complement TEXT,
  volumes INTEGER NOT NULL,
  priority TEXT NOT NULL, -- Baixa, Média, Alta
  status TEXT NOT NULL, -- Aberto, Separando, Em Trânsito, Entregue
  history JSONB DEFAULT '[]'::jsonb, -- Armazena o array de logs de histórico
  general_notes TEXT,
  courier_id UUID REFERENCES couriers(id) ON DELETE SET NULL -- Relacionamento com entregador
);

-- Habilitar Row Level Security (Segurança a nível de linha)
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Acesso total a couriers" ON couriers;
DROP POLICY IF EXISTS "Acesso total a requests" ON requests;
DROP POLICY IF EXISTS "Acesso total para autenticados em couriers" ON couriers;
DROP POLICY IF EXISTS "Acesso total para autenticados em requests" ON requests;

-- CRIAR POLÍTICAS SEGURAS

-- 1. Entregadores: Apenas usuários autenticados (Logados) podem ler e escrever
CREATE POLICY "Acesso total para autenticados em couriers" 
ON couriers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Chamados: Apenas usuários autenticados (Logados) podem ler e escrever diretamente na tabela
CREATE POLICY "Acesso total para autenticados em requests" 
ON requests 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Rastreamento Público: Função RPC Segura
-- Isso permite que usuários anônimos busquem um pedido Específico pelo código,
-- mas previne que eles listem todos os pedidos da tabela "requests".
CREATE OR REPLACE FUNCTION get_request_by_tracking_code(code_input text)
RETURNS SETOF requests
LANGUAGE sql
SECURITY DEFINER -- Roda com permissões de admin, ignorando o RLS da tabela para esta consulta específica
AS $$
  SELECT * FROM requests 
  WHERE tracking_code = code_input 
     OR jira_code = code_input;
$$;

-- Garantir que a função possa ser chamada publicamente
GRANT EXECUTE ON FUNCTION get_request_by_tracking_code(text) TO anon;
GRANT EXECUTE ON FUNCTION get_request_by_tracking_code(text) TO authenticated;