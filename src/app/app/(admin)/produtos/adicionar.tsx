import { useMemo, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useProdutos } from '@/contexts/ProdutosContext';
import { useTema, Cores } from '@/contexts/TemaContext';

export default function AdicionarProdutoScreen() {
  const { adicionarProduto, proximoCodigo } = useProdutos();
  const { cores } = useTema();
  const router = useRouter();
  const styles = useMemo(() => estilos(cores), [cores]);

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState(proximoCodigo);
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [descricao, setDescricao] = useState('');

  function validar(): string | null {
    if (!nome.trim() || nome.trim().length < 2) return 'Informe o nome do produto (mín. 2 caracteres).';
    if (!codigo.trim()) return 'Informe o código do produto.';
    if (isNaN(Number(quantidade)) || Number(quantidade) < 0) return 'Quantidade inicial inválida.';
    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) return 'Preço unitário inválido.';
    if (isNaN(Number(estoqueMinimo)) || Number(estoqueMinimo) < 0) return 'Estoque mínimo inválido.';
    return null;
  }

  function handleCadastrar() {
    const erro = validar();
    if (erro) {
      mostrarAlerta('Dados inválidos', erro);
      return;
    }

    adicionarProduto({
      nome: nome.trim(),
      codigo: codigo.trim().toUpperCase(),
      descricao: descricao.trim(),
      quantidade_atual: parseInt(quantidade, 10),
      preco_atual: parseFloat(preco.replace(',', '.')),
      estoque_minimo: parseInt(estoqueMinimo, 10),
    });

    mostrarAlerta('Sucesso', 'Produto cadastrado com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
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
            placeholder="Ex: PROD-007"
            placeholderTextColor={cores.textoTerc}
            autoCapitalize="characters"
          />
        </Campo>

        <View style={styles.linha}>
          <Campo label="Qtd. inicial *" labelStyle={styles.label} style={{ flex: 1, marginRight: 8 }}>
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

        <TouchableOpacity style={styles.botao} onPress={handleCadastrar} activeOpacity={0.85}>
          <Text style={styles.botaoTexto}>Cadastrar Produto</Text>
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
  botao: {
    backgroundColor: c.primaria,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
