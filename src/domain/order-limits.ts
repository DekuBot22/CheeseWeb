// Límites del formulario público de pedidos (ventana fija por clave). Protegen la
// contabilidad de pedidos falsos o repetidos. Si un cliente real pide para varias
// personas desde la misma conexión y se topa con ellos, súbelos aquí.

export interface OrderLimit {
  id: string;
  seconds: number;
  max: number;
  scope: "ip" | "nombre";
}

export const ORDER_LIMITS: readonly OrderLimit[] = [
  { id: "ip10m", seconds: 10 * 60, max: 6, scope: "ip" },
  { id: "ipdia", seconds: 24 * 60 * 60, max: 30, scope: "ip" },
  { id: "nombre", seconds: 60 * 60, max: 3, scope: "nombre" },
];

export interface LimitCheck {
  key: string;
  seconds: number;
  max: number;
  scope: OrderLimit["scope"];
}

// Claves a contar en la base: la IP ya viene "hasheada" (no se guarda la IP real).
export function limitKeys(ipHash: string, nameKey: string): LimitCheck[] {
  return ORDER_LIMITS.map((limit) => ({
    key: `pedido:${limit.id}:${limit.scope === "ip" ? ipHash : nameKey}`,
    seconds: limit.seconds,
    max: limit.max,
    scope: limit.scope,
  }));
}

export const LIMIT_MESSAGES: Record<OrderLimit["scope"], string> = {
  ip: "Recibimos muchos pedidos seguidos desde tu conexión. Espera unos minutos e intenta de nuevo, o escríbenos por WhatsApp.",
  nombre:
    "Ya recibimos varios pedidos a este nombre en la última hora. Si quieres cambiar o agregar algo, escríbenos por WhatsApp.",
};
