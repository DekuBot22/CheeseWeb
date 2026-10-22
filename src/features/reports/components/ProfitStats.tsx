import { percentChange, type PeriodStats } from "@/domain/accounting";
import { profitPerLb } from "@/domain/pricing";
import { formatCOP, formatKg, plural } from "@/lib/format";
import { Delta } from "@/ui/Delta";
import { Money } from "@/ui/Money";
import { Stat } from "@/ui/Stat";

// Cifras del período. `previous` (solo en vista semanal) activa la variación vs la semana anterior.
export function ProfitStats({
  stats,
  kg,
  orderCount,
  previous,
}: {
  stats: PeriodStats;
  kg: number;
  orderCount: number;
  previous?: PeriodStats;
}) {
  const perLb = profitPerLb(stats.profit, stats.kgPaid);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
      <Stat
        label="Ingresos"
        value={<Money value={stats.revenue} />}
        delta={previous ? <Delta pct={percentChange(stats.revenue, previous.revenue)} /> : undefined}
        hint={`${formatKg(kg)} kg · ${plural(orderCount, "pedido")}`}
      />
      <Stat
        label="Costo de lo cobrado"
        value={<Money value={stats.cost} />}
        delta={previous ? <Delta pct={percentChange(stats.cost, previous.cost)} goodWhen="down" /> : undefined}
        hint="Costo por libra de Ajustes × lo ya cobrado"
      />
      <Stat
        label="Ganancia"
        value={<Money value={stats.profit} tone={stats.profit < 0 ? "debe" : "cobrado"} />}
        delta={previous ? <Delta pct={percentChange(stats.profit, previous.profit)} /> : undefined}
        hint={`Cobrado − costo · margen ${stats.margin.toFixed(0)} %${perLb === null ? "" : ` · ${formatCOP(Math.round(perLb))} por libra`}`}
        className="col-span-2 lg:col-span-1"
      />
      <Stat
        label="Cobrado"
        value={<Money value={stats.collected} tone="cobrado" />}
        hint={
          stats.revenue > 0
            ? `Por cobrar ${formatCOP(Math.max(stats.revenue - stats.collected, 0))}`
            : "Sin ventas en el período"
        }
      />
      <Stat
        label="Pagado al proveedor"
        value={<Money value={stats.pagadoProveedor} />}
        hint={`Comprado ${formatCOP(stats.comprado)}`}
      />
      <Stat
        label="Saldo del período"
        value={<Money value={stats.saldoProveedor} className={stats.saldoProveedor > 0 ? "text-acento" : ""} />}
        hint="Compras − descuentos − pagos al proveedor"
      />
    </div>
  );
}
