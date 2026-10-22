import { Card, CardBody, CardHeader } from "@/ui/Card";
import { HBarList } from "@/ui/HBarList";
import { Money } from "@/ui/Money";

// Gris, ámbar y rojo: la deuda más vieja es la más viva. Los dos tramos más viejos se juntan.
const AGING_COLORS = ["var(--tinta-3)", "var(--aviso)", "var(--debe)"];

// Cuánto te deben hoy, repartido por cuántos días llevan sin pagarse.
export function DebtAgingCard({ aging }: { aging: { label: string; amount: number }[] }) {
  const [fresh, mid, ...old] = aging;
  const buckets = [
    { label: "0 a 7 días", amount: fresh?.amount ?? 0 },
    { label: "8 a 14 días", amount: mid?.amount ?? 0 },
    { label: "15 días o más", amount: old.reduce((sum, a) => sum + a.amount, 0) },
  ];
  const total = buckets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <Card>
      <CardHeader title="Antigüedad de la deuda" subtitle="Lo que te deben hoy, por días desde el pedido" />
      <CardBody className="flex flex-col gap-4">
        <HBarList
          items={buckets.map((b, i) => ({
            label: b.label,
            value: b.amount,
            valueLabel: <Money value={b.amount} />,
            color: AGING_COLORS[i],
          }))}
        />
        <p className="num text-sm/5 text-tinta-2">
          Total por cobrar <Money value={total} className="font-semibold text-tinta" />
        </p>
      </CardBody>
    </Card>
  );
}
