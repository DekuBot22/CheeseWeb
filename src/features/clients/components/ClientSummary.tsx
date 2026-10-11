import { Money } from "@/ui/Money";
import { Stat } from "@/ui/Stat";

// Tres cifras del cliente: lo que debe, su saldo a favor y todo lo que ha comprado.
export function ClientSummary({ debe, credit, comprado }: { debe: number; credit: number; comprado: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
      <Stat label="Debe" value={<Money value={debe} tone={debe > 0 ? "debe" : "neutral"} />} />
      <Stat label="Saldo a favor" value={<Money value={credit} tone={credit > 0 ? "cobrado" : "neutral"} />} />
      <Stat label="Total comprado" value={<Money value={comprado} />} />
    </div>
  );
}
