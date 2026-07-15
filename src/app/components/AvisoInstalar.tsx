import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '@/contexts/TemaContext';

const CHAVE = 'toninhocar:aviso-instalar-fechado';

// Evento do Chrome/Edge (Windows, Android) que permite instalar o app.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Detecta ambiente (só na web faz sentido).
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const isIOS =
  /iphone|ipad|ipod/i.test(ua) ||
  (/Macintosh/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);
const standalone =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    // @ts-expect-error propriedade específica do iOS Safari
    window.navigator?.standalone === true);

/**
 * Aviso/botão (apenas WEB) para instalar o ToninhoCar como app.
 *  - Windows/Chrome/Edge e Android: mostra um botão "Instalar" de um clique
 *    (via evento beforeinstallprompt).
 *  - iOS/Safari: mostra o passo a passo manual ("Adicionar à Tela de Início"),
 *    pois o iOS não expõe o botão de instalação.
 */
export default function AvisoInstalar() {
  const { cores } = useTema();
  const [fechado, setFechado] = useState(
    typeof localStorage !== 'undefined' && localStorage.getItem(CHAVE) === '1',
  );
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    function aoPoderInstalar(e: Event) {
      e.preventDefault(); // impede o mini-infobar padrão; controlamos o momento
      setPromptEvent(e as BeforeInstallPromptEvent);
    }
    function aoInstalar() {
      setInstalado(true);
      setPromptEvent(null);
    }

    window.addEventListener('beforeinstallprompt', aoPoderInstalar);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoPoderInstalar);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const escolha = await promptEvent.userChoice;
    if (escolha.outcome === 'accepted') setInstalado(true);
    setPromptEvent(null);
  }

  function fechar() {
    setFechado(true);
    try {
      localStorage.setItem(CHAVE, '1');
    } catch {
      /* ignora */
    }
  }

  const podeInstalarComBotao = !!promptEvent; // Windows/Chrome/Edge e Android
  const deveMostrar =
    Platform.OS === 'web' &&
    !standalone &&
    !instalado &&
    !fechado &&
    (podeInstalarComBotao || isIOS);

  if (!deveMostrar) return null;

  return (
    <View style={[s.card, { backgroundColor: cores.card, borderColor: cores.cardBorda }]}>
      <View style={s.topo}>
        <Ionicons
          name={podeInstalarComBotao ? 'download-outline' : 'phone-portrait-outline'}
          size={18}
          color={cores.primaria}
        />
        <Text style={[s.titulo, { color: cores.texto }]}>Instale o ToninhoCar como app</Text>
        <TouchableOpacity onPress={fechar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color={cores.textoTerc} />
        </TouchableOpacity>
      </View>

      {podeInstalarComBotao ? (
        <>
          <Text style={[s.texto, { color: cores.textoSec }]}>
            Instale no seu computador ou celular para abrir em janela própria, com ícone na área de
            trabalho, sem precisar do navegador.
          </Text>
          <TouchableOpacity
            style={[s.botao, { backgroundColor: cores.primaria }]}
            onPress={instalar}
            activeOpacity={0.85}
          >
            <Ionicons name="download-outline" size={16} color={cores.primariaTexto} />
            <Text style={[s.botaoTexto, { color: cores.primariaTexto }]}>Instalar app</Text>
          </TouchableOpacity>
        </>
      ) : isIOS ? (
        <Text style={[s.texto, { color: cores.textoSec }]}>
          Toque em{'  '}
          <Ionicons name="share-outline" size={15} color={cores.textoSec} />
          {'  '}(Compartilhar) e depois em{' '}
          <Text style={s.negrito}>&quot;Adicionar à Tela de Início&quot;</Text>. O ToninhoCar abrirá
          como um app.
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  titulo: { flex: 1, fontSize: 14, fontWeight: '700' },
  texto: { fontSize: 13, lineHeight: 20 },
  negrito: { fontWeight: '700' },
  botao: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  botaoTexto: { fontSize: 14, fontWeight: '700' },
});
