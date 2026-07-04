import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTema } from '@/contexts/TemaContext';

export default function Index() {
  const { usuario, carregando } = useAuth();
  const { cores } = useTema();

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  if (usuario.perfil === 'admin') {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(funcionario)" />;
}
