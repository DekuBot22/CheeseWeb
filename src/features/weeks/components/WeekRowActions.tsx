"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OpeningRef } from "@/domain/week-range";
import { formatDay } from "@/lib/format";
import { Button } from "@/ui/Button";
import { ReasonForm } from "@/ui/ReasonForm";
import { Sheet } from "@/ui/Sheet";
import { avisar } from "@/ui/toast-store";
import { EffectNotice } from "./EffectNotice";
import { WeekRangeForm } from "./WeekRangeForm";

const VOID_SUGGESTIONS = ["Me equivoqué de día", "Duplicada", "El queso no llegó"] as const;

// POST a la apertura (anular); devuelve el mensaje de error o "" si salió bien.
async function post(url: string, body: object): Promise<string> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    return res.ok ? "" : (data.error ?? "No se pudo guardar");
  } catch {
    return "No se pudo conectar. Intenta de nuevo.";
  }
}

function VoidForm({ id, from, onDone }: { id: string; from: string; onDone: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(reason: string) {
    setLoading(true);
    const message = await post(`/api/admin/week-openings/${id}/void`, { reason });
    setLoading(false);
    setError(message);
    if (message) return;
    onDone();
    avisar("Apertura anulada");
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

// Botones de una semana abierta a mano: editar su inicio y fin, o anular la apertura.
export function WeekRowActions({
  id,
  from,
  until,
  openings,
  today,
}: {
  id: string;
  from: string;
  until: string | null;
  openings: OpeningRef[];
  today: string;
}) {
  const [mode, setMode] = useState<"editar" | "anular" | null>(null);
  const close = () => setMode(null);

  return (
    <>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" aria-label={`Editar la semana del ${formatDay(from)}`} onClick={() => setMode("editar")}>
          Editar
        </Button>
        <Button size="sm" variant="ghost" aria-label={`Anular la apertura del ${formatDay(from)}`} onClick={() => setMode("anular")}>
          Anular
        </Button>
      </div>
      <Sheet open={mode === "editar"} onClose={close} title="Editar semana">
        <WeekRangeForm openings={openings} today={today} editing={{ id, from, until }} onDone={close} />
      </Sheet>
      <Sheet open={mode === "anular"} onClose={close} title="Anular apertura">
        <VoidForm id={id} from={from} onDone={close} />
      </Sheet>
    </>
  );
}
