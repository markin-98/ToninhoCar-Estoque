import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ModoTema = 'claro' | 'escuro' | 'sistema';
export type Esquema = 'claro' | 'escuro';

// Tokens de cor usados em todas as telas. Cada tela lê estas cores em vez de
// valores fixos, o que permite o app inteiro trocar de tema.
export type Cores = {
  esquema: Esquema;
  fundo: string;         // fundo da tela
  card: string;          // superfícies (cards, formulários)
  cardBorda: string;     // bordas de cards/inputs
  inputFundo: string;    // fundo de campos de texto
  texto: string;         // texto principal
  textoSec: string;      // texto secundário
  textoTerc: string;     // texto/ícones bem suaves e placeholders
  primaria: string;      // azul de destaque
  primariaSuave: string; // fundo azul claro
  primariaTexto: string; // texto sobre a cor primária
  barraFundo: string;    // trilha de barras de progresso
  divisor: string;       // linhas divisórias
  overlay: string;       // fundo escuro atrás de modais
};

const CLARO: Cores = {
  esquema: 'claro',
  fundo: '#F3F4F6',
  card: '#FFFFFF',
  cardBorda: '#E2E8F0',
  inputFundo: '#F8FAFC',
  texto: '#1E293B',
  textoSec: '#64748B',
  textoTerc: '#94A3B8',
  primaria: '#2563EB',
  primariaSuave: '#EFF6FF',
  primariaTexto: '#FFFFFF',
  barraFundo: '#E5E7EB',
  divisor: '#F1F5F9',
  overlay: 'rgba(15,23,42,0.5)',
};

const ESCURO: Cores = {
  esquema: 'escuro',
  fundo: '#0F172A',
  card: '#1E293B',
  cardBorda: '#334155',
  inputFundo: '#0B1220',
  texto: '#F1F5F9',
  textoSec: '#94A3B8',
  textoTerc: '#64748B',
  primaria: '#3B82F6',
  primariaSuave: '#1E3A5F',
  primariaTexto: '#FFFFFF',
  barraFundo: '#334155',
  divisor: '#334155',
  overlay: 'rgba(0,0,0,0.6)',
};

type TemaContextData = {
  modo: ModoTema;             // escolha do usuário (claro/escuro/sistema)
  esquema: Esquema;           // tema efetivo aplicado agora
  cores: Cores;
  definirModo: (m: ModoTema) => void;
};

const CHAVE = '@toninhocar:tema';

const TemaContext = createContext<TemaContextData>({} as TemaContextData);

export function TemaProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme(); // 'light' | 'dark' | null
  const [modo, setModo] = useState<ModoTema>('sistema');

  // Carrega a preferência salva na inicialização.
  useEffect(() => {
    AsyncStorage.getItem(CHAVE).then((v) => {
      if (v === 'claro' || v === 'escuro' || v === 'sistema') setModo(v);
    });
  }, []);

  function definirModo(m: ModoTema) {
    setModo(m);
    AsyncStorage.setItem(CHAVE, m);
  }

  const esquema: Esquema = modo === 'sistema' ? (sistema === 'dark' ? 'escuro' : 'claro') : modo;
  const cores = esquema === 'escuro' ? ESCURO : CLARO;

  return (
    <TemaContext.Provider value={{ modo, esquema, cores, definirModo }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
