import { createContext, useContext, useState, ReactNode } from 'react';
import { Movimentacao, TipoMovimentacao } from '@/types';

type NovaMovimentacao = Omit<Movimentacao, 'id'>;

type MovimentacoesContextData = {
  movimentacoes: Movimentacao[];
  registrarMovimentacao: (data: NovaMovimentacao) => void;
};

// Histórico mockado para desenvolvimento — substituir por chamadas ao Supabase
const MOVIMENTACOES_INICIAIS: Movimentacao[] = [
  {
    id: 1,
    id_produto: 4,
    nome_produto: 'Pastilha de Freio',
    tipo: 'saida',
    quantidade: 2,
    nome_usuario: 'José Funcionário',
    data_hora: '2026-05-10T14:30:00',
    motivo: 'Substituição veículo ABC-1234',
  },
  {
    id: 2,
    id_produto: 2,
    nome_produto: 'Filtro de Ar',
    tipo: 'entrada',
    quantidade: 5,
    nome_usuario: 'Admin Toninho',
    data_hora: '2026-05-10T11:00:00',
    motivo: 'Reposição de estoque',
  },
  {
    id: 3,
    id_produto: 3,
    nome_produto: 'Vela de Ignição',
    tipo: 'baixa',
    quantidade: 3,
    nome_usuario: 'José Funcionário',
    data_hora: '2026-05-09T16:45:00',
    motivo: 'Peças danificadas na entrega',
  },
  {
    id: 4,
    id_produto: 1,
    nome_produto: 'Óleo Motor 5W30',
    tipo: 'saida',
    quantidade: 3,
    nome_usuario: 'José Funcionário',
    data_hora: '2026-05-09T09:15:00',
    motivo: 'Troca de óleo veículo XYZ-9876',
  },
];

const MovimentacoesContext = createContext<MovimentacoesContextData>(
  {} as MovimentacoesContextData,
);

export function MovimentacoesProvider({ children }: { children: ReactNode }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(MOVIMENTACOES_INICIAIS);

  function registrarMovimentacao(data: NovaMovimentacao) {
    const nova: Movimentacao = { ...data, id: Date.now() };
    // mais recente primeiro
    setMovimentacoes((prev) => [nova, ...prev]);
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
