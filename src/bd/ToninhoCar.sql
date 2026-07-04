-- ============================================================================
-- ToninhoCar - Esquema do banco de dados (PostgreSQL / Supabase)
-- ============================================================================
-- Este script reflete a estrutura REAL utilizada no projeto Supabase.
--
-- Observações importantes sobre o modelo:
--  * O cadastro/autenticação de usuários é feito pelo Supabase Auth
--    (tabela auth.users). Por isso NÃO existe uma tabela "usuario" no schema
--    public. O perfil (admin/funcionario) e o nome ficam em user_metadata.
--    Por esse motivo, as tabelas guardam o NOME do usuário de forma
--    desnormalizada (nome_usuario) em vez de uma FK para id_usuario.
--  * Os itens de uma ficha são armazenados em uma coluna JSONB (itens)
--    dentro de ficha_carro, e não em uma tabela ITEM_FICHA separada.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: produto
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produto (
    id_produto          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo              TEXT NOT NULL UNIQUE,
    nome                TEXT NOT NULL,
    descricao           TEXT,
    quantidade_atual    INTEGER NOT NULL DEFAULT 0,
    preco_atual         NUMERIC(10, 2) NOT NULL,
    estoque_minimo      INTEGER NOT NULL DEFAULT 0,
    data_cadastro       TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultima_atualizacao  TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- Tabela: ficha_carro
-- (itens é um array JSON: [{ id, id_produto, nome_produto, quantidade, preco_unitario }])
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ficha_carro (
    id_ficha          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    placa             TEXT NOT NULL,
    modelo            TEXT NOT NULL,
    ano               INTEGER,
    nome_cliente      TEXT NOT NULL,
    data_atendimento  TIMESTAMPTZ NOT NULL DEFAULT now(),
    observacoes       TEXT,
    status            TEXT NOT NULL DEFAULT 'aberta'
                      CHECK (status IN ('aberta', 'concluida', 'cancelada')),
    itens             JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ----------------------------------------------------------------------------
-- Tabela: movimentacao
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimentacao (
    id_movimentacao  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_produto       BIGINT NOT NULL REFERENCES produto (id_produto) ON DELETE RESTRICT,
    nome_produto     TEXT NOT NULL,
    tipo             TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'baixa')),
    quantidade       INTEGER NOT NULL,
    nome_usuario     TEXT NOT NULL,
    data_hora        TIMESTAMPTZ NOT NULL DEFAULT now(),
    motivo           TEXT,
    id_ficha_carro   BIGINT REFERENCES ficha_carro (id_ficha) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- Tabela: historico_preco
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_preco (
    id_historico_preco  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_produto          BIGINT NOT NULL REFERENCES produto (id_produto) ON DELETE RESTRICT,
    nome_usuario        TEXT NOT NULL,
    preco_anterior      NUMERIC(10, 2) NOT NULL,
    preco_novo          NUMERIC(10, 2) NOT NULL,
    data_alteracao      TIMESTAMPTZ NOT NULL DEFAULT now(),
    motivo              TEXT
);

-- ----------------------------------------------------------------------------
-- Índices para consultas frequentes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_movimentacao_produto ON movimentacao (id_produto);
CREATE INDEX IF NOT EXISTS idx_movimentacao_ficha   ON movimentacao (id_ficha_carro);
CREATE INDEX IF NOT EXISTS idx_historico_produto    ON historico_preco (id_produto);
CREATE INDEX IF NOT EXISTS idx_produto_codigo       ON produto (codigo);

-- ----------------------------------------------------------------------------
-- Dados iniciais (seed) - produtos cadastrados no ambiente atual
-- ----------------------------------------------------------------------------
INSERT INTO produto (codigo, nome, descricao, quantidade_atual, preco_atual, estoque_minimo)
VALUES
    ('PROD-001', 'Óleo Motor 5W30',    'Óleo sintético para motores a gasolina e flex',  2,  45.90, 5),
    ('PROD-002', 'Filtro de Ar',       'Filtro de ar universal para carros de passeio',  8,  35.00, 3),
    ('PROD-003', 'Vela de Ignição',    'Vela NGK iridium para motores 1.0 e 1.4',        1,  28.50, 4),
    ('PROD-004', 'Pastilha de Freio',  'Pastilha dianteira para carros compactos',      12, 120.00, 5),
    ('PROD-005', 'Fluido de Freio DOT4','Fluido de freio DOT4 500ml',                     0,  22.00, 2),
    ('PROD-006', 'Correia Dentada',    'Correia dentada para motores 1.6 16v',           5,  85.00, 2)
ON CONFLICT (codigo) DO NOTHING;

-- (ficha_carro, movimentacao e historico_preco estavam vazias no banco original,
--  portanto não há dados a inserir nelas.)

-- ============================================================================
-- SEGURANÇA: Row Level Security (RLS)
-- ============================================================================
-- Habilita o RLS e libera o acesso apenas para usuários AUTENTICADOS (logados
-- via Supabase Auth). O app sempre exige login antes de acessar os dados,
-- então essas policies cobrem todo o uso normal.
ALTER TABLE produto         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_carro     ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacao    ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_preco ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_autenticado" ON produto
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON ficha_carro
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON movimentacao
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON historico_preco
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- TEMPO REAL (Realtime): faz as telas atualizarem sozinhas em todos os
-- dispositivos quando alguém altera os dados. Adiciona as tabelas à
-- publicação usada pelo Supabase Realtime.
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE produto;
ALTER PUBLICATION supabase_realtime ADD TABLE ficha_carro;
ALTER PUBLICATION supabase_realtime ADD TABLE movimentacao;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_preco;
