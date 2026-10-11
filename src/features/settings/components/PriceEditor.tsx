"use client";

import { useId } from "react";
import { KG_PER_LB } from "@/domain/units";
import { formatCOP, formatDate } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { Field, Input } from "@/ui/Field";
import { usePriceEditor } from "./use-price-editor";

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
  const priceNumber = Number(f.price);

  return (
    <Card>
      <CardHeader
        title="Precio por kilogramo"
        subtitle={f.lastUpdated ? `Última actualización: ${formatDate(f.lastUpdated)}` : "Aún no configurado"}
      />
      <CardBody>
        <form onSubmit={f.submit} className="flex max-w-xl flex-col gap-4">
          <Field
            label="Precio de venta por kg (lo que paga el cliente)"
            htmlFor={`${uid}-precio`}
            hint={
              f.price && Number.isFinite(priceNumber) && priceNumber > 0
                ? `Equivale a ${formatCOP(priceNumber * KG_PER_LB)} por libra`
                : undefined
            }
            error={f.error}
          >
            <Input
              id={`${uid}-precio`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={f.price}
              onChange={(e) => f.setPrice(e.target.value)}
              placeholder="Ej. 25000"
              aria-invalid={f.error ? true : undefined}
              aria-describedby={f.error ? `${uid}-precio-desc` : undefined}
            />
          </Field>

          <Field label="Costo por kg (lo que a ti te cuesta, opcional — para calcular ganancias)" htmlFor={`${uid}-costo`}>
            <Input
              id={`${uid}-costo`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={f.cost}
              onChange={(e) => f.setCost(e.target.value)}
              placeholder="Ej. 15000"
            />
          </Field>

          <Button type="submit" loading={f.loading}>
            Guardar
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
