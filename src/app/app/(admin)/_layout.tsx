import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTema } from '@/contexts/TemaContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused, color }: { name: IoniconName; focused: boolean; color: string }) {
  return <Ionicons name={focused ? name : (`${name}-outline` as IoniconName)} size={24} color={color} />;
}

export default function AdminLayout() {
  const { usuario, carregando } = useAuth();
  const { cores } = useTema();

  // Guarda de acesso: sem login (ou acesso desativado) volta pro login;
  // funcionário não acessa a área do admin.
  if (!carregando && !usuario) return <Redirect href="/login" />;
  if (!carregando && usuario && usuario.perfil !== 'admin') return <Redirect href="/(funcionario)" />;

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
        name="produtos"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ focused, color }) => <TabIcon name="cube" focused={focused} color={color} />,
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
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ focused, color }) => <TabIcon name="bar-chart" focused={focused} color={color} />,
        }}
      />
      {/* Tela de gestão da equipe: acessada pelo card no Início (não vira aba) */}
      <Tabs.Screen name="equipe" options={{ href: null }} />
    </Tabs>
  );
}
