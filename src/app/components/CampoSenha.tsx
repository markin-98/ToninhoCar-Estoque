import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '@/contexts/TemaContext';

type Props = Omit<TextInputProps, 'secureTextEntry' | 'style'> & {
  /** Estilo da "caixa" do input (o mesmo que você usaria no TextInput). */
  boxStyle?: StyleProp<ViewStyle>;
};

/**
 * Campo de senha com botão de "olhinho" para mostrar/ocultar o que foi digitado.
 * Reutilizável em qualquer tela — basta passar o mesmo boxStyle do input normal.
 */
export default function CampoSenha({ boxStyle, ...props }: Props) {
  const [visivel, setVisivel] = useState(false);
  const { cores } = useTema();

  return (
    <View style={[styles.caixa, boxStyle]}>
      <TextInput
        {...props}
        style={[styles.input, { color: cores.texto }]}
        secureTextEntry={!visivel}
        placeholderTextColor={props.placeholderTextColor ?? cores.textoTerc}
      />
      <TouchableOpacity
        onPress={() => setVisivel((v) => !v)}
        style={styles.botao}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        <Ionicons name={visivel ? 'eye-off-outline' : 'eye-outline'} size={20} color={cores.textoTerc} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 15, padding: 0 },
  botao: { paddingLeft: 10, paddingVertical: 4 },
});
