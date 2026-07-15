import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { mostrarAlerta } from '@/lib/alerta';
import { aplicarMudanca, MudancaPostgres } from '@/lib/realtime';
import { FichaCarro, ItemFicha } from '@/types';

type NovaFicha = Omit<FichaCarro, 'id' | 'data_atendimento' | 'status' | 'itens'>;

type FichasContextData = {
  fichas: FichaCarro[];
  criarFicha: (data: NovaFicha) => Promise<number | null>;
  atualizarFicha: (id: number, data: Partial<Pick<FichaCarro, 'status' | 'observacoes'>>) => Promise<void>;
  excluirFicha: (id: number) => Promise<void>;
  buscarPorId: (id: number) => FichaCarro | undefined;
  adicionarItem: (id_ficha: number, item: Omit<ItemFicha, 'id'>) => Promise<void>;
  removerItem: (id_ficha: number, id_item: number) => Promise<void>;
};

type FichaRow = {
  id_ficha: number;
  placa: string;
  modelo: string;
  ano: number | null;
  nome_cliente: string;
  data_atendimento: string;
  observacoes: string | null;
  status: string;
  itens: ItemFicha[] | null;
};

function mapRow(row: FichaRow): FichaCarro {
  return {
    id: row.id_ficha,
    placa: row.placa,
    modelo: row.modelo,
    ano: row.ano,
    nome_cliente: row.nome_cliente,
    data_atendimento: row.data_atendimento,
    observacoes: row.observacoes ?? '',
    status: row.status as FichaCarro['status'],
    itens: Array.isArray(row.itens) ? row.itens : [],
  };
}

const FichasContext = createContext<FichasContextData>({} as FichasContextData);

export function FichasProvider({ children }: { children: ReactNode }) {
  const [fichas, setFichas] = useState<FichaCarro[]>([]);
  const emailUsuario = useAuth().usuario?.email ?? null;

  async function carregar() {
    const { data } = await supabase
      .from('ficha_carro')
      .select('*')
      .order('data_atendimento', { ascending: false });
    if (data) setFichas((data as FichaRow[]).map(mapRow));
  }

  useEffect(() => {
    // Só carrega depois que o usuário está logado (necessário quando o RLS está ativo).
    if (!emailUsuario) { setFichas([]); return; }
    carregar();
    // Tempo real: aplica só a ficha alterada (economiza banda; não recarrega tudo).
    const canal = supabase
      .channel('ficha-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ficha_carro' }, (payload) =>
        setFichas((prev) => aplicarMudanca(prev, payload as unknown as MudancaPostgres, mapRow, 'id_ficha')),
      )
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [emailUsuario]);

  async function criarFicha(data: NovaFicha): Promise<number | null> {
    // Insere no banco e recebe de volta a linha com o id_ficha REAL (auto-incremento).
    // Usar o id real desde o início evita que atualizações posteriores (concluir,
    // adicionar peça, excluir) errem a linha por causa de um id temporário.
    const { data: inserida, error } = await supabase
      .from('ficha_carro')
      .insert({
        placa: data.placa,
        modelo: data.modelo,
        ano: data.ano,
        nome_cliente: data.nome_cliente,
        observacoes: data.observacoes,
        itens: [],
      })
      .select()
      .single();

    if (error || !inserida) return null;

    const nova = mapRow(inserida as FichaRow);
    setFichas((prev) => [nova, ...prev.filter((f) => f.id !== nova.id)]);
    return nova.id;
  }

  async function atualizarFicha(id: number, data: Partial<Pick<FichaCarro, 'status' | 'observacoes'>>) {
    setFichas((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
    const { error } = await supabase.from('ficha_carro').update(data).eq('id_ficha', id);
    if (error) {
      // Não persistiu (ex.: regra de acesso). Recarrega para refletir o estado real do banco.
      await carregar();
      mostrarAlerta('Erro', 'Não foi possível salvar a alteração. Verifique sua conexão e as permissões.');
    }
  }

  async function excluirFicha(id: number) {
    setFichas((prev) => prev.filter((f) => f.id !== id));
    const { error } = await supabase.from('ficha_carro').delete().eq('id_ficha', id);
    if (error) {
      await carregar();
      mostrarAlerta('Erro', 'Não foi possível excluir a ficha. Verifique as permissões.');
    }
  }

  function buscarPorId(id: number) {
    return fichas.find((f) => f.id === id);
  }

  async function adicionarItem(id_ficha: number, item: Omit<ItemFicha, 'id'>) {
    const ficha = fichas.find((f) => f.id === id_ficha);
    if (!ficha) return;
    const novosItens = [...ficha.itens, { ...item, id: Date.now() }];
    setFichas((prev) => prev.map((f) => (f.id === id_ficha ? { ...f, itens: novosItens } : f)));
    const { error } = await supabase.from('ficha_carro').update({ itens: novosItens }).eq('id_ficha', id_ficha);
    if (error) {
      await carregar();
      mostrarAlerta('Erro', 'Não foi possível adicionar a peça. Verifique as permissões.');
    }
  }

  async function removerItem(id_ficha: number, id_item: number) {
    const ficha = fichas.find((f) => f.id === id_ficha);
    if (!ficha) return;
    const novosItens = ficha.itens.filter((i) => i.id !== id_item);
    setFichas((prev) => prev.map((f) => (f.id === id_ficha ? { ...f, itens: novosItens } : f)));
    const { error } = await supabase.from('ficha_carro').update({ itens: novosItens }).eq('id_ficha', id_ficha);
    if (error) {
      await carregar();
      mostrarAlerta('Erro', 'Não foi possível remover a peça. Verifique as permissões.');
    }
  }

  return (
    <FichasContext.Provider
      value={{ fichas, criarFicha, atualizarFicha, excluirFicha, buscarPorId, adicionarItem, removerItem }}
    >
      {children}
    </FichasContext.Provider>
  );
}

export function useFichas() {
  return useContext(FichasContext);
}
