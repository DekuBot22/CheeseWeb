import Link from "next/link";
import { KG_PER_LB } from "@/domain/units";
import { formatCOP } from "@/lib/format";
import { Callout } from "@/ui/Callout";
import { Card, CardBody } from "@/ui/Card";

// Precio del día (por kg y por lb) con acceso para cambiarlo.
export function PriceSummaryCard({ pricePerKg }: { pricePerKg: number | null }) {
  return (
    <Card tone="sunken">
      <CardBody className="flex flex-wrap items-center justify-between gap-3">
        {pricePerKg && pricePerKg > 0 ? (
          <p className="text-sm text-tinta-2">
            Precio del día: <strong className="num text-tinta">{formatCOP(pricePerKg)}</strong> por kg ·{" "}
            <strong className="num text-tinta">{formatCOP(pricePerKg * KG_PER_LB)}</strong> por lb
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
