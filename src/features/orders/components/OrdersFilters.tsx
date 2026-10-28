"use client";

import { Suspense, useState } from "react";
import { Button } from "@/ui/Button";
import { IconFilter } from "@/ui/icons";
import { SearchInput } from "@/ui/SearchInput";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { Sheet } from "@/ui/Sheet";
import { activeFilterCount, hrefWith, type OrdersFilterValues } from "../order-filters";

// En PC los filtros se ven siempre; en móvil se esconden tras el botón "Filtros".
// Con una semana elegida (`scoped`) el filtro de período sobra: la semana ya manda.
export function OrdersFilters({ values, scoped = false }: { values: OrdersFilterValues; scoped?: boolean }) {
  const [open, setOpen] = useState(false);
  const link = (changes: Partial<OrdersFilterValues>) => hrefWith(values, changes);
  const count = activeFilterCount(values);

  const period = (
    <SegmentedControl
      label="Período"
      value={values.periodo}
      options={[
        { value: "todos", label: "Todos", href: link({ periodo: "todos" }) },
        { value: "semana", label: "Esta semana", href: link({ periodo: "semana" }) },
        { value: "anterior", label: "Semana anterior", href: link({ periodo: "anterior" }) },
      ]}
    />
  );
  const state = (
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
  );
  const cheese = (
    <SegmentedControl
      label="Tipo de queso"
      value={values.tipo}
      options={[
        { value: "todos", label: "Todos", href: link({ tipo: "todos" }) },
        { value: "duro", label: "Duros", href: link({ tipo: "duro" }) },
        { value: "semi", label: "Semi-duros", href: link({ tipo: "semi" }) },
        { value: "blando", label: "Blandos", href: link({ tipo: "blando" }) },
      ]}
    />
  );
  const payment = (
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
  );

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Suspense fallback={null}>
          <SearchInput
            label="Buscar pedidos por cliente"
            placeholder="Buscar cliente…"
            className="min-w-0 flex-1 md:w-80 md:flex-none"
          />
        </Suspense>
        <Button variant="secondary" className="md:hidden" onClick={() => setOpen(true)}>
          <IconFilter />
          Filtros{count > 0 && ` · ${count}`}
        </Button>
        {!scoped && <div className="hidden md:block">{period}</div>}
      </div>
      <div className="hidden flex-wrap items-center gap-3 md:flex">
        {state}
        {cheese}
        {payment}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Filtros">
        {/* Cada opción es un enlace: al tocar una, la lista se actualiza y la hoja se cierra. */}
        <div
          className="flex flex-col gap-4"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {[
            ...(scoped ? [] : [["Período", period]]),
            ["Estado del pedido", state],
            ["Tipo de queso", cheese],
            ["Estado del pago", payment],
          ].map(([title, control]) => (
            <div key={title as string} className="flex flex-col gap-1.5">
              <p className="text-xs/4 font-medium text-tinta-3">{title}</p>
              <div>{control}</div>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
