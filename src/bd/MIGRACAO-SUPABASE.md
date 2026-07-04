# Guia: recriar o banco no Supabase (projeto novo)

Use este guia para recriar todo o backend do ToninhoCar em um **novo projeto Supabase**,
caso tenha perdido o acesso ao projeto original.

## 1. Criar o projeto

1. Acesse https://supabase.com → **New project**.
2. Escolha um nome (ex.: `toninho-car`), uma senha de banco e a região mais próxima (South America / São Paulo).
3. Aguarde o projeto provisionar.

## 2. Criar as tabelas + dados + segurança

1. No painel do projeto, abra **SQL Editor** → **New query**.
2. Cole **todo o conteúdo** do arquivo [`ToninhoCar.sql`](./ToninhoCar.sql) e clique em **Run**.
3. Isso cria as 4 tabelas (`produto`, `ficha_carro`, `movimentacao`, `historico_preco`),
   insere os 6 produtos de exemplo e ativa o RLS.

> As tabelas `ficha_carro`, `movimentacao` e `historico_preco` são criadas vazias —
> era assim no banco original.

## 3. Recriar os usuários de login (IMPORTANTE)

Os usuários **não** ficam nas tabelas — ficam no **Supabase Auth**, e precisam ser
recriados manualmente:

1. No painel, vá em **Authentication** → **Users** → **Add user** → **Create new user**.
2. Crie os dois usuários de teste (marque "Auto Confirm User"):
   - **Administrador** — email `admin@toninho.com`, senha `123456`
   - **Funcionário** — email `func@toninho.com`, senha `123456`
3. Para cada usuário, defina o **User Metadata** (perfil e nome). Clique no usuário →
   edite o campo **User Metadata** (Raw JSON):
   - Admin:
     ```json
     { "nome": "Administrador", "perfil": "admin" }
     ```
   - Funcionário:
     ```json
     { "nome": "Funcionário", "perfil": "funcionario" }
     ```

> O app lê `perfil` do metadata para decidir entre a área de admin e a de funcionário
> (ver `src/app/contexts/AuthContext.tsx`). Sem o metadata, o usuário entra como
> funcionário por padrão.

## 4. Pegar as novas chaves e atualizar o app

1. No painel, vá em **Project Settings** → **API**.
2. Copie a **Project URL** e a **chave pública** (anon / publishable).
3. Atualize esses valores em **dois lugares** do projeto:
   - `src/app/eas.json` → bloco `build.preview.env`:
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_KEY`
   - Arquivo `.env` local (para rodar com `expo start`), na pasta `src/app`:
     ```
     EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
     EXPO_PUBLIC_SUPABASE_KEY=sua-chave-publica
     ```

> ⚠️ Use sempre a chave **pública (anon/publishable)** no app — **nunca** a chave secreta
> (`service_role`), pois ela ignora o RLS e daria acesso total a qualquer um.

## 5. Testar

1. Na pasta `src/app`, rode `npm install` e depois `npx expo start`.
2. Faça login com `admin@toninho.com` / `123456` e confira se os 6 produtos aparecem.

---

### O que NÃO foi possível exportar do banco antigo
- Os **usuários do Auth** (logins/senhas) — por isso o passo 3 é manual.
- Configurações do painel (provedores de login, e-mails, storage, etc.), caso existissem.
