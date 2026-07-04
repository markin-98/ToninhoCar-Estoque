import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTema } from '@/contexts/TemaContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused, color }: { name: IoniconName; focused: boolean; color: string }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconName)}
      size={24}
      color={color}
    />
  );
}

export default function FuncionarioLayout() {
  const { usuario, carregando } = useAuth();
  const { cores } = useTema();

  // Guarda de acesso: sem login (ou acesso desativado) volta pro login.
  if (!carregando && !usuario) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoTerc,
        tabBarStyle: { backgroundColor: cores.card, borderTopColor: cores.cardBorda },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="movimentacoes"
        options={{
          title: 'Movimentações',
          tabBarIcon: ({ focused, color }) => <TabIcon name="swap-horizontal" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fichas"
        options={{
          title: 'Fichas',
          tabBarIcon: ({ focused, color }) => <TabIcon name="car" focused={focused} color={color} />,
        }}
      />
      {/* Tela de produtos acessível via "Ver todos" no dashboard, sem aba própria */}
      <Tabs.Screen
        name="produtos"
        options={{ href: null }}
      />
    </Tabs>
  );
}
