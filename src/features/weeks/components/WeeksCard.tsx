import type { WeekContext } from "@/domain/week-hint";
import type { OpeningRef } from "@/domain/week-range";
import { formatDayShort, plural } from "@/lib/format";
import { Callout } from "@/ui/Callout";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import type { WeekRow } from "../types";
import { NewWeekButton } from "./NewWeekButton";
import { WeekRowActions } from "./WeekRowActions";

// Las últimas semanas con sus fechas y duración. Las abiertas a mano se pueden editar o anular.
export function WeeksCard({
  rows,
  openings,
  context,
  ready,
}: {
  rows: WeekRow[];
  openings: OpeningRef[];
  context: WeekContext;
  ready: boolean;
}) {
  return (
    <Card>
      <CardHeader
        title="Semanas"
        subtitle="Cada semana va desde el día que llega el queso hasta el día antes del siguiente. Antes de tu primera semana, va de sábado a viernes."
        action={<NewWeekButton openings={openings} today={context.today} />}
      />
      <CardBody>
        {!ready && (
          <div className="mb-3">
            <Callout tone="aviso">
              Para marcar semanas a mano falta correr la migración 007 en Supabase. Mientras tanto la lista sigue la regla de
              siempre.
            </Callout>
          </div>
        )}
        <ul className="divide-y divide-linea-suave">
          {rows.map((w) => (
            <li key={w.from} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-tinta">
                  {formatDayShort(w.from)} – {formatDayShort(w.to)}
                </p>
                <p className="num text-[0.8125rem] text-tinta-2">
                  {plural(w.days, "día")} · {w.openingId ? "abierta a mano" : "automática"}
                  {w.note ? ` · ${w.note}` : ""}
                </p>
              </div>
              {w.openingId && <WeekRowActions id={w.openingId} from={w.from} until={w.until} openings={openings} today={context.today} />}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
