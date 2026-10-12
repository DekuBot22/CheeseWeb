import { Suspense } from "react";
import { SearchInput } from "@/ui/SearchInput";
import { SegmentedControl } from "@/ui/SegmentedControl";

export const ORDER_STATES = ["todos", "pendiente", "completado", "anulado"] as const;
export const PAYMENT_FILTERS = ["todos", "debe", "parcial", "pagado"] as const;
export const ORDER_PERIODS = ["todos", "semana", "anterior"] as const;

export interface OrdersFilterValues {
  q: string;
  estado: (typeof ORDER_STATES)[number];
  pago: (typeof PAYMENT_FILTERS)[number];
  periodo: (typeof ORDER_PERIODS)[number];
}

// Conserva los demás filtros al cambiar uno.
function hrefWith(values: OrdersFilterValues, changes: Partial<OrdersFilterValues>): string {
  const next = { ...values, ...changes };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value && value !== "todos") sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/admin/pedidos?${qs}` : "/admin/pedidos";
}

export function OrdersFilters({ values }: { values: OrdersFilterValues }) {
  const link = (changes: Partial<OrdersFilterValues>) => hrefWith(values, changes);

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Suspense fallback={null}>
          <SearchInput label="Buscar pedidos por cliente" placeholder="Buscar cliente…" />
        </Suspense>
        <SegmentedControl
          label="Período"
          value={values.periodo}
          options={[
            { value: "todos", label: "Todos", href: link({ periodo: "todos" }) },
            { value: "semana", label: "Esta semana", href: link({ periodo: "semana" }) },
            { value: "anterior", label: "Semana anterior", href: link({ periodo: "anterior" }) },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Estado del pedido"
          value={values.estado}
          options={[
            { value: "todos", label: "Todos", href: link({ estado: "todos" }) },
            { value: "pendiente", label: "Pendientes", href: link({ estado: "pendiente" }) },
            { value: "completado", label: "Listos", href: link({ estado: "completado" }) },
            { value: "anulado", label: "Anulados", href: link({ estado: "anulado" }) },
          ]}
        />
        <SegmentedControl
          label="Estado del pago"
          value={values.pago}
          options={[
            { value: "todos", label: "Todos", href: link({ pago: "todos" }) },
            { value: "debe", label: "Debe", href: link({ pago: "debe" }) },
            { value: "parcial", label: "Parcial", href: link({ pago: "parcial" }) },
            { value: "pagado", label: "Pagado", href: link({ pago: "pagado" }) },
          ]}
        />
      </div>
    </div>
  );
}
