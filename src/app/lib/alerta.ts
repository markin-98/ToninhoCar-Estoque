import { Alert, Platform } from 'react-native';

type Botao = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

/**
 * Substituto do Alert.alert que funciona em TODAS as plataformas.
 *
 * O Alert.alert do React Native é silenciosamente ignorado na web
 * (react-native-web não o implementa). Este helper usa os diálogos do
 * navegador (window.alert / window.confirm) quando roda na web e o
 * Alert nativo no Android/iOS.
 */
export function mostrarAlerta(titulo: string, mensagem?: string, botoes?: Botao[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(titulo, mensagem, botoes);
    return;
  }

  const texto = mensagem ? `${titulo}\n\n${mensagem}` : titulo;

  // Sem botões (ou apenas "OK"): aviso simples.
  if (!botoes || botoes.length <= 1) {
    window.alert(texto);
    botoes?.[0]?.onPress?.();
    return;
  }

  // Dois ou mais botões: confirmação (OK = ação principal, Cancelar = cancel).
  const confirmou = window.confirm(texto);
  const botaoPrincipal = botoes.find((b) => b.style !== 'cancel');
  const botaoCancelar = botoes.find((b) => b.style === 'cancel');
  if (confirmou) {
    botaoPrincipal?.onPress?.();
  } else {
    botaoCancelar?.onPress?.();
  }
}
