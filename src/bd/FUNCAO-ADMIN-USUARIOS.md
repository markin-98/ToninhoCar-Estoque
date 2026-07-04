# Guia: publicar a função "admin-usuarios" no Supabase

Esta função permite que a administradora, pelo próprio app (tela Equipe):
- **Excluir** um usuário de vez (some do login e da lista)
- **Redefinir a senha** de um mecânico que esqueceu a dele

> Sem publicar esta função, esses dois botões mostram um aviso de "recurso
> indisponível". O resto da tela Equipe (cadastrar, trocar função,
> desativar/reativar) funciona normalmente sem ela.

## Por que precisa disso?
Excluir usuário e trocar a senha dos outros são operações que exigem a chave
**secreta** (service_role) do Supabase — que jamais pode ficar dentro do app
(qualquer um poderia extraí-la do APK). A Edge Function roda **no servidor** do
Supabase com essa chave, e só obedece a quem estiver logado com perfil
**admin**.

## Passo a passo (5 minutos)

1. No painel do Supabase, abra **Edge Functions** (ícone de raio na barra
   lateral).
2. Clique em **Deploy a new function** → **Via Editor** (criar no navegador).
3. Nome da função: `admin-usuarios` (exatamente assim).
4. Apague o código de exemplo e cole TODO o conteúdo do arquivo
   [`edge-function-admin-usuarios.ts`](./edge-function-admin-usuarios.ts).
5. Clique em **Deploy function**.

Pronto! Não precisa configurar chave nenhuma: o Supabase injeta a
`SUPABASE_SERVICE_ROLE_KEY` automaticamente nas Edge Functions.

## Como testar
1. No app, entre como **admin** → Início → **Equipe**.
2. Toque em um membro da lista → painel abre.
3. **Redefinir senha**: digite uma senha nova (mín. 6) e confirme. Saia e
   logue com o usuário e a senha nova.
4. **Excluir usuário**: confirme a exclusão. O usuário some da lista e não
   consegue mais logar (a conta é apagada do Auth).

## Observações de segurança
- A função recusa chamadas de quem não é admin (mesmo logado).
- Ninguém consegue excluir o próprio acesso.
- Senhas nunca podem ser "vistas" — nem pelo admin, nem pelo Supabase. Elas
  são guardadas criptografadas (hash). O fluxo correto para "esqueci a senha"
  é sempre redefinir.
