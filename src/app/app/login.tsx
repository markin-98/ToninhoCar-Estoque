import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { mostrarAlerta } from '@/lib/alerta';
import CampoSenha from '@/components/CampoSenha';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTema, Cores } from '@/contexts/TemaContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, carregando } = useAuth();
  const { cores } = useTema();
  const router = useRouter();
  const styles = useMemo(() => estilos(cores), [cores]);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      mostrarAlerta('Atenção', 'Preencha o usuário e a senha para continuar.');
      return;
    }

    // Permite digitar só o usuário (ex: "joao") — o app completa @toninho.com.
    const emailFinal = email.includes('@')
      ? email.trim().toLowerCase()
      : `${email.trim().toLowerCase()}@toninho.com`;

    try {
      await login(emailFinal, senha);
      // Redireciona para o index, que encaminha ao painel correto conforme o perfil
      router.replace('/');
    } catch (error) {
      mostrarAlerta('Erro', error instanceof Error ? error.message : 'Erro ao fazer login.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <View style={styles.logoIcone}>
            <Text style={styles.logoLetra}>TC</Text>
          </View>
          <Text style={styles.titulo}>ToninhoCar</Text>
          <Text style={styles.subtitulo}>Sistema de Estoque</Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.label}>Usuário</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ex: joao"
            placeholderTextColor={cores.textoTerc}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!carregando}
          />

          <Text style={styles.label}>Senha</Text>
          <CampoSenha
            boxStyle={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            editable={!carregando}
          />

          <TouchableOpacity
            style={[styles.botao, carregando && styles.botaoDesabilitado]}
            onPress={handleLogin}
            disabled={carregando}
            activeOpacity={0.8}
          >
            {carregando ? (
              <ActivityIndicator color={cores.primariaTexto} />
            ) : (
              <Text style={styles.botaoTexto}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = (c: Cores) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.fundo,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcone: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: c.primaria,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoLetra: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: c.texto,
  },
  subtitulo: {
    fontSize: 14,
    color: c.textoSec,
    marginTop: 4,
  },
  formulario: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: c.texto,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: c.cardBorda,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.texto,
    backgroundColor: c.inputFundo,
  },
  botao: {
    backgroundColor: c.primaria,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
