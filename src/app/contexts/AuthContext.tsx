import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type Perfil = 'admin' | 'funcionario';

type Usuario = {
  nome: string;
  email: string;
  perfil: Perfil;
};

type AuthContextData = {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function mapearUsuario(user: { email?: string; user_metadata?: Record<string, string> }): Usuario {
  const meta = user.user_metadata ?? {};
  return {
    nome: meta.nome ?? user.email?.split('@')[0] ?? 'Usuário',
    email: user.email ?? '',
    perfil: meta.perfil === 'admin' ? 'admin' : 'funcionario',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUsuario(mapearUsuario(session.user));
      setCarregando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ? mapearUsuario(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Complementa os dados com a tabela `usuario` (fonte oficial do perfil).
  // Se a tabela ainda não existir no banco, mantém o que veio do metadata.
  useEffect(() => {
    if (!usuario?.email) return;
    supabase
      .from('usuario')
      .select('nome, perfil, ativo')
      .eq('email', usuario.email)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (!data.ativo) {
          // Usuário desativado pela administradora: encerra a sessão.
          supabase.auth.signOut();
          setUsuario(null);
          return;
        }
        setUsuario((atual) =>
          atual && (atual.nome !== data.nome || atual.perfil !== data.perfil)
            ? { ...atual, nome: data.nome, perfil: data.perfil === 'admin' ? 'admin' : 'funcionario' }
            : atual,
        );
      });
  }, [usuario?.email]);

  async function login(email: string, senha: string): Promise<void> {
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setCarregando(false);
      throw new Error('Usuário ou senha inválidos.');
    }

    // Verifica ANTES de liberar a entrada se o acesso está ativo.
    // Usuário desativado é deslogado na hora e recebe a mensagem de erro,
    // sem chegar a entrar no app.
    const { data } = await supabase
      .from('usuario')
      .select('ativo')
      .eq('email', email)
      .maybeSingle();

    if (data && data.ativo === false) {
      await supabase.auth.signOut();
      setUsuario(null);
      setCarregando(false);
      throw new Error('Este acesso foi desativado pela administração. Fale com o responsável da oficina.');
    }

    setCarregando(false);
  }

  function logout() {
    supabase.auth.signOut();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
