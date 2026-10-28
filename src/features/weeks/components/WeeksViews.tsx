"use client";

import { useState, type ReactNode } from "react";
import { SegmentedButtons } from "@/ui/SegmentedButtons";

type View = "calendario" | "lista";

// Selector Calendario | Lista de la tarjeta de semanas. El calendario es la vista por defecto;
// la lista (con Editar y Anular por semana) es la otra pestaña y también la vía más directa con lector de pantalla.
export function WeeksViews({ calendar, list }: { calendar: ReactNode; list: ReactNode }) {
  const [view, setView] = useState<View>("calendario");
  return (
    <div className="flex flex-col gap-4">
      <SegmentedButtons
        label="Vista de semanas"
        value={view}
        onChange={setView}
        options={[
          { value: "calendario", label: "Calendario" },
          { value: "lista", label: "Lista" },
        ]}
      />
      {view === "calendario" ? calendar : list}
    </div>
  );
}
