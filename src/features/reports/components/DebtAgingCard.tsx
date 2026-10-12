import { Card, CardBody, CardHeader } from "@/ui/Card";
import { HBarList } from "@/ui/HBarList";
import { Money } from "@/ui/Money";

// Rampa secuencial de antigüedad (tokens del tema): la deuda más vieja es la más viva.
const AGING_COLORS = ["var(--aging-1)", "var(--aging-2)", "var(--aging-3)", "var(--aging-4)"];

// Cuánto te deben hoy, repartido por cuántos días llevan sin pagarse.
export function DebtAgingCard({ aging }: { aging: { label: string; amount: number }[] }) {
  return (
    <Card>
      <CardHeader title="Antigüedad de la deuda" subtitle="Lo que te deben hoy, por días desde el pedido" />
      <CardBody>
        <HBarList
          items={aging.map((a, i) => ({
            label: a.label,
            value: a.amount,
            valueLabel: <Money value={a.amount} />,
            color: AGING_COLORS[i],
          }))}
        />
      </CardBody>
    </Card>
  );
}
