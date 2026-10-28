import Link from "next/link";
import type { WeekPoint } from "@/domain/accounting";
import { toBogotaWall } from "@/lib/bogota-time";
import { cx } from "@/lib/cx";
import { formatCOP } from "@/lib/format";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { Dot, type DotTone } from "@/ui/Dot";

type TileState = "cobrada" | "porCobrar" | "perdida" | "sinVentas" | "enCurso";

const STATES: Record<TileState, { label: string; dot: DotTone; stripe: string }> = {
  cobrada: { label: "Cobrada", dot: "cobrado", stripe: "bg-cobrado" },
  porCobrar: { label: "Por cobrar", dot: "aviso", stripe: "bg-aviso" },
  perdida: { label: "Pérdida", dot: "debe", stripe: "bg-debe" },
  sinVentas: { label: "Sin ventas", dot: "neutro", stripe: "bg-tinta-3" },
  enCurso: { label: "En curso", dot: "aviso", stripe: "bg-aviso" },
};

// La raya de cada semana cuenta cómo va el cobro: verde si ya se cobró todo lo vendido,
// ámbar si falta cobrar, rojo si perdió plata y gris si no vendió. La semana que sigue
// corriendo va en ámbar porque aún puede cambiar.
function stateOf(w: WeekPoint, now: number): TileState {
  if (w.end.getTime() > now) return "enCurso";
  if (w.stats.revenue === 0) return "sinVentas";
  if (w.stats.profit < 0) return "perdida";
  return w.stats.collected >= w.stats.revenue ? "cobrada" : "porCobrar";
}

// Fecha AAAA-MM-DD de inicio de la semana, para el enlace a esa semana.
function startParam(w: WeekPoint): string {
  return toBogotaWall(w.start).toISOString().slice(0, 10);
}

function Legend({ className }: { className: string }) {
  return (
    <ul className={cx("flex-wrap gap-x-4 gap-y-1 text-xs/4 text-tinta-2", className)}>
      {Object.values(STATES).map((s) => (
        <li key={s.label} className="flex items-center gap-1.5">
          <Dot tone={s.dot} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

// Rejilla de las últimas semanas: cada una con su ganancia. La última es la que se está mirando.
// `now` viene del servidor: así la semana en curso se decide una sola vez por carga.
export function WeekTilesCard({ weeks, now }: { weeks: WeekPoint[]; now: number }) {

  return (
    <Card>
      <CardHeader
        title={weeks.length === 1 ? "Última semana" : `Últimas ${weeks.length} semanas`}
        action={<Legend className="hidden justify-end sm:flex" />}
      />
      <CardBody>
        <Legend className="mb-3 flex sm:hidden" />
        <ol className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {weeks.map((w, i) => {
            const state = STATES[stateOf(w, now)];
            const selected = i === weeks.length - 1;
            return (
              <li key={w.start.toISOString()}>
                <Link
                  href={`/admin/ganancias?vista=semana&semana=${startParam(w)}`}
                  aria-current={selected ? "true" : undefined}
                  aria-label={`Semana del ${w.label}: ${state.label}, ganancia ${formatCOP(w.stats.profit)}`}
                  className={cx(
                    "block overflow-hidden rounded-md border bg-hoja-2 px-3 pb-2.5 hover:bg-hoja-3",
                    selected ? "border-acento" : "border-linea"
                  )}
                >
                  <span className={cx("-mx-3 mb-2 block h-[3px]", state.stripe)} />
                  <span className="block text-[0.8125rem]/[1.125rem] font-semibold text-tinta">{w.label}</span>
                  <span className="num block text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">
                    {formatCOP(w.stats.profit)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </CardBody>
    </Card>
  );
}
