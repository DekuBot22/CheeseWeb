import { formatCOP } from "@/lib/format";
import { Money } from "@/ui/Money";
import { Stat } from "@/ui/Stat";

interface Props {
  week: { comprado: number; kg: number; pagado: number; descontado: number };
  saldo: number;
  // Semana pasada: los títulos dicen "de la semana" y el saldo aclara que es el de hoy.
  past?: boolean;
}

export function ProviderStats({ week, saldo, past = false }: Props) {
  const when = past ? "en la semana" : "esta semana";
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <Stat label={`Comprado ${when}`} value={<Money value={week.comprado} />} hint={`${week.kg} kg`} />
      <Stat
        label={`Descuentos ${when}`}
        value={<Money value={week.descontado} tone={week.descontado > 0 ? "cobrado" : "neutral"} />}
        hint={`Neto ${formatCOP(Math.max(week.comprado - week.descontado, 0))}`}
      />
      <Stat label={`Pagado ${when}`} value={<Money value={week.pagado} tone="cobrado" />} />
      <Stat
        label={past ? "Saldo con proveedor (hoy)" : "Saldo con proveedor"}
        value={<Money value={saldo} className={saldo > 0 ? "text-acento" : ""} />}
        hint={saldo > 0 ? "Le debes" : saldo < 0 ? "Pagaste de más" : "Al día"}
      />
    </div>
  );
}
