// Cuadrícula mensual del calendario de semanas (pura: solo fechas AAAA-MM-DD, nunca `new Date()` del reloj).
//
// Cada semana marcada pinta sus días con una "banda" (0-3). El color es el índice de la apertura
// módulo 4: estable entre meses y dos semanas seguidas nunca comparten color.

import { formatMonth } from "@/lib/format";
import { addDays, daysBetween } from "./week-calendar";

// Primer día de la cuadrícula (0 = domingo … 6 = sábado). Sábado: cada fila es casi una semana de queso.
export const GRID_FIRST_DAY = 6;

export type Band = 0 | 1 | 2 | 3;

export interface DayCell {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  // Inicio de la semana marcada a la que pertenece; null si es de antes de la primera apertura.
  weekFrom: string | null;
  band: Band | null;
  isStart: boolean;
  // Último día de la banda (el día antes de la siguiente apertura; hoy si es la semana en curso).
  isEnd: boolean;
  ongoing: boolean;
  inDraft: boolean;
  // Pedidos hechos ese día (solo si hubo; lo anota `withSales`).
  sales?: number;
}

export interface MonthWeek {
  from: string;
  // Último día de la semana; null si está en curso.
  to: string | null;
  days: number;
  band: Band;
}

export interface MonthGrid {
  month: string;
  label: string;
  rows: DayCell[][];
  weeks: MonthWeek[];
  // true si ninguna semana marcada toca este mes.
  empty: boolean;
}

export interface DraftRange {
  from: string;
  // Último día (incluido); null = sigue en curso.
  last: string | null;
}

const bandOf = (index: number): Band => (index % 4) as Band;

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const index = y * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

export const canGoNext = (month: string, today: string): boolean => month < monthOf(today);

const lastDayOfMonth = (month: string): string => {
  const [y, m] = month.split("-").map(Number);
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
};

// Misma fecha `delta` meses después (o antes); si ese mes no tiene ese día, el último día del mes.
export function shiftMonth(date: string, delta: number): string {
  const month = addMonths(monthOf(date), delta);
  const day = Math.min(Number(date.slice(8)), Number(lastDayOfMonth(month).slice(8)));
  return `${month}-${String(day).padStart(2, "0")}`;
}

// Primer día de la fila (de GRID_FIRST_DAY) que contiene la fecha.
export function rowStart(date: string): string {
  return addDays(date, -((weekdayOf(date) - GRID_FIRST_DAY + 7) % 7));
}

// Día de la semana (0 = domingo) de una fecha AAAA-MM-DD.
export const weekdayOf = (date: string): number => new Date(`${date}T12:00:00Z`).getUTCDay();

interface WeekInfo {
  index: number;
  from: string;
  next: string | undefined;
}

// La semana marcada que contiene `date`: la última apertura que no es posterior.
function weekInfo(openings: string[], date: string): WeekInfo | null {
  let index = -1;
  for (let i = 0; i < openings.length && openings[i] <= date; i++) index = i;
  return index < 0 ? null : { index, from: openings[index], next: openings[index + 1] };
}

interface GridContext {
  month: string;
  openings: string[];
  today: string;
  draft?: DraftRange;
}

function cellOf(date: string, { month, openings, today, draft }: GridContext): DayCell {
  const isFuture = date > today;
  const info = isFuture ? null : weekInfo(openings, date);
  const ongoing = !!info && info.next === undefined;
  return {
    date,
    day: Number(date.slice(8)),
    inMonth: monthOf(date) === month,
    isToday: date === today,
    isFuture,
    weekFrom: info?.from ?? null,
    band: info ? bandOf(info.index) : null,
    isStart: !!info && info.from === date,
    isEnd: !!info && (info.next ? addDays(info.next, -1) === date : date === today),
    ongoing,
    inDraft: !!draft && date >= draft.from && date <= (draft.last ?? today),
  };
}

// Primer día de la cuadrícula: retrocede hasta el día de la semana en que empieza la fila.
function gridStart(month: string): string {
  return rowStart(`${month}-01`);
}

function weeksOf(openings: string[], month: string, today: string): MonthWeek[] {
  const first = `${month}-01`;
  const last = lastDayOfMonth(month);
  const weeks: MonthWeek[] = [];
  openings.forEach((from, i) => {
    const next = openings[i + 1];
    const to = next ? addDays(next, -1) : null;
    if (from > last || from > today || (to ?? today) < first) return;
    weeks.push({ from, to, days: daysBetween(from, to ?? today), band: bandOf(i) });
  });
  return weeks;
}

// Cuadrícula del mes `month` ("AAAA-MM"): filas completas de 7 días con las bandas de las semanas marcadas.
// `openings` son las fechas de apertura vigentes; `draft` pinta el contorno de la semana que se está editando.
export function monthGrid(month: string, openings: string[], today: string, draft?: DraftRange): MonthGrid {
  const sorted = [...new Set(openings)].sort();
  const start = gridStart(month);
  const end = lastDayOfMonth(month);
  const total = Math.ceil(daysBetween(start, end) / 7) * 7;

  const rows: DayCell[][] = [];
  for (let i = 0; i < total; i += 7) {
    rows.push(Array.from({ length: 7 }, (_, d) => cellOf(addDays(start, i + d), { month, openings: sorted, today, draft })));
  }
  const weeks = weeksOf(sorted, month, today);
  return { month, label: formatMonth(month), rows, weeks, empty: weeks.length === 0 };
}
