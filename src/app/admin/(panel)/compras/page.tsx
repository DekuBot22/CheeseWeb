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

export default async function ComprasPage() {
  const o = await getPurchasesOverview();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Compras" subtitle={`Proveedor · semana ${formatWeekLabel(o.week.start, o.week.end)}`} />

      <ProviderStats
        week={{ comprado: o.compradoSemana, kg: o.kgSemana, pagado: o.pagadoSemana, descontado: o.descontadoSemana }}
        saldo={o.totals.saldo}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
        <Card>
          <CardHeader title="Nueva compra" subtitle="Queso que le compraste al proveedor." />
          <CardBody>
            <PurchaseForm week={o.weekContext} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Nuevo pago" subtitle="Dinero que le entregaste al proveedor." />
          <CardBody>
            <ProviderPaymentForm />
          </CardBody>
        </Card>
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader
            title="Nuevo descuento"
            subtitle="Rebaja que te hace el proveedor sobre lo que le debes. La compra no cambia."
          />
          <CardBody>
            <ProviderDiscountForm purchases={o.purchaseOptions} ready={o.discountsReady} />
          </CardBody>
        </Card>
      </div>

      <section aria-labelledby="libro">
        <h2 id="libro" className="mb-1 text-[0.9375rem]/[1.375rem] font-semibold text-tinta">
          Libro del proveedor
        </h2>
        <p className="mb-3 text-[0.8125rem]/[1.125rem] text-tinta-2">
          Cada compra suma al saldo; cada pago y cada descuento lo reducen.
          {o.ledgerTotalRows > LEDGER_MAX_ROWS && ` Mostrando los ${LEDGER_MAX_ROWS} movimientos más recientes.`}
        </p>
        <ProviderLedgerTable rows={o.ledger} totals={o.totals} purchaseCount={o.purchaseCount} />
      </section>
    </div>
  );
}
