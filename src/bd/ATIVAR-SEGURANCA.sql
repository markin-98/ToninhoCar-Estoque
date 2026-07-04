-- ============================================================================
-- ATIVAR SEGURANÇA (RLS) + TEMPO REAL no banco JÁ EXISTENTE do Supabase
-- ============================================================================
-- Rode este script no painel do Supabase: SQL Editor > New query > Run.
--
-- ⚠️  ORDEM IMPORTANTE:
--   1) Primeiro atualize o app (git push -> deploy web + gerar APK novo) com o
--      código atual, que recarrega os dados após o login.
--   2) SÓ DEPOIS rode este SQL. Se rodar antes, apps antigos mostram listas
--      vazias após o login.
--
-- Enquanto você ainda está só testando, NÃO precisa rodar isto. Deixe para a
-- reta final da entrega. (Se um "policy already exists" ou "table is already
-- member" aparecer, pode ignorar — significa que aquela parte já estava feita.)
-- ============================================================================

-- 1) Ativa o Row Level Security (bloqueia acesso sem login)
ALTER TABLE produto         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_carro     ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacao    ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_preco ENABLE ROW LEVEL SECURITY;

-- 2) Libera acesso total apenas para usuários autenticados (logados)
CREATE POLICY "acesso_autenticado" ON produto         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON ficha_carro     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON movimentacao    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_autenticado" ON historico_preco FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3) Liga o tempo real (as telas atualizam sozinhas em todos os dispositivos)
ALTER PUBLICATION supabase_realtime ADD TABLE produto;
ALTER PUBLICATION supabase_realtime ADD TABLE ficha_carro;
ALTER PUBLICATION supabase_realtime ADD TABLE movimentacao;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_preco;
