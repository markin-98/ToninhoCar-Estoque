import { createContext, useContext, useState, ReactNode } from 'react';
import { Produto, ProdutoFormData } from '@/types';

// Dados mockados para desenvolvimento — substituir por chamadas ao Supabase
const PRODUTOS_INICIAIS: Produto[] = [
  { id: 1, codigo: 'PROD-001', nome: 'Óleo Motor 5W30', descricao: 'Óleo sintético para motores a gasolina e flex', quantidade_atual: 2, estoque_minimo: 5, preco_atual: 45.9, data_cadastro: '2026-01-10' },
  { id: 2, codigo: 'PROD-002', nome: 'Filtro de Ar', descricao: 'Filtro de ar universal para carros de passeio', quantidade_atual: 8, estoque_minimo: 3, preco_atual: 35.0, data_cadastro: '2026-01-10' },
  { id: 3, codigo: 'PROD-003', nome: 'Vela de Ignição', descricao: 'Vela NGK iridium para motores 1.0 e 1.4', quantidade_atual: 1, estoque_minimo: 4, preco_atual: 28.5, data_cadastro: '2026-01-15' },
  { id: 4, codigo: 'PROD-004', nome: 'Pastilha de Freio', descricao: 'Pastilha dianteira para carros compactos', quantidade_atual: 12, estoque_minimo: 5, preco_atual: 120.0, data_cadastro: '2026-01-15' },
  { id: 5, codigo: 'PROD-005', nome: 'Fluido de Freio DOT4', descricao: 'Fluido de freio DOT4 500ml', quantidade_atual: 0, estoque_minimo: 2, preco_atual: 22.0, data_cadastro: '2026-01-20' },
  { id: 6, codigo: 'PROD-006', nome: 'Correia Dentada', descricao: 'Correia dentada para motores 1.6 16v', quantidade_atual: 5, estoque_minimo: 2, preco_atual: 85.0, data_cadastro: '2026-01-20' },
];

type ProdutosContextData = {
  produtos: Produto[];
  proximoCodigo: string;
  adicionarProduto: (data: ProdutoFormData) => void;
  editarProduto: (id: number, data: ProdutoFormData) => void;
  excluirProduto: (id: number) => void;
  buscarPorId: (id: number) => Produto | undefined;
  atualizarQuantidade: (id: number, delta: number) => void;
};

const ProdutosContext = createContext<ProdutosContextData>({} as ProdutosContextData);

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);

  const proximoCodigo = `PROD-${String(produtos.length + 1).padStart(3, '0')}`;

  function adicionarProduto(data: ProdutoFormData) {
    const novo: Produto = {
      ...data,
      id: Date.now(),
      data_cadastro: new Date().toISOString().split('T')[0],
    };
    setProdutos((prev) => [novo, ...prev]);
  }

  function editarProduto(id: number, data: ProdutoFormData) {
    setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  function excluirProduto(id: number) {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  function buscarPorId(id: number) {
    return produtos.find((p) => p.id === id);
  }

  // delta positivo = entrada, delta negativo = saída/baixa
  function atualizarQuantidade(id: number, delta: number) {
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantidade_atual: Math.max(0, p.quantidade_atual + delta) } : p,
      ),
    );
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
