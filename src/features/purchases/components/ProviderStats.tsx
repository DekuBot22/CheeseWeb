import { formatCOP } from "@/lib/format";
import { Money } from "@/ui/Money";
import { Stat } from "@/ui/Stat";

interface Props {
  week: { comprado: number; kg: number; pagado: number; descontado: number };
  saldo: number;
}

export function ProviderStats({ week, saldo }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <Stat label="Comprado esta semana" value={<Money value={week.comprado} />} hint={`${week.kg} kg`} />
      <Stat
        label="Descuentos esta semana"
        value={<Money value={week.descontado} tone={week.descontado > 0 ? "cobrado" : "neutral"} />}
        hint={`Neto ${formatCOP(Math.max(week.comprado - week.descontado, 0))}`}
      />
      <Stat label="Pagado esta semana" value={<Money value={week.pagado} tone="cobrado" />} />
      <Stat
        label="Saldo con proveedor"
        value={<Money value={saldo} className={saldo > 0 ? "text-acento" : ""} />}
        hint={saldo > 0 ? "Le debes" : saldo < 0 ? "Pagaste de más" : "Al día"}
      />
    </div>
  );
}
