// Anulación: una fila anulada nunca se borra, solo deja de contar. `voided_at`
// es null (o no viene, antes de la migración 005) mientras la fila está vigente.

export interface Voidable {
  voided_at?: string | null;
  void_reason?: string | null;
}

export const VOID_REASON_MIN = 3;
export const VOID_REASON_MAX = 300;

export const VOID_REASON_SUGGESTIONS = ["Error al registrar", "Duplicado", "Cliente canceló", "Devolución"] as const;

export function isVoided(row: Voidable): boolean {
  return Boolean(row.voided_at);
}

// Solo las filas vigentes: lo único que debe entrar en sumas y saldos.
export function activeOnly<T extends Voidable>(rows: readonly T[]): T[] {
  return rows.filter((r) => !isVoided(r));
}
