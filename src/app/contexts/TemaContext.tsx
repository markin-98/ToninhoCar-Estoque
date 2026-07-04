import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
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

// WEB: configura o PWA (tela cheia ao adicionar à tela inicial), respeita o
// notch e IMPEDE a rolagem horizontal. Roda uma única vez. O APK ignora.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const addMeta = (name: string, content: string) => {
    if (document.querySelector(`meta[name="${name}"]`)) return;
    const m = document.createElement('meta');
    m.name = name;
    m.content = content;
    document.head.appendChild(m);
  };
  addMeta('apple-mobile-web-app-capable', 'yes');
  addMeta('mobile-web-app-capable', 'yes');
  addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  const vp = document.querySelector('meta[name="viewport"]');
  if (vp && !/viewport-fit/.test(vp.getAttribute('content') || '')) {
    vp.setAttribute('content', `${vp.getAttribute('content') || ''}, viewport-fit=cover`);
  }
  if (!document.getElementById('tc-web-css')) {
    const st = document.createElement('style');
    st.id = 'tc-web-css';
    st.textContent =
      'html,body,#root{height:100%}@supports(height:100dvh){html,body,#root{height:100dvh}}html,body{overflow-x:hidden;overscroll-behavior:none;max-width:100%}';
    document.head.appendChild(st);
  }
}

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

  // WEB: pinta o fundo da página (html/body) com a cor do tema, evitando as
  // "faixas brancas" nas áreas que o app não desenha (ex.: safe area do iPhone).
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = cores.fundo;
    document.body.style.backgroundColor = cores.fundo;
    let tc = document.querySelector('meta[name="theme-color"]');
    if (!tc) {
      tc = document.createElement('meta');
      tc.setAttribute('name', 'theme-color');
      document.head.appendChild(tc);
    }
    tc.setAttribute('content', cores.fundo);
  }, [cores.fundo]);

  return (
    <TemaContext.Provider value={{ modo, esquema, cores, definirModo }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
