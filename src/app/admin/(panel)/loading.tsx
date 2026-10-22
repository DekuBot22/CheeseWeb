import { Skeleton } from "@/ui/Skeleton";

// Esqueleto con la forma del Inicio mientras cargan los datos de Supabase.
// `aria-busy` es la marca que usa globals.css (A5) para NO animar el esqueleto como si
// fuera contenido; `esqueleto-tardio` lo hace aparecer 120 ms tarde para evitar el destello.
export default function PanelLoading() {
  return (
    <div className="esqueleto-tardio space-y-4 md:space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="hidden h-8 w-64 md:block" />
      </div>
      <Skeleton className="h-52 w-full" />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
