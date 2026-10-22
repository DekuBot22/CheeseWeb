// Filtros de la pantalla de Pedidos: valores permitidos y cómo armar el enlace de cada uno.
export const ORDER_STATES = ["todos", "pendiente", "completado", "anulado"] as const;
export const PAYMENT_FILTERS = ["todos", "debe", "parcial", "pagado"] as const;
export const CHEESE_FILTERS = ["todos", "duro", "semi", "blando"] as const;
export const ORDER_PERIODS = ["todos", "semana", "anterior"] as const;

export interface OrdersFilterValues {
  q: string;
  estado: (typeof ORDER_STATES)[number];
  pago: (typeof PAYMENT_FILTERS)[number];
  tipo: (typeof CHEESE_FILTERS)[number];
  periodo: (typeof ORDER_PERIODS)[number];
}

// Conserva los demás filtros al cambiar uno.
export function hrefWith(values: OrdersFilterValues, changes: Partial<OrdersFilterValues>): string {
  const next = { ...values, ...changes };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value && value !== "todos") sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/admin/pedidos?${qs}` : "/admin/pedidos";
}

// Cuántos filtros (sin contar la búsqueda) están puestos.
export function activeFilterCount(values: OrdersFilterValues): number {
  return [values.estado, values.pago, values.tipo, values.periodo].filter((v) => v !== "todos").length;
}
