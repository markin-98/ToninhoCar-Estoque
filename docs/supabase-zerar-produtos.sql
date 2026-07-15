-- ============================================================================
-- ToninhoCar Estoque — Zerar TUDO (deixar o app sem nada cadastrado)
-- ----------------------------------------------------------------------------
-- Rode no Supabase: Dashboard > SQL Editor > New query > Run.
--
-- ATENÇÃO: isto APAGA todos os produtos, todas as fichas, todo o histórico de
-- movimentações e todo o histórico de preços. Ação irreversível. Use apenas
-- para limpar dados de teste antes de cadastrar os dados reais da mecânica.
--
-- CASCADE: as tabelas movimentacao e historico_preco referenciam produto (FK),
-- então o TRUNCATE se estende automaticamente a elas. RESTART IDENTITY faz os
-- ids voltarem a começar do 1 (cadastros novos ficam com códigos limpos).
-- ============================================================================

truncate table public.produto, public.ficha_carro restart identity cascade;

-- Pronto: app zerado. Se quiser conferir o que ainda existe, rode por exemplo:
--   select count(*) from public.produto;
--   select count(*) from public.ficha_carro;
--   select count(*) from public.movimentacao;
--   select count(*) from public.historico_preco;
