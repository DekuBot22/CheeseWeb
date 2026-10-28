import { formatWeekLabel } from "@/lib/format";
import { ProviderDiscountForm } from "@/features/purchases/components/ProviderDiscountForm";
import { ProviderLedgerTable } from "@/features/purchases/components/ProviderLedgerTable";
import { ProviderPaymentForm } from "@/features/purchases/components/ProviderPaymentForm";
import { ProviderStats } from "@/features/purchases/components/ProviderStats";
import { PurchaseForm } from "@/features/purchases/components/PurchaseForm";
import { getPurchasesOverview, LEDGER_MAX_ROWS } from "@/features/purchases/server/get-purchases-overview";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ComprasPage({ searchParams }: { searchParams: Promise<{ semana?: string }> }) {
  const { semana } = await searchParams;
  const o = await getPurchasesOverview(semana);
  // Al mirar una semana pasada los formularios arrancan en su último día y no ofrecen abrir semana.
  const initialDate = o.isCurrent ? undefined : o.week.to;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Compras" subtitle={`Proveedor · semana ${formatWeekLabel(o.week.start, o.week.end)}`} />

      <ProviderStats
        week={{ comprado: o.compradoSemana, kg: o.kgSemana, pagado: o.pagadoSemana, descontado: o.descontadoSemana }}
        saldo={o.totals.saldo}
        past={!o.isCurrent}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
        <Card>
          <CardHeader title="Nueva compra" subtitle="Queso que le compraste al proveedor." />
          <CardBody>
            <PurchaseForm key={o.week.from} week={o.isCurrent ? o.weekContext : undefined} initialDate={initialDate} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Nuevo pago" subtitle="Dinero que le entregaste al proveedor." />
          <CardBody>
            <ProviderPaymentForm key={o.week.from} initialDate={initialDate} />
          </CardBody>
        </Card>
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader
            title="Nuevo descuento"
            subtitle="Rebaja que te hace el proveedor sobre lo que le debes. La compra no cambia."
          />
          <CardBody>
            <ProviderDiscountForm
              key={o.week.from}
              purchases={o.purchaseOptions}
              ready={o.discountsReady}
              initialDate={initialDate}
            />
          </CardBody>
        </Card>
      </div>

      <section aria-labelledby="libro">
        <h2 id="libro" className="mb-1 text-[0.9375rem]/[1.375rem] font-semibold text-tinta">
          Libro del proveedor
        </h2>
        <p className="mb-3 text-[0.8125rem]/[1.125rem] text-tinta-2">
          {o.isCurrent
            ? "Cada compra suma al saldo; cada pago y cada descuento lo reducen."
            : "Solo los movimientos de esa semana; el saldo de cada fila es el acumulado real."}
          {o.ledgerTotalRows > LEDGER_MAX_ROWS && ` Mostrando los ${LEDGER_MAX_ROWS} movimientos más recientes.`}
        </p>
        <ProviderLedgerTable
          rows={o.ledger}
          totals={o.ledgerTotals ?? o.totals}
          purchaseCount={o.purchaseCount}
          scoped={!o.isCurrent}
        />
      </section>
    </div>
  );
}
