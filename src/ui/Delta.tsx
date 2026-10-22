import { cx } from "@/lib/cx";

// Variación porcentual contra el período anterior. `goodWhen` dice si subir
// es bueno (ingresos, ganancia) o malo (costos, deuda). Nunca solo color:
// siempre lleva flecha y número. `suffix` es opcional ("vs sem. anterior").
export function Delta({
  pct,
  goodWhen = "up",
  suffix = "",
}: {
  pct: number | null;
  goodWhen?: "up" | "down";
  suffix?: string;
}) {
  if (pct === null || !Number.isFinite(pct)) {
    return <span className="text-xs/4 text-tinta-3">— sin comparación</span>;
  }
  const up = pct > 0;
  const flat = Math.abs(pct) < 0.5;
  const good = flat ? null : up === (goodWhen === "up");
  return (
    <span
      className={cx(
        "num inline-flex items-center gap-1 text-xs/4 font-medium",
        good === null ? "text-tinta-2" : good ? "text-cobrado" : "text-debe"
      )}
    >
      <span aria-hidden="true">{flat ? "■" : up ? "▲" : "▼"}</span>
      {flat ? "0" : Math.abs(Math.round(pct))} %
      {suffix && <span className="font-normal text-tinta-3">{suffix}</span>}
    </span>
  );
}
