import type { WeekPoint } from "@/domain/accounting";
import { formatKg, plural } from "@/lib/format";
import { Delta } from "@/ui/Delta";
import { Money } from "@/ui/Money";
import { Stat } from "@/ui/Stat";

interface Props {
  // La semana actual, la serie de semanas y su variación frente a la anterior.
  week: {
    cur: WeekPoint;
    series: WeekPoint[];
    revenueChange: number | null;
    profitChange: number | null;
    collectedPct: number;
  };
  debt: { total: number; clients: number };
  provider: { saldo: number; lastPurchaseDate: string | null };
}

// Cifra principal del Inicio (ganancia de la semana) y los cuatro indicadores.
export function DashboardStats({ week, debt, provider }: Props) {
  const { cur, series } = week;
  const stats = cur.stats;

  return (
    <>
      <Stat
        emphasis="hero"
        label="Ganancia de la semana"
        value={<Money value={stats.profit} tone="auto" />}
        spark={series.map((w) => w.stats.profit)}
        delta={<Delta pct={week.profitChange} />}
        hint={
          stats.usingRealCost ? (
            <>Margen {stats.margin.toFixed(0)} % · costo real de las compras ✓</>
          ) : (
            <>
              Margen {stats.margin.toFixed(0)} % · costo <strong>estimado</strong>. Registra la compra de la
              semana para ver la ganancia real.
            </>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat
          label="Vendido"
          value={<Money value={stats.revenue} />}
          spark={series.map((w) => w.stats.revenue)}
          delta={<Delta pct={week.revenueChange} />}
          hint={`${formatKg(cur.kgSold)} kg · ${plural(cur.orderCount, "pedido")}`}
        />
        <Stat
          label="Cobrado"
          value={<Money value={stats.collected} tone="cobrado" />}
          hint={stats.revenue > 0 ? `${week.collectedPct.toFixed(0)} % de lo vendido` : "Sin ventas todavía"}
        />
        <Stat
          label="Me deben"
          value={<Money value={debt.total} tone={debt.total > 0 ? "debe" : "neutral"} />}
          hint={`${plural(debt.clients, "cliente")} · todo el tiempo`}
        />
        <Stat
          label="Debo al proveedor"
          value={<Money value={provider.saldo} className={provider.saldo > 0 ? "text-acento" : ""} />}
          hint={provider.lastPurchaseDate ? `Última compra: ${provider.lastPurchaseDate}` : "Sin compras registradas"}
        />
      </div>
    </>
  );
}
