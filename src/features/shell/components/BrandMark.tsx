// Marca del panel: cuadro con la inicial. `subtitle` solo en el menú lateral (la barra móvil va sola).
export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-sm border border-linea bg-hoja-3 text-sm font-semibold text-tinta"
      >
        C
      </span>
      <span className="flex flex-col">
        <span className="text-sm/5 font-semibold text-tinta">Cuaderno</span>
        {subtitle && (
          <span className="text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">{subtitle}</span>
        )}
      </span>
    </span>
  );
}
