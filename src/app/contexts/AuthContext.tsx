import { createContext, useContext, useState, ReactNode } from 'react';

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

// Usuários mockados — substituir pelas chamadas ao Supabase quando o backend estiver pronto
const USUARIOS_MOCK = [
  { nome: 'Admin Toninho', email: 'admin@toninho.com', senha: '123456', perfil: 'admin' as Perfil },
  { nome: 'José Funcionário', email: 'func@toninho.com', senha: '123456', perfil: 'funcionario' as Perfil },
];

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function login(email: string, senha: string): Promise<void> {
    setCarregando(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const encontrado = USUARIOS_MOCK.find(
      (u) => u.email === email.toLowerCase().trim() && u.senha === senha,
    );

    setCarregando(false);

    if (!encontrado) {
      throw new Error('Email ou senha inválidos.');
    }

    setUsuario({ nome: encontrado.nome, email: encontrado.email, perfil: encontrado.perfil });
  }

  function logout() {
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
