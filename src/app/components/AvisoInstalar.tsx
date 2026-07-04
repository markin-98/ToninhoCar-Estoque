import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '@/contexts/TemaContext';

const CHAVE = 'toninhocar:aviso-instalar-fechado';

// Detecta ambiente (só na web faz sentido).
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);
const isAndroid = /android/i.test(ua);
const standalone =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    // @ts-expect-error propriedade específica do iOS Safari
    window.navigator?.standalone === true);

/**
 * Aviso (apenas WEB em celular/tablet) ensinando a "Adicionar à Tela de Início"
 * para o site abrir como um app, direto na tela de login.
 */
export default function AvisoInstalar() {
  const { cores } = useTema();
  const [fechado, setFechado] = useState(
    typeof localStorage !== 'undefined' && localStorage.getItem(CHAVE) === '1',
  );

  const deveMostrar = Platform.OS === 'web' && (isIOS || isAndroid) && !standalone && !fechado;
  if (!deveMostrar) return null;

  function fechar() {
    setFechado(true);
    try { localStorage.setItem(CHAVE, '1'); } catch { /* ignora */ }
  }

  return (
    <View style={[s.card, { backgroundColor: cores.card, borderColor: cores.cardBorda }]}>
      <View style={s.topo}>
        <Ionicons name="phone-portrait-outline" size={18} color={cores.primaria} />
        <Text style={[s.titulo, { color: cores.texto }]}>Instale o app na tela inicial</Text>
        <TouchableOpacity onPress={fechar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color={cores.textoTerc} />
        </TouchableOpacity>
      </View>

      {isIOS ? (
        <Text style={[s.texto, { color: cores.textoSec }]}>
          Toque em{'  '}
          <Ionicons name="share-outline" size={15} color={cores.textoSec} />
          {'  '}(Compartilhar) e depois em <Text style={s.negrito}>&quot;Adicionar à Tela de Início&quot;</Text>. O ToninhoCar abrirá como um app.
        </Text>
      ) : (
        <Text style={[s.texto, { color: cores.textoSec }]}>
          Toque no menu{'  '}
          <Ionicons name="ellipsis-vertical" size={15} color={cores.textoSec} />
          {'  '}e depois em <Text style={s.negrito}>&quot;Instalar app&quot;</Text> ou <Text style={s.negrito}>&quot;Adicionar à tela inicial&quot;</Text>.
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  titulo: { flex: 1, fontSize: 14, fontWeight: '700' },
  texto: { fontSize: 13, lineHeight: 20 },
  negrito: { fontWeight: '700' },
});
