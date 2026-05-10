import { createContext, useContext, useState, ReactNode } from 'react';
import { FichaCarro, ItemFicha, StatusFicha } from '@/types';

type NovaFicha = Omit<FichaCarro, 'id' | 'data_atendimento' | 'status' | 'itens'>;

type FichasContextData = {
  fichas: FichaCarro[];
  criarFicha: (data: NovaFicha) => number;
  atualizarFicha: (id: number, data: Partial<Pick<FichaCarro, 'status' | 'observacoes'>>) => void;
  excluirFicha: (id: number) => void;
  buscarPorId: (id: number) => FichaCarro | undefined;
  adicionarItem: (id_ficha: number, item: Omit<ItemFicha, 'id'>) => void;
  removerItem: (id_ficha: number, id_item: number) => void;
};

// Fichas mockadas para desenvolvimento — substituir por chamadas ao Supabase
const FICHAS_INICIAIS: FichaCarro[] = [
  {
    id: 1,
    placa: 'HYD-0001',
    modelo: 'Volkswagen Golf 1.4',
    ano: 2021,
    nome_cliente: 'João Silva',
    data_atendimento: '2026-05-09T10:00:00',
    observacoes: 'Revisão completa + troca de pastilhas',
    status: 'aberta',
    itens: [
      { id: 1, id_produto: 4, nome_produto: 'Pastilha de Freio', quantidade: 2, preco_unitario: 120.0 },
      { id: 2, id_produto: 5, nome_produto: 'Fluido de Freio DOT4', quantidade: 1, preco_unitario: 22.0 },
    ],
  },
  {
    id: 2,
    placa: 'ABC-9876',
    modelo: 'Toyota Corolla 2.0',
    ano: 2019,
    nome_cliente: 'Maria Santos',
    data_atendimento: '2026-05-08T14:30:00',
    observacoes: '',
    status: 'concluida',
    itens: [
      { id: 3, id_produto: 1, nome_produto: 'Óleo Motor 5W30', quantidade: 1, preco_unitario: 45.9 },
      { id: 4, id_produto: 2, nome_produto: 'Filtro de Ar', quantidade: 1, preco_unitario: 35.0 },
    ],
  },
  {
    id: 3,
    placa: 'XYZ-5432',
    modelo: 'Honda Civic 1.5T',
    ano: 2022,
    nome_cliente: 'Pedro Oliveira',
    data_atendimento: '2026-05-10T09:00:00',
    observacoes: 'Cliente reportou barulho no motor',
    status: 'aberta',
    itens: [],
  },
];

const FichasContext = createContext<FichasContextData>({} as FichasContextData);

export function FichasProvider({ children }: { children: ReactNode }) {
  const [fichas, setFichas] = useState<FichaCarro[]>(FICHAS_INICIAIS);

  function criarFicha(data: NovaFicha): number {
    const id = Date.now();
    const nova: FichaCarro = {
      ...data,
      id,
      data_atendimento: new Date().toISOString(),
      status: 'aberta',
      itens: [],
    };
    setFichas((prev) => [nova, ...prev]);
    return id;
  }

  function atualizarFicha(id: number, data: Partial<Pick<FichaCarro, 'status' | 'observacoes'>>) {
    setFichas((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }

  function excluirFicha(id: number) {
    setFichas((prev) => prev.filter((f) => f.id !== id));
  }

  function buscarPorId(id: number) {
    return fichas.find((f) => f.id === id);
  }

  function adicionarItem(id_ficha: number, item: Omit<ItemFicha, 'id'>) {
    setFichas((prev) =>
      prev.map((f) =>
        f.id === id_ficha
          ? { ...f, itens: [...f.itens, { ...item, id: Date.now() }] }
          : f,
      ),
    );
  }

  function removerItem(id_ficha: number, id_item: number) {
    setFichas((prev) =>
      prev.map((f) =>
        f.id === id_ficha
          ? { ...f, itens: f.itens.filter((i) => i.id !== id_item) }
          : f,
      ),
    );
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
