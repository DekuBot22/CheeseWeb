import type { CheeseType, SaltLevel, PaymentStatus } from "./types";

// En la región donde opera el negocio se maneja 1 kg = 2 lb (no el valor
// internacional 0.4536). Todos los totales y costos dependen de esta constante.
export const KG_PER_LB = 0.5;

// Número de WhatsApp del negocio (con indicativo de país, sin "+" ni espacios)
// para el botón de pedido directo.
export const BUSINESS_WHATSAPP_NUMBER = "573157850212";

export const CHEESE_TYPE_LABELS: Record<CheeseType, string> = {
  duro: "Duro",
  semi: "Semi-duro",
  blando: "Blando",
};

export const SALT_LEVEL_LABELS: Record<SaltLevel, string> = {
  alto: "Alto en sal",
  intermedio: "Sal intermedia",
  bajo: "Bajo en sal",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  debe: "Debe",
  parcial: "Pago parcial",
  pagado: "Pagado",
};

export function toKg(quantity: number, unit: "kg" | "lb"): number {
  return unit === "kg" ? quantity : quantity * KG_PER_LB;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// No usamos Intl.DateTimeFormat aquí: el espacio que inserta entre la hora y
// "a. m."/"p. m." difiere entre el ICU de Node y el del navegador (aunque el
// texto se vea igual), lo que rompe la hidratación de React. Con caracteres
// fijos el resultado es idéntico en servidor y cliente.
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate();
  const month = MESES[date.getMonth()];
  const year = date.getFullYear();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = date.getHours() >= 12 ? "p. m." : "a. m.";
  const hour12 = date.getHours() % 12 || 12;
  return `${day} de ${month} de ${year}, ${hour12}:${minutes} ${period}`;
}
