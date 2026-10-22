import { Money } from "@/ui/Money";
import { Stat } from "@/ui/Stat";

// Tres cifras del cliente: lo que debe, su saldo a favor y todo lo que ha comprado.
// En móvil van las tres en una fila con rótulos cortos.
export function ClientSummary({ debe, credit, comprado }: { debe: number; credit: number; comprado: number }) {
  const card = "p-3 md:p-5";
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <Stat
        compact
        className={card}
        label="Debe"
        value={<Money value={debe} tone={debe > 0 ? "debe" : "neutral"} />}
      />
      <Stat
        compact
        className={card}
        label={
          <>
            <span className="md:hidden">A favor</span>
            <span className="hidden md:inline">Saldo a favor</span>
          </>
        }
        value={<Money value={credit} tone={credit > 0 ? "cobrado" : "neutral"} />}
      />
      <Stat
        compact
        className={card}
        label={
          <>
            <span className="md:hidden">Comprado</span>
            <span className="hidden md:inline">Total comprado</span>
          </>
        }
        value={<Money value={comprado} />}
      />
    </div>
  );
}
