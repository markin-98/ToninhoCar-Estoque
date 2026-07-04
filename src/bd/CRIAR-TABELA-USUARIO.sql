-- ============================================================================
-- TABELA usuario — cadastro/controle da equipe (mecânicos e admins)
-- ============================================================================
-- Rode este script no painel do Supabase: SQL Editor > New query > Run.
-- É necessário para a tela "Equipe" do app funcionar.
--
-- Cada linha espelha um usuário do Supabase Auth (auth.users) e guarda o
-- perfil (admin/funcionario), o nome e o login. O app passa a ler o perfil
-- DESTA tabela, permitindo que a administradora altere a função de qualquer
-- membro da equipe pelo próprio app.
-- ============================================================================

CREATE TABLE IF NOT EXISTS usuario (
    id             UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    usuario        TEXT NOT NULL UNIQUE,   -- login digitado (sem @toninho.com)
    nome           TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,   -- login + @toninho.com
    perfil         TEXT NOT NULL DEFAULT 'funcionario'
                   CHECK (perfil IN ('admin', 'funcionario')),
    ativo          BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Importa os usuários que já existem no Auth (ex.: admin@toninho.com),
-- aproveitando o nome/perfil do user_metadata quando houver.
INSERT INTO usuario (id, usuario, nome, email, perfil)
SELECT
    u.id,
    split_part(u.email, '@', 1),
    COALESCE(u.raw_user_meta_data ->> 'nome', split_part(u.email, '@', 1)),
    u.email,
    CASE WHEN u.raw_user_meta_data ->> 'perfil' = 'admin' THEN 'admin' ELSE 'funcionario' END
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ⚠️ PASSO MANUAL OBRIGATÓRIO NO PAINEL (fora do SQL):
-- Authentication > Sign In / Up > Email > DESATIVE "Confirm email".
-- Sem isso, os logins criados pelo app (nome@toninho.com são emails fictícios)
-- ficariam travados aguardando uma confirmação que nunca chega.
-- ============================================================================
