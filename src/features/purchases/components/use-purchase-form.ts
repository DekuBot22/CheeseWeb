"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { canOpenOn, suggestOpenOnPurchase, type WeekContext } from "@/domain/week-hint";
import { bogotaDate } from "@/lib/bogota-time";

export interface PurchaseDone {
  weekOpened: boolean;
}

// Estado y envío del formulario de compra. `week` activa la casilla "Llegó el lote".
// `initialDate`: fecha con la que arranca (por defecto hoy).
export function usePurchaseForm(onDone?: (info: PurchaseDone) => void, week?: WeekContext, initialDate?: string) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate ?? bogotaDate());
  const [kg, setKg] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [description, setDescription] = useState("");
  // null = lo que sugiera la semana (marcada si ya lleva 5 días o más); true/false = lo que eligió.
  const [openChoice, setOpenChoice] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weekWarning, setWeekWarning] = useState("");
  const [saved, setSaved] = useState(false);

  const canOpen = !!week && canOpenOn(week, date);
  const openWeek = canOpen && (openChoice ?? suggestOpenOnPurchase(week));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    setWeekWarning("");
    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_date: date,
          kg: Number(kg),
          total_cost: Number(totalCost),
          description: description || undefined,
          open_week: openWeek || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la compra");
        return;
      }
      setKg("");
      setTotalCost("");
      setDescription("");
      setSaved(true);
      setOpenChoice(null);
      if (data.weekError) {
        // La compra quedó guardada; la semana no se abrió. La hoja sigue abierta para que se lea el motivo.
        setWeekWarning(`La semana nueva no se abrió: ${data.weekError}`);
        router.refresh();
      } else if (onDone) onDone({ weekOpened: !!data.weekOpened });
      else router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return {
    values: { date, kg, totalCost, description },
    set: { date: setDate, kg: setKg, totalCost: setTotalCost, description: setDescription },
    lot: { show: canOpen, checked: openWeek, onChange: setOpenChoice },
    status: { loading, error, weekWarning, saved },
    submit,
  };
}
