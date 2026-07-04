import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  TextStyle,
} from 'react-native';
import { mostrarAlerta } from '@/lib/alerta';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProdutos } from '@/contexts/ProdutosContext';
import { useTema, Cores } from '@/contexts/TemaContext';

export default function EditarProdutoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { buscarPorId, editarProduto, excluirProduto } = useProdutos();
  const { cores } = useTema();
  const router = useRouter();
  const styles = useMemo(() => estilos(cores), [cores]);

  const produto = buscarPorId(Number(id));

  const [nome, setNome] = useState(produto?.nome ?? '');
  const [codigo, setCodigo] = useState(produto?.codigo ?? '');
  const [quantidade, setQuantidade] = useState(String(produto?.quantidade_atual ?? ''));
  const [preco, setPreco] = useState(String(produto?.preco_atual ?? '').replace('.', ','));
  const [estoqueMinimo, setEstoqueMinimo] = useState(String(produto?.estoque_minimo ?? ''));
  const [descricao, setDescricao] = useState(produto?.descricao ?? '');

  useEffect(() => {
    if (!produto) {
      mostrarAlerta('Erro', 'Produto não encontrado.', [{ text: 'OK', onPress: () => router.back() }]);
    }
  }, [produto, router]);

  if (!produto) return null;

  const qtdAtual = produto.quantidade_atual;
  const minimo = produto.estoque_minimo;
  const valorTotalEstoque = qtdAtual * produto.preco_atual;
  const estoqueAbaixoMinimo = qtdAtual <= minimo;

  function validar(): string | null {
    if (!nome.trim() || nome.trim().length < 2) return 'Informe o nome do produto (mín. 2 caracteres).';
    if (!codigo.trim()) return 'Informe o código do produto.';
    if (isNaN(Number(quantidade)) || Number(quantidade) < 0) return 'Quantidade inválida.';
    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) return 'Preço unitário inválido.';
    if (isNaN(Number(estoqueMinimo)) || Number(estoqueMinimo) < 0) return 'Estoque mínimo inválido.';
    return null;
  }

  const handleSalvar = () => {
    const erro = validar();
    if (erro) {
      mostrarAlerta('Dados inválidos', erro);
      return;
    }

    editarProduto(produto.id, {
      nome: nome.trim(),
      codigo: codigo.trim().toUpperCase(),
      descricao: descricao.trim(),
      quantidade_atual: parseInt(quantidade, 10),
      preco_atual: parseFloat(preco.replace(',', '.')),
      estoque_minimo: parseInt(estoqueMinimo, 10),
    });

    mostrarAlerta('Sucesso', 'Produto atualizado com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  const handleExcluir = () => {
    mostrarAlerta(
      'Excluir Produto',
      `Deseja excluir "${produto.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            excluirProduto(produto.id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Indicadores de status */}
        <View style={styles.indicadores}>
          <View style={styles.indicador}>
            <Text style={styles.indicadorLabel}>Valor em estoque</Text>
            <Text style={styles.indicadorValor}>
              {valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>

          <View
            style={[
              styles.indicador,
              { backgroundColor: estoqueAbaixoMinimo ? '#FEF3C7' : '#F0FDF4' },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons
                name={estoqueAbaixoMinimo ? 'warning-outline' : 'checkmark-circle-outline'}
                size={14}
                color={estoqueAbaixoMinimo ? '#92400E' : '#166534'}
              />
              <Text
                style={[
                  styles.indicadorLabel,
                  { color: estoqueAbaixoMinimo ? '#92400E' : '#166534' },
                ]}
              >
                {estoqueAbaixoMinimo ? 'Estoque baixo' : 'Estoque ok'}
              </Text>
            </View>
            <Text
              style={[
                styles.indicadorValor,
                { color: estoqueAbaixoMinimo ? '#92400E' : '#166534' },
              ]}
            >
              {qtdAtual} / mín. {minimo}
            </Text>
          </View>
        </View>

        <Campo label="Nome do produto *" labelStyle={styles.label}>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Óleo Motor 5W30"
            placeholderTextColor={cores.textoTerc}
          />
        </Campo>

        <Campo label="Código *" labelStyle={styles.label}>
          <TextInput
            style={styles.input}
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Ex: PROD-001"
            placeholderTextColor={cores.textoTerc}
            autoCapitalize="characters"
          />
        </Campo>

        <View style={styles.linha}>
          <Campo label="Quantidade *" labelStyle={styles.label} style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              style={styles.input}
              value={quantidade}
              onChangeText={setQuantidade}
              placeholder="0"
              placeholderTextColor={cores.textoTerc}
              keyboardType="numeric"
            />
          </Campo>

          <Campo label="Estoque mínimo *" labelStyle={styles.label} style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              value={estoqueMinimo}
              onChangeText={setEstoqueMinimo}
              placeholder="0"
              placeholderTextColor={cores.textoTerc}
              keyboardType="numeric"
            />
          </Campo>
        </View>

        <Campo label="Preço unitário (R$) *" labelStyle={styles.label}>
          <TextInput
            style={styles.input}
            value={preco}
            onChangeText={setPreco}
            placeholder="0,00"
            placeholderTextColor={cores.textoTerc}
            keyboardType="decimal-pad"
          />
        </Campo>

        <Campo label="Descrição" labelStyle={styles.label}>
          <TextInput
            style={[styles.input, styles.inputMultilinha]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição opcional do produto..."
            placeholderTextColor={cores.textoTerc}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Campo>

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar} activeOpacity={0.85}>
          <Text style={styles.botaoSalvarTexto}>Salvar Alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoExcluir} onPress={handleExcluir} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.botaoExcluirTexto}>Excluir Produto</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({
  label,
  children,
  style,
  labelStyle,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
  labelStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text style={labelStyle}>{label}</Text>
      {children}
    </View>
  );
}

const estilos = (c: Cores) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.fundo },
  conteudo: { padding: 20, paddingBottom: 40 },
  indicadores: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  indicador: {
    flex: 1,
    backgroundColor: c.primariaSuave,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  indicadorLabel: { fontSize: 11, color: c.primaria, fontWeight: '500' },
  indicadorValor: { fontSize: 15, fontWeight: '700', color: c.primaria },
  label: { fontSize: 13, fontWeight: '600', color: c.texto, marginBottom: 6 },
  input: {
    backgroundColor: c.inputFundo,
    borderWidth: 1,
    borderColor: c.cardBorda,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.texto,
  },
  inputMultilinha: { height: 88, paddingTop: 12 },
  linha: { flexDirection: 'row' },
  botaoSalvar: {
    backgroundColor: c.primaria,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  botaoSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  botaoExcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 13,
  },
  botaoExcluirTexto: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
