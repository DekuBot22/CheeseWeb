import { BOGOTA_OFFSET_MS, toBogotaWall } from "./bogota-time";

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKg(value: number): string {
  return value.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

// "1 pedido" / "3 pedidos".
export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
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

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// No usamos Intl.DateTimeFormat aquí: el espacio que inserta entre la hora y
// "a. m."/"p. m." difiere entre el ICU de Node y el del navegador (aunque el
// texto se vea igual), lo que rompe la hidratación de React. Con caracteres
// fijos el resultado es idéntico en servidor y cliente.
//
// Siempre en hora de Colombia (UTC-5), no en la del equipo que renderiza:
// el servidor de Vercel corre en UTC y mostraría el pedido 5 horas corrido.
export function formatDate(iso: string): string {
  const date = new Date(new Date(iso).getTime() + BOGOTA_OFFSET_MS);
  const day = date.getUTCDate();
  const month = MESES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const period = date.getUTCHours() >= 12 ? "p. m." : "a. m.";
  const hour12 = date.getUTCHours() % 12 || 12;
  return `${day} de ${month} de ${year}, ${hour12}:${minutes} ${period}`;
}

// Fecha corta "4 oct" (hora de Colombia), para tablas densas.
export function formatDateShort(iso: string): string {
  const date = new Date(new Date(iso).getTime() + BOGOTA_OFFSET_MS);
  return `${date.getUTCDate()} ${MESES[date.getUTCMonth()].slice(0, 3)}`;
}

// Para columnas `date` (AAAA-MM-DD) como purchase_date: "4 oct 2026".
export function formatDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)} ${y}`;
}

// Para columnas `date` cuando el año sobra: "4 oct".
export function formatDayShort(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)}`;
}

export function formatWeekLabel(start: Date, end: Date): string {
  const s = toBogotaWall(start);
  const e = toBogotaWall(end);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth();
  const startLabel = `${s.getUTCDate()}${sameMonth ? "" : ` ${MESES_CORTOS[s.getUTCMonth()]}`}`;
  const endLabel = `${e.getUTCDate()} ${MESES_CORTOS[e.getUTCMonth()]}`;
  return `${startLabel} – ${endLabel}, ${e.getUTCFullYear()}`;
}

// Etiqueta de una semana con su duración cuando no dura 7 días: "4 oct · 9 días".
export function weekTitle(label: string, days: number): string {
  return days === 7 ? label : `${label} · ${plural(days, "día")}`;
}

// Etiqueta corta para el eje de una gráfica: "4 oct".
export function formatWeekShort(start: Date): string {
  const s = toBogotaWall(start);
  return `${s.getUTCDate()} ${MESES_CORTOS[s.getUTCMonth()]}`;
}
