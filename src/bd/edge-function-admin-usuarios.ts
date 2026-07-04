// ============================================================================
// Edge Function: admin-usuarios
// ============================================================================
// Publique no painel do Supabase: Edge Functions > Deploy a new function
// Nome da função: admin-usuarios   (veja o guia FUNCAO-ADMIN-USUARIOS.md)
//
// O que faz: permite que um ADMINISTRADOR logado no app
//   - exclua um usuário de vez (Auth + tabela usuario)
//   - redefina a senha de um usuário (caso ele esqueça)
//
// Segurança:
//   - Roda no servidor do Supabase com a chave service_role (nunca vai pro app)
//   - Só executa se quem chamou estiver logado E tiver perfil 'admin'
//   - Ninguém consegue excluir a si mesmo
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resposta(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1) Identifica quem está chamando (token do usuário logado no app)
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: chamador } = await admin.auth.getUser(token);
    if (!chamador?.user) return resposta({ erro: 'Não autenticado.' });

    // 2) Garante que é administrador (confere na tabela usuario)
    const { data: perfilRow } = await admin
      .from('usuario')
      .select('perfil')
      .eq('id', chamador.user.id)
      .maybeSingle();
    if (perfilRow?.perfil !== 'admin') {
      return resposta({ erro: 'Apenas administradores podem fazer isso.' });
    }

    // 3) Executa a ação pedida
    const { acao, id_usuario, nova_senha } = await req.json();
    if (!id_usuario) return resposta({ erro: 'Usuário não informado.' });

    if (acao === 'excluir') {
      if (id_usuario === chamador.user.id) {
        return resposta({ erro: 'Você não pode excluir o seu próprio acesso.' });
      }
      const { error } = await admin.auth.admin.deleteUser(id_usuario);
      if (error) return resposta({ erro: 'Não foi possível excluir: ' + error.message });
      // A tabela usuario tem ON DELETE CASCADE, mas garantimos a limpeza:
      await admin.from('usuario').delete().eq('id', id_usuario);
      return resposta({ ok: true });
    }

    if (acao === 'redefinir_senha') {
      if (!nova_senha || String(nova_senha).length < 6) {
        return resposta({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }
      const { error } = await admin.auth.admin.updateUserById(id_usuario, {
        password: String(nova_senha),
      });
      if (error) return resposta({ erro: 'Não foi possível redefinir: ' + error.message });
      return resposta({ ok: true });
    }

    return resposta({ erro: 'Ação desconhecida.' });
  } catch {
    return resposta({ erro: 'Erro interno na função.' });
  }
});
