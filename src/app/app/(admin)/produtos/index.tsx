import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProdutos } from '@/contexts/ProdutosContext';
import { useTema, Cores } from '@/contexts/TemaContext';
import { Produto } from '@/types';

type Filtro = 'todos' | 'disponiveis' | 'baixo';

// Paleta de ícones para os cards — mesma do Dashboard para consistência
const PALETA_ITENS = [
  { fundo: '#DBEAFE', icone: '#3B82F6' },
  { fundo: '#EDE9FE', icone: '#7C3AED' },
  { fundo: '#FCE7F3', icone: '#DB2777' },
  { fundo: '#D1FAE5', icone: '#059669' },
  { fundo: '#FEF3C7', icone: '#D97706' },
  { fundo: '#FFE4E6', icone: '#E11D48' },
];

function getCorEstoque(qty: number, min: number): string {
  if (qty <= 0) return '#EF4444';
  if (qty <= min) return '#F59E0B';
  return '#10B981';
}

function getPercentualBarra(qty: number, min: number): number {
  if (qty <= 0) return 0;
  return Math.min(qty / Math.max(min * 3, 1), 1);
}

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'disponiveis', label: 'Disponíveis' },
  { key: 'baixo', label: 'Estoque Baixo' },
];

export default function ProdutosScreen() {
  const { produtos } = useProdutos();
  const { cores } = useTema();
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const s = useMemo(() => estilos(cores), [cores]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const termo = busca.toLowerCase();
      const buscaOk =
        busca === '' ||
        p.nome.toLowerCase().includes(termo) ||
        p.codigo.toLowerCase().includes(termo);

      const filtroOk =
        filtro === 'todos' ||
        (filtro === 'disponiveis' && p.quantidade_atual > p.estoque_minimo) ||
        (filtro === 'baixo' && p.quantidade_atual <= p.estoque_minimo);

      return buscaOk && filtroOk;
    });
  }, [produtos, busca, filtro]);

  const renderItem: ListRenderItem<Produto> = ({ item, index }) => {
    const cor = getCorEstoque(item.quantidade_atual, item.estoque_minimo);
    const percentual = getPercentualBarra(item.quantidade_atual, item.estoque_minimo);
    const paleta = PALETA_ITENS[index % PALETA_ITENS.length];

    return (
      <TouchableOpacity
        style={s.itemCard}
        onPress={() => router.push({ pathname: '/(admin)/produtos/[id]', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <View style={[s.itemIcone, { backgroundColor: paleta.fundo }]}>
          <Ionicons name="cube" size={20} color={paleta.icone} />
        </View>

        <View style={s.itemConteudo}>
          <Text style={s.itemNome} numberOfLines={1}>{item.nome}</Text>
          <Text style={s.itemSub}>
            {item.quantidade_atual} un. em estoque · {item.codigo}
          </Text>
          <View style={s.barraFundo}>
            <View
              style={[s.barraPreenchimento, { width: `${percentual * 100}%`, backgroundColor: cor }]}
            />
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={cores.textoTerc} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.titulo}>Produtos</Text>
        <Text style={s.contagem}>{produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'item' : 'itens'}</Text>
      </View>

      {/* Barra de busca pill */}
      <View style={s.buscaContainer}>
        <Ionicons name="search-outline" size={18} color={cores.textoTerc} />
        <TextInput
          style={s.buscaInput}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome ou código..."
          placeholderTextColor={cores.textoTerc}
          autoCorrect={false}
        />
        {busca !== '' && (
          <TouchableOpacity onPress={() => setBusca('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={cores.textoTerc} />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de filtro com scroll horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtrosScroll}
        contentContainerStyle={s.filtrosContent}
      >
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.chip, filtro === f.key && s.chipAtivo]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[s.chipTexto, filtro === f.key && s.chipTextoAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de produtos — só ela rola */}
      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={s.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.vazio}>
            <Ionicons name="cube-outline" size={52} color={cores.textoTerc} />
            <Text style={s.vazioTexto}>Nenhum produto encontrado</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push('/(admin)/produtos/adicionar')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const estilos = (c: Cores) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.fundo },

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  titulo: { fontSize: 24, fontWeight: 'bold', color: c.texto },
  contagem: { fontSize: 13, color: c.textoTerc, marginTop: 2 },

  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  buscaInput: { flex: 1, fontSize: 14, color: c.texto },

  filtrosScroll: { flexGrow: 0, marginBottom: 12 },
  filtrosContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.cardBorda,
  },
  chipAtivo: { backgroundColor: c.primaria, borderColor: c.primaria },
  chipTexto: { fontSize: 13, fontWeight: '500', color: c.textoSec },
  chipTextoAtivo: { color: '#FFF', fontWeight: '600' },

  lista: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },

  itemCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemIcone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemConteudo: { flex: 1 },
  itemNome: { fontSize: 15, fontWeight: '700', color: c.texto, marginBottom: 2 },
  itemSub: { fontSize: 12, color: c.textoSec, marginBottom: 8 },
  barraFundo: { height: 7, backgroundColor: c.barraFundo, borderRadius: 4, overflow: 'hidden' },
  barraPreenchimento: { height: '100%', borderRadius: 4 },

  vazio: { alignItems: 'center', marginTop: 80, gap: 12 },
  vazioTexto: { fontSize: 15, color: c.textoTerc },

  fab: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.primaria,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: c.primaria,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});
