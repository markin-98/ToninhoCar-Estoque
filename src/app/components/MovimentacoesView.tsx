import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { mostrarAlerta } from '@/lib/alerta';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useProdutos } from '@/contexts/ProdutosContext';
import { useMovimentacoes } from '@/contexts/MovimentacoesContext';
import { useTema, Cores } from '@/contexts/TemaContext';
import { Produto, TipoMovimentacao, Movimentacao } from '@/types';

const TIPOS: {
  key: TipoMovimentacao;
  label: string;
  cor: string;
  bg: string;
  icone: keyof typeof Ionicons.glyphMap;
  delta: 1 | -1;
  descricao: string;
}[] = [
  {
    key: 'entrada',
    label: 'Entrada',
    cor: '#059669',
    bg: '#D1FAE5',
    icone: 'arrow-up-circle',
    delta: 1,
    descricao: 'Registrar recebimento de peças no estoque.',
  },
  {
    key: 'saida',
    label: 'Saída',
    cor: '#D97706',
    bg: '#FEF3C7',
    icone: 'arrow-down-circle',
    delta: -1,
    descricao: 'Registrar uso de peças em um atendimento.',
  },
  {
    key: 'baixa',
    label: 'Baixa',
    cor: '#EF4444',
    bg: '#FEE2E2',
    icone: 'close-circle',
    delta: -1,
    descricao: 'Registrar peças danificadas, perdidas ou vencidas.',
  },
];

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

