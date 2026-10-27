"use client";

import { useState } from "react";
import type { OpeningRef } from "@/domain/week-range";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/Sheet";
import { WeekRangeForm } from "./WeekRangeForm";

// Botón "Nueva semana" con su hoja (Ajustes): permite registrar una semana con desde / hasta, también del pasado.
export function NewWeekButton({ openings, today }: { openings: OpeningRef[]; today: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" className="w-full md:w-auto" onClick={() => setOpen(true)}>
        Nueva semana
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Nueva semana">
        <WeekRangeForm openings={openings} today={today} onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
