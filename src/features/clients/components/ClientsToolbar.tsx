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
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Suspense fallback={null}>
        <SearchInput label="Buscar cliente por nombre o teléfono" placeholder="Nombre o teléfono…" />
      </Suspense>
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
  );
}
