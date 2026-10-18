import type { WeekContext } from "@/domain/week-hint";
import { formatDay, plural } from "@/lib/format";
import { Callout } from "@/ui/Callout";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import type { WeekRow } from "../types";
import { OpenWeekButton } from "./OpenWeekButton";
import { WeekRowActions } from "./WeekRowActions";

// Las últimas semanas con sus fechas y duración. Las abiertas a mano se pueden mover o anular.
export function WeeksCard({ rows, context, ready }: { rows: WeekRow[]; context: WeekContext; ready: boolean }) {
  return (
    <Card>
      <CardHeader
        title="Semanas"
        subtitle="Cada semana empieza el día que llega el queso. Si no marcas nada, va de sábado a viernes."
        action={<OpenWeekButton context={context} />}
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
        <ul className="divide-y divide-linea">
          {rows.map((w) => (
            <li key={w.from} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-tinta">
                  {formatDay(w.from)} – {formatDay(w.to)}
                </p>
                <p className="num text-[0.8125rem] text-tinta-2">
                  {plural(w.days, "día")} · {w.openingId ? "abierta a mano" : "automática"}
                  {w.note ? ` · ${w.note}` : ""}
                </p>
              </div>
              {w.openingId && <WeekRowActions id={w.openingId} from={w.from} today={context.today} />}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
