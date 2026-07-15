-- ============================================================================
-- ToninhoCar Estoque — RLS + Realtime
-- ----------------------------------------------------------------------------
-- Rode este script no Supabase: Dashboard > SQL Editor > New query > Run.
--
-- Objetivo: deixar TODO o conteúdo (produtos, fichas, movimentações) visível e
-- editável por QUALQUER usuário logado (admin ou funcionário), e ligar o tempo
-- real para que um celular veja na hora o que o outro fez.
--
-- Observação: o app usa Supabase Auth (login com e-mail/senha), então todo
-- usuário logado tem a role "authenticated". As políticas abaixo liberam o
-- acesso para essa role. Visitantes não logados (anon) não têm acesso.
-- ============================================================================

-- 1) Garante que as colunas usadas pelo app existem -------------------------
--    (o app grava status e a lista de itens da ficha como JSON)
alter table public.ficha_carro
  add column if not exists status text not null default 'aberta';

alter table public.ficha_carro
  add column if not exists itens jsonb not null default '[]'::jsonb;

-- 2) Habilita RLS nas tabelas -----------------------------------------------
alter table public.produto        enable row level security;
alter table public.ficha_carro    enable row level security;
alter table public.movimentacao   enable row level security;
alter table public.usuario        enable row level security;

-- 3) Políticas: acesso total para qualquer usuário logado -------------------
--    (remove políticas antigas com o mesmo nome antes de recriar)

-- PRODUTO
drop policy if exists "produto_acesso_logado" on public.produto;
create policy "produto_acesso_logado"
  on public.produto
  for all
  to authenticated
  using (true)
  with check (true);

-- FICHA_CARRO
drop policy if exists "ficha_acesso_logado" on public.ficha_carro;
create policy "ficha_acesso_logado"
  on public.ficha_carro
  for all
  to authenticated
  using (true)
  with check (true);

-- MOVIMENTACAO
drop policy if exists "movimentacao_acesso_logado" on public.movimentacao;
create policy "movimentacao_acesso_logado"
  on public.movimentacao
  for all
  to authenticated
  using (true)
  with check (true);

-- USUARIO
--   Leitura liberada para todos os logados (o app consulta perfil/ativo no login).
drop policy if exists "usuario_leitura_logado" on public.usuario;
create policy "usuario_leitura_logado"
  on public.usuario
  for select
  to authenticated
  using (true);

--   Escrita/gestão da equipe: apenas administradores.
--   Usa a função eh_admin() (SECURITY DEFINER), que lê a tabela usuario com
--   privilégio elevado — ignora o RLS por dentro (sem recursão) e não depende
--   do user_metadata editável. Veja docs/supabase-corrige-rls-usuario.sql para
--   a definição da função eh_admin(); rode aquele script para criá-la.
drop policy if exists "usuario_gestao_admin" on public.usuario;
create policy "usuario_gestao_admin"
  on public.usuario
  for all
  to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

-- 4) Tempo real: publica as tabelas na publicação do Realtime ---------------
--    (ignora o erro caso a tabela já esteja publicada)
do $$
begin
  begin
    alter publication supabase_realtime add table public.produto;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.ficha_carro;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.movimentacao;
  exception when duplicate_object then null;
  end;
end $$;

-- Pronto. Depois de rodar, os dados aparecem para todos os usuários logados
-- e as alterações se propagam em tempo real entre os dispositivos.
