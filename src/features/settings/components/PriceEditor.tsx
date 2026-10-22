"use client";

import { useId } from "react";
import { perLbToPerKg } from "@/domain/units";
import { formatCOP, formatDate } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { Field, Input } from "@/ui/Field";
import { UnitProfitPanel } from "./UnitProfitPanel";
import { usePriceEditor } from "./use-price-editor";

// Los valores llegan por kg (así los guarda la base) y se editan por libra.
export function PriceEditor({
  initialPrice,
  initialCost,
  updatedAt,
}: {
  initialPrice: number | null;
  initialCost: number | null;
  updatedAt: string | null;
}) {
  const uid = useId();
  const f = usePriceEditor(initialPrice, initialCost, updatedAt);
  const priceLb = Number(f.price);
  const costLb = f.cost ? Number(f.cost) : 0;
  const priceOk = f.price !== "" && Number.isFinite(priceLb) && priceLb > 0;

  return (
    <Card>
      <CardHeader
        title="Precio por libra"
        subtitle={f.lastUpdated ? `Última actualización: ${formatDate(f.lastUpdated)}` : "Aún no configurado"}
      />
      <CardBody>
        <form onSubmit={f.submit} className="flex flex-col gap-4">
          <Field
            label="Precio de venta por libra (lo que paga el cliente)"
            htmlFor={`${uid}-precio`}
            hint={priceOk ? `Equivale a ≈ ${formatCOP(perLbToPerKg(priceLb))} por kilo` : undefined}
            error={f.error}
          >
            <Input
              id={`${uid}-precio`}
              type="number"
              inputMode="decimal"
              step="1"
              min="1"
              value={f.price}
              onChange={(e) => f.setPrice(e.target.value)}
              placeholder="Ej. 13000"
              aria-invalid={f.error ? true : undefined}
              aria-describedby={f.error ? `${uid}-precio-desc` : undefined}
            />
          </Field>

          <Field label="Costo por libra (lo que a ti te cuesta)" htmlFor={`${uid}-costo`}>
            <Input
              id={`${uid}-costo`}
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              value={f.cost}
              onChange={(e) => f.setCost(e.target.value)}
              placeholder="Ej. 11000"
            />
          </Field>

          <UnitProfitPanel priceLb={priceLb} costLb={costLb} />

          <p className="text-[0.8125rem]/[1.125rem] text-tinta-2">
            El costo solo se usa para estimar la ganancia de las semanas que no tienen compra registrada.
          </p>

          <Button type="submit" size="sm" className="w-full md:w-auto md:self-start" loading={f.loading}>
            Guardar
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
