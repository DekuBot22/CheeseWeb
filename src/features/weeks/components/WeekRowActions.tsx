"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { formatDay } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { ReasonForm } from "@/ui/ReasonForm";
import { Sheet } from "@/ui/Sheet";
import { avisar } from "@/ui/toast-store";
import { EffectNotice } from "./EffectNotice";

const VOID_SUGGESTIONS = ["Me equivoqué de día", "Duplicada", "El queso no llegó"] as const;

// POST a la apertura (mover o anular); devuelve el mensaje de error o "" si salió bien.
async function post(url: string, body: object): Promise<string> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    return res.ok ? "" : (data.error ?? "No se pudo guardar");
  } catch {
    return "No se pudo conectar. Intenta de nuevo.";
  }
}

function MoveForm({ id, from, today, onDone }: { id: string; from: string; today: string; onDone: () => void }) {
  const uid = useId();
  const router = useRouter();
  const [date, setDate] = useState(from);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const changed = date !== from;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const message = await post(`/api/admin/week-openings/${id}/move`, { start_date: date });
    setLoading(false);
    setError(message);
    if (message) return;
    onDone();
    avisar("Inicio de semana movido");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field
        label="Nuevo primer día"
        htmlFor={`${uid}-fecha`}
        hint={`Hoy empieza el ${formatDay(from)}. Debe quedar entre la apertura anterior y la siguiente.`}
        error={error}
      >
        <Input id={`${uid}-fecha`} type="date" required value={date} max={today} onChange={(e) => setDate(e.target.value)} />
      </Field>
      {changed && date && date <= today && <EffectNotice params={{ action: "mover", id, date }} />}
      <Button type="submit" loading={loading} disabled={!changed}>
        Mover inicio de semana
      </Button>
    </form>
  );
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

// Botones de una semana abierta a mano: mover su inicio o anular la apertura.
export function WeekRowActions({ id, from, today }: { id: string; from: string; today: string }) {
  const [mode, setMode] = useState<"mover" | "anular" | null>(null);
  const close = () => setMode(null);

  return (
    <>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" aria-label={`Mover el inicio de la semana del ${formatDay(from)}`} onClick={() => setMode("mover")}>
          Mover
        </Button>
        <Button size="sm" variant="ghost" aria-label={`Anular la apertura del ${formatDay(from)}`} onClick={() => setMode("anular")}>
          Anular
        </Button>
      </div>
      <Sheet open={mode === "mover"} onClose={close} title="Mover inicio de semana">
        <MoveForm id={id} from={from} today={today} onDone={close} />
      </Sheet>
      <Sheet open={mode === "anular"} onClose={close} title="Anular apertura">
        <VoidForm id={id} from={from} onDone={close} />
      </Sheet>
    </>
  );
}