function ItemHistorico({ item, s }: { item: Movimentacao; s: ReturnType<typeof estilos> }) {
  const cfg = TIPOS.find((t) => t.key === item.tipo)!;
  const sinal = item.tipo === 'entrada' ? '+' : '-';

  return (
    <View style={s.itemCard}>
      <View style={[s.itemIcone, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icone} size={20} color={cfg.cor} />
      </View>
      <View style={s.itemConteudo}>
        <View style={s.itemLinha1}>
          <Text style={s.itemNome} numberOfLines={1}>{item.nome_produto}</Text>
          <View style={[s.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[s.badgeTexto, { color: cfg.cor }]}>{cfg.label}</Text>
          </View>
        </View>
        {item.motivo ? <Text style={s.itemMotivo}>{item.motivo}</Text> : null}
        <View style={s.itemRodape}>
          <Text style={[s.itemQtd, { color: cfg.cor }]}>{sinal}{item.quantidade} un.</Text>
          <Text style={s.itemData}>{formatarDataHora(item.data_hora)} · {item.nome_usuario}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MovimentacoesView() {
  const { usuario } = useAuth();
  const { produtos, atualizarQuantidade } = useProdutos();
  const { movimentacoes, registrarMovimentacao } = useMovimentacoes();
  const { cores } = useTema();
  const s = useMemo(() => estilos(cores), [cores]);

  const [tipoAtivo, setTipoAtivo] = useState<TipoMovimentacao>('entrada');
  const [busca, setBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');

  const cfg = TIPOS.find((t) => t.key === tipoAtivo)!;

  const resultadosBusca = useMemo(() => {
    if (!busca.trim() || produtoSelecionado) return [];
    const termo = busca.toLowerCase();
    return produtos
      .filter((p) => p.nome.toLowerCase().includes(termo) || p.codigo.toLowerCase().includes(termo))
      .slice(0, 5);
  }, [busca, produtos, produtoSelecionado]);

  function selecionarProduto(p: Produto) {
    setProdutoSelecionado(p);
    setBusca(p.nome);
  }

  function limpar() {
    setProdutoSelecionado(null);
    setBusca('');
    setQuantidade('');
    setMotivo('');
  }

  function handleConfirmar() {
    if (!produtoSelecionado) {
      mostrarAlerta('Atenção', 'Selecione um produto na busca.');
      return;
    }
    const qty = parseInt(quantidade, 10);
    if (isNaN(qty) || qty <= 0) {
      mostrarAlerta('Atenção', 'Informe uma quantidade válida (maior que zero).');
      return;
    }
    if (tipoAtivo !== 'entrada' && qty > produtoSelecionado.quantidade_atual) {
      mostrarAlerta(
        'Estoque insuficiente',
        `Estoque de "${produtoSelecionado.nome}" é ${produtoSelecionado.quantidade_atual} un. Não é possível registrar ${qty} un.`,
      );
      return;
    }

    registrarMovimentacao({
      id_produto: produtoSelecionado.id,
      nome_produto: produtoSelecionado.nome,
      tipo: tipoAtivo,
      quantidade: qty,
      nome_usuario: usuario?.nome ?? 'Usuário',
      data_hora: new Date().toISOString(),
      motivo: motivo.trim(),
    });

    atualizarQuantidade(produtoSelecionado.id, cfg.delta * qty);

    const labels = { entrada: 'Entrada registrada', saida: 'Saída registrada', baixa: 'Baixa registrada' };
    mostrarAlerta('Sucesso', `${labels[tipoAtivo]}: ${qty} un. de "${produtoSelecionado.nome}".`, [
      { text: 'OK', onPress: limpar },
    ]);
  }

  const estoqueOk =
    produtoSelecionado && produtoSelecionado.quantidade_atual > produtoSelecionado.estoque_minimo;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.titulo}>Movimentações</Text>

        {/* Seletor de tipo — 3 cards em linha */}
        <View style={s.seletor}>
          {TIPOS.map((t) => {
            const ativo = tipoAtivo === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  s.seletorCard,
                  ativo
                    ? { backgroundColor: t.cor, borderColor: t.cor }
                    : { backgroundColor: cores.card, borderColor: cores.cardBorda },
                ]}
                onPress={() => { setTipoAtivo(t.key); limpar(); }}
                activeOpacity={0.8}
              >
                <View style={[s.seletorIcone, { backgroundColor: ativo ? 'rgba(255,255,255,0.25)' : t.bg }]}>
                  <Ionicons name={t.icone} size={18} color={ativo ? '#FFF' : t.cor} />
                </View>
                <Text style={[s.seletorLabel, ativo ? { color: '#FFF', fontWeight: '700' } : { color: cores.textoSec }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Descrição do tipo selecionado */}
        <View style={[s.descricaoCard, { backgroundColor: cfg.bg }]}>
          <Ionicons name="information-circle-outline" size={15} color={cfg.cor} />
          <Text style={[s.descricaoTexto, { color: cfg.cor }]}>{cfg.descricao}</Text>
        </View>

        {/* Formulário dentro de card */}
        <View style={s.formCard}>

          <Text style={s.label}>Produto</Text>
          <View style={[s.buscaContainer, produtoSelecionado && { borderColor: cfg.cor }]}>
            <Ionicons name="search-outline" size={18} color={cores.textoTerc} />
            <TextInput
              style={s.buscaInput}
              value={busca}
              onChangeText={(t) => { setBusca(t); setProdutoSelecionado(null); }}
              placeholder="Buscar por nome ou código..."
              placeholderTextColor={cores.textoTerc}
              autoCorrect={false}
            />
            {(busca !== '' || produtoSelecionado) && (
              <TouchableOpacity onPress={limpar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={cores.textoTerc} />
              </TouchableOpacity>
            )}
          </View>

          {resultadosBusca.length > 0 && (
            <View style={s.dropdown}>
              {resultadosBusca.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  style={[s.dropdownItem, i < resultadosBusca.length - 1 && s.dropdownDivider]}
                  onPress={() => selecionarProduto(p)}
                  activeOpacity={0.7}
                >
                  <Text style={s.dropdownNome}>{p.nome}</Text>
                  <Text style={s.dropdownSub}>{p.codigo} · {p.quantidade_atual} un. em estoque</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {produtoSelecionado && (
            <View style={[s.produtoSelecionado, { borderColor: cfg.cor + '40' }]}>
              <View style={[s.produtoSelecionadoIcone, { backgroundColor: cfg.bg }]}>
                <Ionicons name="cube" size={18} color={cfg.cor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.produtoNome}>{produtoSelecionado.nome}</Text>
                <Text style={s.produtoCodigo}>{produtoSelecionado.codigo}</Text>
                {tipoAtivo !== 'entrada' && !estoqueOk && (
                  <Text style={s.avisoEstoque}>
                    Estoque abaixo do mínimo ({produtoSelecionado.estoque_minimo} un.)
                  </Text>
                )}
              </View>
              <View style={s.produtoEstoqueBloco}>
                <Text style={s.produtoEstoqueLabel}>Estoque</Text>
                <Text style={[s.produtoEstoqueValor, { color: estoqueOk ? '#059669' : '#EF4444' }]}>
                  {produtoSelecionado.quantidade_atual} un.
                </Text>
              </View>
            </View>
          )}

          <Text style={[s.label, { marginTop: 16 }]}>Quantidade</Text>
          <TextInput
            style={[s.input, { borderColor: cfg.cor + '60' }]}
            value={quantidade}
            onChangeText={setQuantidade}
            placeholder="0"
            placeholderTextColor={cores.textoTerc}
            keyboardType="numeric"
          />

          <Text style={[s.label, { marginTop: 16 }]}>
            {tipoAtivo === 'baixa' ? 'Motivo da baixa' : 'Observação (opcional)'}
          </Text>
          <TextInput
            style={[s.input, s.inputMulti, { borderColor: cfg.cor + '60' }]}
            value={motivo}
            onChangeText={setMotivo}
            placeholder={
              tipoAtivo === 'entrada'
                ? 'Ex: Reposição de estoque'
                : tipoAtivo === 'saida'
                ? 'Ex: Substituição veículo ABC-1234'
                : 'Ex: Peças danificadas na entrega'
            }
            placeholderTextColor={cores.textoTerc}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[s.botao, { backgroundColor: cfg.cor }]}
            onPress={handleConfirmar}
            activeOpacity={0.85}
          >
            <Ionicons name={cfg.icone} size={20} color="#FFF" />
            <Text style={s.botaoTexto}>Confirmar {cfg.label}</Text>
          </TouchableOpacity>

        </View>

        {/* Histórico */}
        <View style={s.historicoHeader}>
          <Text style={s.historicoTitulo}>Movimentações recentes</Text>
        </View>

        {movimentacoes.length === 0 ? (
          <View style={s.vazio}>
            <Ionicons name="document-text-outline" size={44} color={cores.textoTerc} />
            <Text style={s.vazioTexto}>Nenhuma movimentação registrada.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {movimentacoes.slice(0, 15).map((m) => (
              <ItemHistorico key={m.id} item={m} s={s} />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = (c: Cores) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.fundo },
  conteudo: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },

  titulo: { fontSize: 24, fontWeight: 'bold', color: c.texto, marginBottom: 20 },

  seletor: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  seletorCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  seletorIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seletorLabel: { fontSize: 13, fontWeight: '500' },

  descricaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  descricaoTexto: { fontSize: 13, fontWeight: '500', flex: 1 },

  formCard: {
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  label: { fontSize: 13, fontWeight: '600', color: c.texto, marginBottom: 8 },

  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.inputFundo,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: c.cardBorda,
    gap: 8,
    marginBottom: 4,
  },
  buscaInput: { flex: 1, fontSize: 14, color: c.texto },

  dropdown: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.cardBorda,
    marginTop: 4,
    marginBottom: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropdownDivider: { borderBottomWidth: 1, borderBottomColor: c.divisor },
  dropdownNome: { fontSize: 14, fontWeight: '600', color: c.texto },
  dropdownSub: { fontSize: 12, color: c.textoTerc, marginTop: 2 },

  produtoSelecionado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.inputFundo,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  produtoSelecionadoIcone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  produtoNome: { fontSize: 14, fontWeight: '700', color: c.texto },
  produtoCodigo: { fontSize: 12, color: c.textoTerc, marginTop: 1 },
  avisoEstoque: { fontSize: 11, color: '#D97706', fontWeight: '500', marginTop: 3 },
  produtoEstoqueBloco: { alignItems: 'flex-end' },
  produtoEstoqueLabel: { fontSize: 11, color: c.textoTerc },
  produtoEstoqueValor: { fontSize: 18, fontWeight: '800', marginTop: 1 },

  input: {
    backgroundColor: c.inputFundo,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.texto,
  },
  inputMulti: { height: 76, paddingTop: 12, textAlignVertical: 'top' },

  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
  },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  historicoHeader: { marginBottom: 12 },
  historicoTitulo: { fontSize: 18, fontWeight: 'bold', color: c.texto },

  itemCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemConteudo: { flex: 1 },
  itemLinha1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemNome: { fontSize: 14, fontWeight: '700', color: c.texto, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeTexto: { fontSize: 11, fontWeight: '700' },
  itemMotivo: { fontSize: 12, color: c.textoSec, marginBottom: 6 },
  itemRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemQtd: { fontSize: 13, fontWeight: '700' },
  itemData: { fontSize: 11, color: c.textoTerc },

  vazio: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  vazioTexto: { fontSize: 14, color: c.textoTerc },
});
