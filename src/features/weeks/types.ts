import type { OpeningEffect } from "@/domain/week-effect";

// Lo que cambia de semana al abrir, mover o anular una apertura (respuesta de la vista previa).
export interface EffectPreview {
  effect: OpeningEffect | null;
  orders: { count: number; total: number };
  purchases: { count: number; total: number };
  // Pagos y descuentos del proveedor que también cambian de semana.
  providerMovements: number;
  // Solo en la vista previa de "desde / hasta": las semanas que quedan tocadas, ya con los cambios.
  after?: { from: string; to: string; days: number }[];
}

// Una semana de la lista de Ajustes.
export interface WeekRow {
  from: string;
  to: string;
  days: number;
  // Id de la apertura marcada a mano que la abrió; null si es automática (sábado a viernes).
  openingId: string | null;
  note: string | null;
  // Primer día de la semana siguiente (el "hasta"); null si es la semana en curso.
  until: string | null;
}
