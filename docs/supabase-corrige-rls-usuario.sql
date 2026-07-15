-- ============================================================================
-- ToninhoCar Estoque — Corrige RLS da tabela usuario (recursão infinita)
-- ----------------------------------------------------------------------------
-- Rode no Supabase: Dashboard > SQL Editor > New query > Run.
--
-- Problema: a política antiga de admin consultava a própria tabela "usuario"
-- para saber se o usuário é admin. Isso causa recursão infinita no RLS e faz
-- QUALQUER leitura da tabela falhar (a tela Equipe mostra "tabela ausente").
--
-- Solução: checar o perfil pelo token de login (user_metadata), sem consultar
-- a tabela. A leitura fica liberada para qualquer logado; a escrita (criar/
-- alterar/excluir membros) fica restrita a quem tem perfil 'admin' no token.
-- ============================================================================

alter table public.usuario enable row level security;

-- Remove as políticas antigas (inclusive a que causava recursão)
drop policy if exists "usuario_leitura_logado" on public.usuario;
drop policy if exists "usuario_gestao_admin"   on public.usuario;

-- Leitura: qualquer usuário logado pode ver a lista da equipe
create policy "usuario_leitura_logado"
  on public.usuario
  for select
  to authenticated
  using (true);

-- Escrita/gestão: apenas administradores.
-- Usa o perfil gravado no token (user_metadata) -> NÃO consulta a tabela,
-- então não há recursão.
create policy "usuario_gestao_admin"
  on public.usuario
  for all
  to authenticated
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'perfil', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'perfil', '') = 'admin');

-- Pronto. Recarregue a tela Equipe: o aviso some e a lista carrega.
