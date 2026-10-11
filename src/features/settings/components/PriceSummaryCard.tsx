import Link from "next/link";
import { perKgToPerLb } from "@/domain/units";
import { unitProfit } from "@/domain/pricing";
import { formatCOP } from "@/lib/format";
import { Callout } from "@/ui/Callout";
import { Card, CardBody } from "@/ui/Card";

// Precio del día por libra (el kilo va como estimado) y lo que se gana por libra.
export function PriceSummaryCard({
  pricePerKg,
  costPerKg,
}: {
  pricePerKg: number | null;
  costPerKg: number | null;
}) {
  const priceLb = pricePerKg ? perKgToPerLb(pricePerKg) : 0;
  const costLb = costPerKg ? perKgToPerLb(costPerKg) : 0;
  const { ganancia } = unitProfit(priceLb, costLb);

  return (
    <Card tone="sunken">
      <CardBody className="flex flex-wrap items-center justify-between gap-3">
        {pricePerKg && pricePerKg > 0 ? (
          <p className="text-sm text-tinta-2">
            Precio del día: <strong className="num text-tinta">{formatCOP(priceLb)}</strong> por libra
            {costLb > 0 && (
              <>
                {" "}
                · ganas <strong className="num text-tinta">{formatCOP(ganancia)}</strong>/lb
              </>
            )}{" "}
            <span className="num text-tinta-3">(≈ {formatCOP(pricePerKg)} por kg)</span>
          </p>
        ) : (
          <Callout tone="aviso">
            Aún no configuras el precio de venta: los clientes ven “El precio aún no ha sido configurado”.
          </Callout>
        )}
        <Link href="/admin/ajustes" className="text-sm font-medium text-acento hover:underline">
          Cambiar →
        </Link>
      </CardBody>
    </Card>
  );
}
