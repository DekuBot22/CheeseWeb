import { Suspense } from "react";
import type { ClientSort } from "@/domain/client-balance";
import { SearchInput } from "@/ui/SearchInput";
import { SegmentedControl } from "@/ui/SegmentedControl";

export function ClientsToolbar({ query, sort }: { query: string; sort: ClientSort }) {
  const link = (next: ClientSort) => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (next !== "deuda") sp.set("orden", next);
    const qs = sp.toString();
    return qs ? `/admin/clientes?${qs}` : "/admin/clientes";
  };

  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
      <Suspense fallback={null}>
        <SearchInput
          label="Buscar cliente por nombre o teléfono"
          placeholder="Nombre o teléfono…"
          className="w-full md:w-80"
        />
      </Suspense>
      {/* En móvil el selector se desliza de lado si no cabe. */}
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
        <SegmentedControl
          label="Ordenar clientes"
          value={sort}
          options={[
            { value: "deuda", label: "Mayor deuda", href: link("deuda") },
            { value: "antigua", label: "Más antigua", href: link("antigua") },
            { value: "nombre", label: "Nombre", href: link("nombre") },
            { value: "pedidos", label: "Más pedidos", href: link("pedidos") },
          ]}
        />
      </div>
    </div>
  );
}
