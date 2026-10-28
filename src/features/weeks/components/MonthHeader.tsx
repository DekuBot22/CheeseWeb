import { Button } from "@/ui/Button";
import { IconChevronLeft, IconChevronRight } from "@/ui/icons";

const ARROW =
  "presionable flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-linea bg-hoja text-tinta hover:bg-hoja-2 disabled:opacity-40 md:h-8 md:w-8";

// "‹ octubre 2026 ›" con un botón "Hoy" cuando se está mirando otro mes. La flecha siguiente se apaga en el mes actual.
export function MonthHeader({
  label,
  labelId,
  canNext,
  isCurrent,
  onPrev,
  onNext,
  onToday,
}: {
  label: string;
  labelId: string;
  canNext: boolean;
  isCurrent: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button type="button" aria-label="Mes anterior" onClick={onPrev} className={ARROW}>
        <IconChevronLeft />
      </button>
      <div className="flex min-w-0 items-center gap-2">
        <h3 id={labelId} aria-live="polite" className="text-sm/5 font-semibold text-tinta capitalize">
          {label}
        </h3>
        {!isCurrent && (
          <Button size="sm" variant="ghost" onClick={onToday}>
            Hoy
          </Button>
        )}
      </div>
      <button type="button" aria-label="Mes siguiente" disabled={!canNext} onClick={onNext} className={ARROW}>
        <IconChevronRight />
      </button>
    </div>
  );
}
