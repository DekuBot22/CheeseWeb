import { percentChange, type PeriodStats } from "@/domain/accounting";
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
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
      <Stat
        label="Ingresos"
        value={<Money value={stats.revenue} />}
        delta={previous ? <Delta pct={percentChange(stats.revenue, previous.revenue)} /> : undefined}
        hint={`${formatKg(kg)} kg · ${plural(orderCount, "pedido")}`}
      />
      <Stat
        label={stats.usingRealCost ? "Costo (compras reales)" : "Costo (estimado)"}
        value={<Money value={stats.cost} />}
        delta={previous ? <Delta pct={percentChange(stats.cost, previous.cost)} goodWhen="down" /> : undefined}
      />
      <Stat
        label="Ganancia"
        value={<Money value={stats.profit} tone="auto" />}
        delta={previous ? <Delta pct={percentChange(stats.profit, previous.profit)} /> : undefined}
        hint={`Margen ${stats.margin.toFixed(0)} %`}
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
        value={<Money value={stats.saldoProveedor} tone="auto" />}
        hint="Compras menos pagos al proveedor"
      />
    </div>
  );
}
