import { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, StyleProp, TextStyle,
} from 'react-native';
import { mostrarAlerta } from '@/lib/alerta';
import { useRouter } from 'expo-router';
import { useFichas } from '@/contexts/FichasContext';
import { useTema, Cores } from '@/contexts/TemaContext';

type Props = { rotaDetalhes: string };

export default function CriarFichaForm({ rotaDetalhes }: Props) {
  const { criarFicha } = useFichas();
  const { cores } = useTema();
  const router = useRouter();
  const styles = useMemo(() => estilos(cores), [cores]);

  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [observacoes, setObservacoes] = useState('');

  function formatarPlaca(texto: string) {
    return texto.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
  }

  function validar(): string | null {
    if (!placa.trim() || placa.trim().length < 7) return 'Informe uma placa válida (mín. 7 caracteres).';
    if (!modelo.trim()) return 'Informe o modelo do veículo.';
    if (!nomeCliente.trim()) return 'Informe o nome do proprietário.';
    if (ano && (isNaN(Number(ano)) || Number(ano) < 1900 || Number(ano) > 2030))
      return 'Ano inválido.';
    return null;
  }

  function handleCriar() {
    const erro = validar();
    if (erro) { mostrarAlerta('Dados inválidos', erro); return; }

    const id = criarFicha({
      placa: placa.trim(),
      modelo: modelo.trim(),
      ano: ano ? parseInt(ano, 10) : null,
      nome_cliente: nomeCliente.trim(),
      observacoes: observacoes.trim(),
    });

    router.replace({ pathname: rotaDetalhes as never, params: { id } });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">

        <Campo label="Placa *" labelStyle={styles.label}>
          <TextInput
            style={styles.input}
            value={placa}
            onChangeText={(t) => setPlaca(formatarPlaca(t))}
            placeholder="Ex: ABC-1234 ou ABC1D23"
            placeholderTextColor={cores.textoTerc}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </Campo>

        <Campo label="Nome do proprietário *" labelStyle={styles.label}>
          <TextInput
            style={styles.input}
            value={nomeCliente}
            onChangeText={setNomeCliente}
            placeholder="Ex: João da Silva"
            placeholderTextColor={cores.textoTerc}
          />
        </Campo>

        <Campo label="Modelo *" labelStyle={styles.label}>
          <TextInput
            style={styles.input}
            value={modelo}
            onChangeText={setModelo}
            placeholder="Ex: Volkswagen Golf 1.4"
            placeholderTextColor={cores.textoTerc}
          />
        </Campo>

        <Campo label="Ano" labelStyle={styles.label}>
          <TextInput
            style={styles.input}
            value={ano}
            onChangeText={setAno}
            placeholder="Ex: 2022"
            placeholderTextColor={cores.textoTerc}
            keyboardType="numeric"
            maxLength={4}
          />
        </Campo>

        <Campo label="Observações" labelStyle={styles.label}>
          <TextInput
            style={[styles.input, styles.inputMultilinha]}
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Descrição do problema ou observações iniciais..."
            placeholderTextColor={cores.textoTerc}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Campo>

        <TouchableOpacity style={styles.botao} onPress={handleCriar} activeOpacity={0.85}>
          <Text style={styles.botaoTexto}>Criar Ficha</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({
  label,
  children,
  labelStyle,
}: {
  label: string;
  children: React.ReactNode;
  labelStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
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
    backgroundColor: c.inputFundo, borderWidth: 1, borderColor: c.cardBorda,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: c.texto,
  },
  inputMultilinha: { height: 88, paddingTop: 12 },
  botao: {
    backgroundColor: c.primaria, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 8,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
