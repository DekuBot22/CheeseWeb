import { formatWeekLabel } from "@/lib/format";
import { ProviderLedgerTable } from "@/features/purchases/components/ProviderLedgerTable";
import { ProviderPaymentForm } from "@/features/purchases/components/ProviderPaymentForm";
import { ProviderStats } from "@/features/purchases/components/ProviderStats";
import { PurchaseForm } from "@/features/purchases/components/PurchaseForm";
import { getPurchasesOverview, LEDGER_MAX_ROWS } from "@/features/purchases/server/get-purchases-overview";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const o = await getPurchasesOverview();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Compras" subtitle={`Proveedor · semana ${formatWeekLabel(o.week.start, o.week.end)}`} />

      <ProviderStats
        week={{ comprado: o.compradoSemana, kg: o.kgSemana, pagado: o.pagadoSemana }}
        totalComprado={o.totals.comprado}
        purchaseCount={o.purchaseCount}
        saldo={o.totals.saldo}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <Card>
          <CardHeader title="Nueva compra" subtitle="Queso que le compraste al proveedor." />
          <CardBody>
            <PurchaseForm />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Nuevo pago" subtitle="Dinero que le entregaste al proveedor." />
          <CardBody>
            <ProviderPaymentForm />
          </CardBody>
        </Card>
      </div>

      <section aria-labelledby="libro">
        <h2 id="libro" className="mb-1 font-display text-lg font-semibold text-tinta">
          Libro del proveedor
        </h2>
        <p className="mb-3 text-[0.8125rem] text-tinta-2">
          Cada compra suma al saldo y cada pago lo reduce.
          {o.ledgerTotalRows > LEDGER_MAX_ROWS && ` Mostrando los ${LEDGER_MAX_ROWS} movimientos más recientes.`}
        </p>
        <ProviderLedgerTable rows={o.ledger} totals={o.totals} />
      </section>
    </div>
  );
}
