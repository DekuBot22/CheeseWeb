"use client";

import { useState } from "react";
import type { WeekContext } from "@/domain/week-hint";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/Sheet";
import { OpenWeekForm } from "./OpenWeekForm";

// Botón "Abrir semana nueva" con su hoja (se usa en Ajustes).
export function OpenWeekButton({ context }: { context: WeekContext }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" className="w-full md:w-auto" onClick={() => setOpen(true)}>
        Abrir semana<span className="hidden md:inline">&nbsp;nueva</span>
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Abrir semana nueva">
        <OpenWeekForm today={context.today} lastOpening={context.lastOpening} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
