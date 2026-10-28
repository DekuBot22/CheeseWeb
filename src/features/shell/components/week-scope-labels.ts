import type { Week } from "@/domain/week-calendar";
import { formatWeekLabel, plural } from "@/lib/format";

// "10 – 17 oct" (sin año): cabe en la barra superior y en el menú lateral.
export const weekShortLabel = (week: Week) => formatWeekLabel(week.start, week.end).replace(/, \d{4}$/, "");

// Bajo la fecha: "Semana actual" o lo que duró ("Sáb a vie" en la regla de siempre).
export const weekCaption = (week: Week, isCurrent: boolean) =>
  isCurrent ? "Semana actual" : week.manual || week.days !== 7 ? plural(week.days, "día") : "Sáb a vie";
