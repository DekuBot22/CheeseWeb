"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OpeningRef } from "@/domain/week-range";
import { formatDay } from "@/lib/format";
import { ReasonForm } from "@/ui/ReasonForm";
import { announceWeekChange } from "./announce-week-change";
import { EffectNotice } from "./EffectNotice";

const VOID_SUGGESTIONS = ["Me equivoqué de día", "Duplicada", "El queso no llegó"] as const;

// POST a la apertura (anular); devuelve el mensaje de error o "" si salió bien.
async function postVoid(id: string, reason: string): Promise<string> {
  try {
    const res = await fetch(`/api/admin/week-openings/${id}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    return res.ok ? "" : (data.error ?? "No se pudo guardar");
  } catch {
    return "No se pudo conectar. Intenta de nuevo.";
  }
}

// Anular una apertura (la semana se junta con la anterior): motivo obligatorio y vista previa de lo que cambia.
export function VoidOpeningForm({
  id,
  from,
  openings,
  onDone,
}: {
  id: string;
  from: string;
  openings: OpeningRef[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(reason: string) {
    setLoading(true);
    const message = await postVoid(id, reason);
    setLoading(false);
    setError(message);
    if (message) return;
    onDone();
    announceWeekChange("Apertura anulada", openings, router.refresh);
    router.refresh();
  }

  return (
    <ReasonForm
      suggestions={VOID_SUGGESTIONS}
      confirmLabel="Anular apertura"
      loading={loading}
      error={error}
      onSubmit={submit}
      onCancel={onDone}
    >
      <p className="rounded-md bg-hoja-2 px-3 py-2 text-sm text-tinta-2">
        La semana que abriste el {formatDay(from)} se junta con la anterior. Anular es definitivo, pero queda guardado con su
        motivo.
      </p>
      <EffectNotice params={{ action: "anular", id }} />
    </ReasonForm>
  );
}
