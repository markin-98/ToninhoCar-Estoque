// Aplica uma única mudança recebida do Realtime do Supabase ao estado local,
// em vez de recarregar a tabela inteira. Isso reduz o consumo de banda (egress)
// para praticamente só o que muda de verdade.
//
// O evento do Postgres traz:
//  - eventType: 'INSERT' | 'UPDATE' | 'DELETE'
//  - new: a linha nova (INSERT/UPDATE)
//  - old: a linha antiga (DELETE traz ao menos a chave primária)

export type MudancaPostgres = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export function aplicarMudanca<T extends { id: number }>(
  atual: T[],
  payload: MudancaPostgres,
  mapRow: (row: never) => T,
  campoChave: string,
): T[] {
  if (payload.eventType === 'DELETE') {
    const id = payload.old?.[campoChave] as number | undefined;
    return id == null ? atual : atual.filter((item) => item.id !== id);
  }

  const linha = mapRow(payload.new as never);

  // Se a linha já existe (ex.: eco da própria alteração feita neste aparelho),
  // atualiza no lugar — evita duplicar.
  if (atual.some((item) => item.id === linha.id)) {
    return atual.map((item) => (item.id === linha.id ? linha : item));
  }

  // Linha nova de outro aparelho: entra no topo (as listas são ordenadas do
  // mais recente para o mais antigo).
  return [linha, ...atual];
}
