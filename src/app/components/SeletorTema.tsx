import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema, ModoTema } from '@/contexts/TemaContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const OPCOES: { modo: ModoTema; label: string; icone: IoniconName }[] = [
  { modo: 'claro', label: 'Claro', icone: 'sunny-outline' },
  { modo: 'escuro', label: 'Escuro', icone: 'moon-outline' },
  { modo: 'sistema', label: 'Automático (seguir o celular)', icone: 'phone-portrait-outline' },
];

export default function SeletorTema() {
  const { modo, esquema, cores, definirModo } = useTema();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setAberto(true)}
        style={[styles.botao, { backgroundColor: cores.inputFundo }]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Escolher tema do app"
      >
        <Ionicons name={esquema === 'escuro' ? 'moon' : 'sunny'} size={20} color={cores.textoSec} />
      </TouchableOpacity>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <TouchableOpacity
          style={[styles.fundo, { backgroundColor: cores.overlay }]}
          activeOpacity={1}
          onPress={() => setAberto(false)}
        >
          <View style={[styles.card, { backgroundColor: cores.card }]}>
            <Text style={[styles.titulo, { color: cores.texto }]}>Tema do app</Text>
            {OPCOES.map((op) => {
              const ativo = modo === op.modo;
              return (
                <TouchableOpacity
                  key={op.modo}
                  style={[
                    styles.opcao,
                    {
                      borderColor: ativo ? cores.primaria : cores.cardBorda,
                      backgroundColor: ativo ? cores.primariaSuave : 'transparent',
                    },
                  ]}
                  onPress={() => { definirModo(op.modo); setAberto(false); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={op.icone} size={20} color={ativo ? cores.primaria : cores.textoSec} />
                  <Text style={[styles.opcaoTexto, { color: ativo ? cores.primaria : cores.texto }]}>
                    {op.label}
                  </Text>
                  {ativo && <Ionicons name="checkmark-circle" size={18} color={cores.primaria} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: { padding: 8, borderRadius: 8 },
  fundo: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: { width: '100%', maxWidth: 340, borderRadius: 18, padding: 20, gap: 10 },
  titulo: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  opcaoTexto: { flex: 1, fontSize: 15, fontWeight: '600' },
});
