import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFichas } from '@/contexts/FichasContext';
import { useTema, Cores } from '@/contexts/TemaContext';
import { FichaCarro, StatusFicha } from '@/types';

const STATUS_CONFIG: Record<StatusFicha, { label: string; cor: string }> = {
  aberta:    { label: 'Aberta',    cor: '#3B82F6' },
  concluida: { label: 'Concluída', cor: '#22C55E' },
  cancelada: { label: 'Cancelada', cor: '#EF4444' },
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function calcularTotal(ficha: FichaCarro) {
  return ficha.itens.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0);
}

type Props = { rotaCriar: string; rotaDetalhes: string };

export default function FichasLista({ rotaCriar, rotaDetalhes }: Props) {
  const { fichas } = useFichas();
  const { cores } = useTema();
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const styles = useMemo(() => estilos(cores), [cores]);

  const fichasFiltradas = useMemo(() => {
    if (!busca.trim()) return fichas;
    const t = busca.toLowerCase();
    return fichas.filter(
      (f) =>
        f.placa.toLowerCase().includes(t) ||
        f.nome_cliente.toLowerCase().includes(t) ||
        f.modelo.toLowerCase().includes(t),
    );
  }, [fichas, busca]);

  const renderItem: ListRenderItem<FichaCarro> = ({ item }) => {
    const status = STATUS_CONFIG[item.status];
    const total = calcularTotal(item);

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push({ pathname: rotaDetalhes as never, params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.itemTopo}>
          <View style={styles.itemEsquerda}>
            <Text style={styles.itemPlaca}>{item.placa}</Text>
            <Text style={styles.itemModelo}>
              {item.modelo}{item.ano ? ` • ${item.ano}` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.cor + '20', borderColor: status.cor }]}>
            <Text style={[styles.statusTexto, { color: status.cor }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.itemRodape}>
          <View style={styles.itemCliente}>
            <Ionicons name="person-outline" size={13} color={cores.textoTerc} />
            <Text style={styles.itemClienteTexto}>{item.nome_cliente}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemData}>{formatarData(item.data_atendimento)}</Text>
            {total > 0 && (
              <Text style={styles.itemTotal}>
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text>
            )}
          </View>
        </View>

        {item.itens.length > 0 && (
          <Text style={styles.itemPecas}>
            {item.itens.length} {item.itens.length === 1 ? 'peça' : 'peças'} utilizadas
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Fichas de Carro</Text>
          <Text style={styles.contagem}>{fichasFiltradas.length} registros</Text>
        </View>
      </View>

      <View style={styles.buscaContainer}>
        <Ionicons name="search-outline" size={18} color={cores.textoTerc} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.buscaInput}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por placa, cliente ou modelo..."
          placeholderTextColor={cores.textoTerc}
          autoCorrect={false}
          autoCapitalize="characters"
        />
        {busca !== '' && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={18} color={cores.textoTerc} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={fichasFiltradas}
        keyExtractor={(f) => String(f.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="car-outline" size={52} color={cores.textoTerc} />
            <Text style={styles.vazioTexto}>Nenhuma ficha encontrada</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(rotaCriar as never)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const estilos = (c: Cores) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.fundo },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: c.texto },
  contagem: { fontSize: 13, color: c.textoTerc, marginTop: 2 },
  buscaContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.card,
    borderRadius: 12, marginHorizontal: 20, marginBottom: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: c.cardBorda,
  },
  buscaInput: { flex: 1, fontSize: 15, color: c.texto },
  lista: { paddingHorizontal: 20, paddingBottom: 100 },
  item: {
    backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  itemEsquerda: { flex: 1, marginRight: 10 },
  itemPlaca: { fontSize: 18, fontWeight: 'bold', color: c.texto, letterSpacing: 1 },
  itemModelo: { fontSize: 13, color: c.textoSec, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusTexto: { fontSize: 11, fontWeight: '700' },
  itemRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCliente: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  itemClienteTexto: { fontSize: 13, color: c.textoSec },
  itemInfo: { alignItems: 'flex-end' },
  itemData: { fontSize: 12, color: c.textoTerc },
  itemTotal: { fontSize: 13, fontWeight: '700', color: c.primaria, marginTop: 2 },
  itemPecas: { fontSize: 11, color: c.textoTerc, marginTop: 8 },
  vazio: { alignItems: 'center', marginTop: 80, gap: 12 },
  vazioTexto: { fontSize: 15, color: c.textoTerc },
  fab: {
    position: 'absolute', bottom: 90, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: c.primaria, justifyContent: 'center', alignItems: 'center',
    shadowColor: c.primaria, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});
