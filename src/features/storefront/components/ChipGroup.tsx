const CHIP_BASE = "rounded-lg border px-2 py-2 text-sm font-semibold transition-transform duration-150";
const CHIP_ACTIVE = "border-curado bg-curado text-cuajada -rotate-1 shadow-sm";
const CHIP_INACTIVE = "border-corteza bg-white text-tinta hover:border-curado hover:-rotate-1";

// Fila de opciones tipo "chip" (una sola elegida) para el formulario público.
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
  chipClassName = "",
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
  chipClassName?: string;
}) {
  return (
    <div className="mb-4">
      <span className="mb-1 block text-sm font-medium text-tinta/80">{label}</span>
      <div className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`${CHIP_BASE} ${chipClassName} ${value === o.value ? CHIP_ACTIVE : CHIP_INACTIVE}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
