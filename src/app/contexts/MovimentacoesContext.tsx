import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { mostrarAlerta } from '@/lib/alerta';
import { aplicarMudanca, MudancaPostgres } from '@/lib/realtime';
import { Movimentacao, TipoMovimentacao } from '@/types';

type NovaMovimentacao = Omit<Movimentacao, 'id'>;

type MovimentacoesContextData = {
  movimentacoes: Movimentacao[];
  registrarMovimentacao: (data: NovaMovimentacao) => Promise<void>;
};

type MovimentacaoRow = {
  id_movimentacao: number;
  id_produto: number;
  nome_produto: string;
  tipo: string;
  quantidade: number;
  nome_usuario: string;
  data_hora: string;
  motivo: string | null;
};

function mapRow(row: MovimentacaoRow): Movimentacao {
  return {
    id: row.id_movimentacao,
    id_produto: row.id_produto,
    nome_produto: row.nome_produto,
    tipo: row.tipo as TipoMovimentacao,
    quantidade: row.quantidade,
    nome_usuario: row.nome_usuario,
    data_hora: row.data_hora,
    motivo: row.motivo ?? '',
  };
}

const MovimentacoesContext = createContext<MovimentacoesContextData>({} as MovimentacoesContextData);

export function MovimentacoesProvider({ children }: { children: ReactNode }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const emailUsuario = useAuth().usuario?.email ?? null;

  async function carregar() {
    const { data } = await supabase
      .from('movimentacao')
      .select('*')
      .order('data_hora', { ascending: false });
    if (data) setMovimentacoes((data as MovimentacaoRow[]).map(mapRow));
  }

  useEffect(() => {
    // Só carrega depois que o usuário está logado (necessário quando o RLS está ativo).
    if (!emailUsuario) { setMovimentacoes([]); return; }
    carregar();
    // Tempo real: aplica só a movimentação nova (economiza banda; não recarrega tudo).
    const canal = supabase
      .channel('movimentacao-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movimentacao' }, (payload) =>
        setMovimentacoes((prev) => aplicarMudanca(prev, payload as unknown as MudancaPostgres, mapRow, 'id_movimentacao')),
      )
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [emailUsuario]);

  async function registrarMovimentacao(data: NovaMovimentacao) {
    // Insere e recebe a linha com o id real; adiciona ao estado (o eco do
    // Realtime é deduplicado pelo id, então não duplica).
    const { data: inserida, error } = await supabase.from('movimentacao').insert({
      id_produto: data.id_produto,
      nome_produto: data.nome_produto,
      nome_usuario: data.nome_usuario,
      tipo: data.tipo,
      quantidade: data.quantidade,
      data_hora: data.data_hora,
      motivo: data.motivo,
    }).select().single();
    if (error || !inserida) {
      mostrarAlerta('Erro', 'Não foi possível registrar a movimentação.');
      return;
    }
    const nova = mapRow(inserida as MovimentacaoRow);
    setMovimentacoes((prev) => (prev.some((m) => m.id === nova.id) ? prev : [nova, ...prev]));
  }

  return (
    <MovimentacoesContext.Provider value={{ movimentacoes, registrarMovimentacao }}>
      {children}
    </MovimentacoesContext.Provider>
  );
}

export function useMovimentacoes() {
  return useContext(MovimentacoesContext);
}

export type { TipoMovimentacao, NovaMovimentacao };
