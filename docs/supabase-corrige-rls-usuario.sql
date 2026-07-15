-- ============================================================================
-- ToninhoCar Estoque — RLS seguro da tabela usuario (versão final)
-- ----------------------------------------------------------------------------
-- Rode no Supabase: Dashboard > SQL Editor > New query > Run.
--
-- Contexto:
--  1) A política original consultava a própria tabela usuario dentro da
--     política dela -> recursão infinita -> toda leitura falhava.
--  2) A correção provisória checava o perfil pelo user_metadata do token, mas
--     o user_metadata é editável pelo próprio usuário -> risco de segurança
--     (o Advisor do Supabase marca isso como CRITICAL).
--
-- Solução definitiva: uma função SECURITY DEFINER (eh_admin) lê a tabela
-- usuario com privilégio elevado, o que IGNORA o RLS por dentro e portanto
-- NÃO gera recursão. A política passa a chamar essa função. O perfil vem da
-- tabela (fonte confiável), não do token editável.
-- ============================================================================

-- 1) Função que diz se o usuário logado é admin ativo -----------------------
--    security definer: roda como dono da função (ignora RLS no SELECT interno)
--    set search_path: fecha brecha de sequestro de search_path
create or replace function public.eh_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.usuario
    where email = (auth.jwt() ->> 'email')
      and perfil = 'admin'
      and ativo = true
  );
$$;

revoke all on function public.eh_admin() from public, anon;
grant execute on function public.eh_admin() to authenticated;

-- 2) Políticas da tabela usuario --------------------------------------------
alter table public.usuario enable row level security;

drop policy if exists "usuario_leitura_logado" on public.usuario;
drop policy if exists "usuario_gestao_admin"   on public.usuario;

-- Leitura: qualquer usuário logado vê a lista da equipe
create policy "usuario_leitura_logado"
  on public.usuario
  for select
  to authenticated
  using (true);

-- Escrita/gestão (criar, alterar função, ativar/desativar, excluir):
-- apenas administradores, verificados pela tabela via eh_admin().
create policy "usuario_gestao_admin"
  on public.usuario
  for all
  to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

-- Pronto: sem recursão, sem depender de user_metadata, e o aviso CRITICAL
-- do Advisor desaparece. Recarregue a tela Equipe para conferir.
