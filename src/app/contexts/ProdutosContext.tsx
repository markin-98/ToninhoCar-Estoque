import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { mostrarAlerta } from '@/lib/alerta';
import { aplicarMudanca, MudancaPostgres } from '@/lib/realtime';
import { Produto, ProdutoFormData } from '@/types';

type ProdutosContextData = {
  produtos: Produto[];
  proximoCodigo: string;
  adicionarProduto: (data: ProdutoFormData) => Promise<void>;
  editarProduto: (id: number, data: ProdutoFormData) => Promise<void>;
  excluirProduto: (id: number) => Promise<void>;
  buscarPorId: (id: number) => Produto | undefined;
  atualizarQuantidade: (id: number, delta: number) => Promise<void>;
};

type ProdutoRow = {
  id_produto: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  quantidade_atual: number;
  preco_atual: number;
  estoque_minimo: number;
  data_cadastro: string;
};

function mapRow(row: ProdutoRow): Produto {
  return {
    id: row.id_produto,
    codigo: row.codigo,
    nome: row.nome,
    descricao: row.descricao ?? '',
    quantidade_atual: row.quantidade_atual,
    preco_atual: Number(row.preco_atual),
    estoque_minimo: row.estoque_minimo,
    data_cadastro: row.data_cadastro,
  };
}

const ProdutosContext = createContext<ProdutosContextData>({} as ProdutosContextData);

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const emailUsuario = useAuth().usuario?.email ?? null;

  async function carregar() {
    const { data } = await supabase
      .from('produto')
      .select('*')
      .order('data_cadastro', { ascending: false });
    if (data) setProdutos((data as ProdutoRow[]).map(mapRow));
  }

  useEffect(() => {
    // Só carrega depois que o usuário está logado (necessário quando o RLS está ativo).
    if (!emailUsuario) { setProdutos([]); return; }
    carregar();
    // Tempo real: aplica só a linha alterada (economiza banda; não recarrega tudo).
    const canal = supabase
      .channel('produto-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produto' }, (payload) =>
        setProdutos((prev) => aplicarMudanca(prev, payload as unknown as MudancaPostgres, mapRow, 'id_produto')),
      )
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [emailUsuario]);

  const proximoCodigo = `PROD-${String(produtos.length + 1).padStart(3, '0')}`;

  async function adicionarProduto(data: ProdutoFormData) {
    // Insere e recebe a linha com o id real; adiciona ao estado (o eco do
    // Realtime é deduplicado pelo id, então não duplica).
    const { data: inserido, error } = await supabase.from('produto').insert({
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao,
      quantidade_atual: data.quantidade_atual,
      preco_atual: data.preco_atual,
      estoque_minimo: data.estoque_minimo,
    }).select().single();
    if (error || !inserido) {
      mostrarAlerta('Erro', 'Não foi possível cadastrar o produto. Verifique as permissões.');
      return;
    }
    const novo = mapRow(inserido as ProdutoRow);
    setProdutos((prev) => (prev.some((p) => p.id === novo.id) ? prev : [novo, ...prev]));
  }

  async function editarProduto(id: number, data: ProdutoFormData) {
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    const { error } = await supabase.from('produto').update({
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao,
      quantidade_atual: data.quantidade_atual,
      preco_atual: data.preco_atual,
      estoque_minimo: data.estoque_minimo,
    }).eq('id_produto', id);
    if (error) {
      await carregar();
      mostrarAlerta('Erro', 'Não foi possível salvar o produto. Verifique as permissões.');
    }
  }

  async function excluirProduto(id: number) {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('produto').delete().eq('id_produto', id);
    if (error) {
      await carregar();
      mostrarAlerta('Erro', 'Não foi possível excluir o produto. Verifique as permissões.');
    }
  }

  function buscarPorId(id: number) {
    return produtos.find((p) => p.id === id);
  }

  async function atualizarQuantidade(id: number, delta: number) {
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return;
    const novaQtd = Math.max(0, produto.quantidade_atual + delta);
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantidade_atual: novaQtd } : p)),
    );
    const { error } = await supabase.from('produto').update({ quantidade_atual: novaQtd }).eq('id_produto', id);
    if (error) await carregar();
  }

  return (
    <ProdutosContext.Provider
      value={{ produtos, proximoCodigo, adicionarProduto, editarProduto, excluirProduto, buscarPorId, atualizarQuantidade }}
    >
      {children}
    </ProdutosContext.Provider>
  );
}

export function useProdutos() {
  return useContext(ProdutosContext);
}
