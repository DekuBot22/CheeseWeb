// Semana de negocio: sábado 00:00:00 a viernes 23:59:59.999 (hora local),
// porque el queso llega los sábados y la venta de esa semana se cierra
// cuando llega el siguiente lote. No es una semana de calendario (lunes a
// domingo) ni una ventana móvil de 7 días: es un rango fijo anclado al
// sábado más reciente.

const SATURDAY = 6;

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function weekRange(anchor: Date = new Date()): { start: Date; end: Date } {
  const day = anchor.getDay();
  const diffToSaturday = (day - SATURDAY + 7) % 7;
  const start = atMidnight(anchor);
  start.setDate(start.getDate() - diffToSaturday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setMilliseconds(end.getMilliseconds() - 1);

  return { start, end };
}

export function shiftWeek(startISO: string, deltaWeeks: number): Date {
  const start = new Date(startISO);
  start.setDate(start.getDate() + deltaWeeks * 7);
  return start;
}

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

export function formatWeekLabel(start: Date, end: Date): string {
  const endDay = new Date(end);
  endDay.setMilliseconds(0);
  const sameMonth = start.getMonth() === endDay.getMonth();
  const startLabel = `${start.getDate()}${sameMonth ? "" : ` ${MESES_CORTOS[start.getMonth()]}`}`;
  const endLabel = `${endDay.getDate()} ${MESES_CORTOS[endDay.getMonth()]}`;
  return `${startLabel} – ${endLabel}, ${endDay.getFullYear()}`;
}
