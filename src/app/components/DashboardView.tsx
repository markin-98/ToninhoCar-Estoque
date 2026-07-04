import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useProdutos } from '@/contexts/ProdutosContext';
import { useTema, Cores } from '@/contexts/TemaContext';
import SeletorTema from '@/components/SeletorTema';

// Paleta de ícones para os cards de produto na lista
const PALETA_ITENS = [
  { fundo: '#DBEAFE', icone: '#3B82F6' },
  { fundo: '#EDE9FE', icone: '#7C3AED' },
  { fundo: '#FCE7F3', icone: '#DB2777' },
  { fundo: '#D1FAE5', icone: '#059669' },
  { fundo: '#FEF3C7', icone: '#D97706' },
  { fundo: '#FFE4E6', icone: '#E11D48' },
];

function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getCorEstoque(quantidade: number, minimo: number) {
  if (quantidade <= 0) return '#EF4444';
  if (quantidade <= minimo) return '#F59E0B';
  return '#10B981';
}

function getPercentualBarra(quantidade: number, minimo: number) {
  if (quantidade <= 0) return 0;
  return Math.min(quantidade / Math.max(minimo * 3, 1), 1);
}

type Props = { rotaProdutos: string; rotaEquipe?: string };

export default function DashboardView({ rotaProdutos, rotaEquipe }: Props) {
  const { usuario, logout } = useAuth();
  const { produtos } = useProdutos();
  const { cores } = useTema();
  const router = useRouter();
  const s = useMemo(() => estilos(cores), [cores]);

  const totalProdutos = produtos.length;
  const estoqueBaixo = produtos.filter((p) => p.quantidade_atual <= p.estoque_minimo).length;
  const valorTotal = produtos.reduce((acc, p) => acc + p.quantidade_atual * p.preco_atual, 0);
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.saudacao}>
            {getSaudacao()}, {primeiroNome}
          </Text>
          <Text style={s.subtitulo}>ToninhoCar Estoque</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SeletorTema />
          <TouchableOpacity
            onPress={() => { logout(); router.replace('/login'); }}
            style={s.botaoSair}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={cores.textoSec} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards de métricas verticais */}
      <View style={s.secaoCards}>

        {/* Card 1: Total de produtos */}
        <View style={s.card}>
          <View style={s.cardConteudo}>
            <Text style={s.cardTitulo}>Produtos Cadastrados</Text>
            <Text style={s.cardValor}>{totalProdutos}</Text>
            <Text style={[s.cardIndicador, { color: '#10B981' }]}>
              ↑ {totalProdutos} {totalProdutos === 1 ? 'produto' : 'produtos'} no estoque
            </Text>
          </View>
          <View style={[s.cardIcone, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="cube-outline" size={22} color="#3B82F6" />
          </View>
        </View>

        {/* Card 2: Estoque baixo */}
        <View style={s.card}>
          <View style={s.cardConteudo}>
            <Text style={s.cardTitulo}>Em Estoque Baixo</Text>
            <Text style={s.cardValor}>{estoqueBaixo}</Text>
            {estoqueBaixo === 0 ? (
              <Text style={[s.cardIndicador, { color: '#10B981' }]}>↓ Tudo em dia</Text>
            ) : (
              <Text style={[s.cardIndicador, { color: '#EF4444' }]}>
                ↑ {estoqueBaixo} {estoqueBaixo === 1 ? 'produto' : 'produtos'} em alerta
              </Text>
            )}
          </View>
          <View style={[s.cardIcone, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="warning-outline" size={22} color="#EF4444" />
          </View>
        </View>

        {/* Card 3: Valor total em estoque */}
        <View style={s.card}>
          <View style={s.cardConteudo}>
            <Text style={s.cardTitulo}>Valor em Estoque</Text>
            <Text style={[s.cardValor, { fontSize: 24 }]}>
              {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
            <Text style={[s.cardIndicador, { color: '#10B981' }]}>↑ Valor total atualizado</Text>
          </View>
          <View style={[s.cardIcone, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="cash-outline" size={22} color="#10B981" />
          </View>
        </View>

        {/* Card 4: Gestão da equipe (apenas admin) */}
        {rotaEquipe && (
          <TouchableOpacity
            style={s.card}
            onPress={() => router.push(rotaEquipe as never)}
            activeOpacity={0.8}
          >
            <View style={s.cardConteudo}>
              <Text style={s.cardTitulo}>Equipe</Text>
              <Text style={[s.cardValor, { fontSize: 18 }]}>Gerenciar acessos</Text>
              <Text style={[s.cardIndicador, { color: cores.primaria }]}>
                Cadastrar mecânicos e definir funções →
              </Text>
            </View>
            <View style={[s.cardIcone, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="people-outline" size={22} color="#7C3AED" />
            </View>
          </TouchableOpacity>
        )}

      </View>

      {/* Título da seção de produtos */}
      <View style={s.secaoHeader}>
        <Text style={s.secaoTitulo}>Produtos</Text>
        <TouchableOpacity onPress={() => router.push(rotaProdutos as never)} activeOpacity={0.7}>
          <Text style={s.verTodos}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de produtos */}
      <View style={s.lista}>
        {produtos.slice(0, 6).map((produto, index) => {
          const cor = getCorEstoque(produto.quantidade_atual, produto.estoque_minimo);
          const percentual = getPercentualBarra(produto.quantidade_atual, produto.estoque_minimo);
          const paleta = PALETA_ITENS[index % PALETA_ITENS.length];

          return (
            <View key={produto.id} style={s.itemCard}>
              <View style={[s.itemIcone, { backgroundColor: paleta.fundo }]}>
                <Ionicons name="cube" size={20} color={paleta.icone} />
              </View>
              <View style={s.itemConteudo}>
                <Text style={s.itemNome} numberOfLines={1}>{produto.nome}</Text>
                <Text style={s.itemQtd}>{produto.quantidade_atual} unidades em estoque</Text>
                <View style={s.barraFundo}>
                  <View
                    style={[
                      s.barraPreenchimento,
                      { width: `${percentual * 100}%`, backgroundColor: cor },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const estilos = (c: Cores) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.fundo },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  saudacao: { fontSize: 22, fontWeight: 'bold', color: c.texto },
  subtitulo: { fontSize: 13, color: c.textoSec, marginTop: 2 },
  botaoSair: { padding: 8, borderRadius: 8, backgroundColor: c.inputFundo },

  // Cards de métricas
  secaoCards: { paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardConteudo: { flex: 1, marginRight: 12 },
  cardTitulo: { fontSize: 13, color: c.textoSec, marginBottom: 4 },
  cardValor: { fontSize: 30, fontWeight: 'bold', color: c.texto, marginBottom: 4 },
  cardIndicador: { fontSize: 12, fontWeight: '500' },
  cardIcone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Seção de lista
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: c.texto },
  verTodos: { fontSize: 13, color: c.primaria, fontWeight: '600' },

  lista: { paddingHorizontal: 16, gap: 10 },
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
  itemQtd: { fontSize: 12, color: c.textoSec, marginBottom: 8 },
  barraFundo: { height: 7, backgroundColor: c.barraFundo, borderRadius: 4, overflow: 'hidden' },
  barraPreenchimento: { height: '100%', borderRadius: 4 },
});
