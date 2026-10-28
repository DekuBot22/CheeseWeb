"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { planWeekRange, rangeSummary, type OpeningRef } from "@/domain/week-range";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Field, Input } from "@/ui/Field";
import { avisar } from "@/ui/toast-store";
import { EffectNotice } from "./EffectNotice";

export interface EditingWeek {
  id: string;
  from: string;
  until: string | null;
}

interface FormProps {
  openings: OpeningRef[];
  today: string;
  editing?: EditingWeek;
  onDone: () => void;
}

// Guarda la semana; devuelve el mensaje de error o "" si salió bien.
async function postRange(body: object): Promise<string> {
  try {
    const res = await fetch("/api/admin/week-openings/range", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return res.ok ? "" : (data.error ?? "No se pudo guardar la semana");
  } catch {
    return "No se pudo conectar. Intenta de nuevo.";
  }
}

// Valores derivados: si puede "seguir en curso" y el plan en vivo del dominio.
function derive({ openings, today, editing }: FormProps, v: { from: string; until: string; ongoing: boolean }) {
  // ¿Hay otra semana que empiece después de este inicio? Entonces no puede "seguir en curso".
  const hasLater = !!v.from && openings.some((o) => o.id !== editing?.id && o.date > v.from);
  const isOngoing = v.ongoing && !hasLater;
  const untilValue = isOngoing ? null : v.until || null;
  const ready = !!v.from && (isOngoing || !!v.until);
  const plan = ready ? planWeekRange(openings, { from: v.from, until: untilValue, editingId: editing?.id }, today) : null;
  return { hasLater, isOngoing, untilValue, plan };
}

// Estado del formulario: valores, plan en vivo (dominio) y envío.
function useWeekRangeForm(props: FormProps) {
  const { editing, onDone } = props;
  const router = useRouter();
  const [from, setFrom] = useState(editing?.from ?? "");
  const [until, setUntil] = useState(editing?.until ?? "");
  const [ongoing, setOngoing] = useState(editing ? editing.until === null : false);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const { hasLater, isOngoing, untilValue, plan } = derive(props, { from, until, ongoing });

  const change = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.target.value);
    setTouched(true);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!plan?.ok) return;
    setLoading(true);
    setServerError("");
    const message = await postRange({ from, until: untilValue, id: editing?.id, note: note.trim() || undefined });
    setLoading(false);
    if (message) return setServerError(message);
    avisar("Semana guardada");
    onDone();
    router.refresh();
  }

  return {
    from, until, note, hasLater, isOngoing, untilValue, plan, loading, serverError, submit,
    error: touched && plan && !plan.ok ? plan : null,
    onFrom: change(setFrom),
    onUntil: change(setUntil),
    onNote: (e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value),
    onOngoing: (e: React.ChangeEvent<HTMLInputElement>) => { setOngoing(e.target.checked); setTouched(true); },
  };
}

function OngoingCheckbox({ checked, disabled, onChange }: { checked: boolean; disabled: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className={`flex items-start gap-2 text-sm text-tinta ${disabled ? "opacity-60" : ""}`}>
      <input type="checkbox" className="mt-0.5" checked={checked} disabled={disabled} onChange={onChange} />
      <span>
        Sigue en curso
        <span className="block text-[0.8125rem] text-tinta-2">
          {disabled ? "No aplica: después de esta fecha ya empieza otra semana." : "Todavía no llega el siguiente queso."}
        </span>
      </span>
    </label>
  );
}

// Crear o editar una semana con "desde / hasta". El "hasta" es el día en que llegó el queso siguiente:
// ese día ya cuenta para la semana nueva (por eso la semana termina el día anterior).
export function WeekRangeForm(props: FormProps) {
  const uid = useId();
  const f = useWeekRangeForm(props);
  const { today, editing } = props;

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4" noValidate>
      <Field label="Llegó el queso el" htmlFor={`${uid}-desde`} hint="Primer día de la semana. Puede ser una fecha pasada." error={f.error?.field === "from" ? f.error.error : ""}>
        <Input id={`${uid}-desde`} type="date" required value={f.from} max={today} onChange={f.onFrom} />
      </Field>

      <Field label="Llegó el siguiente queso el" htmlFor={`${uid}-hasta`} hint="La semana termina el día anterior." error={f.error?.field === "until" ? f.error.error : ""}>
        <Input id={`${uid}-hasta`} type="date" value={f.isOngoing ? "" : f.until} disabled={f.isOngoing} max={today} onChange={f.onUntil} />
      </Field>

      <OngoingCheckbox checked={f.isOngoing} disabled={f.hasLater} onChange={f.onOngoing} />

      {!editing && (
        <Field label="Nota (opcional)" htmlFor={`${uid}-nota`}>
          <Input id={`${uid}-nota`} type="text" maxLength={300} value={f.note} onChange={f.onNote} placeholder="Ej. El queso llegó el domingo" />
        </Field>
      )}

      {f.plan?.ok && <Callout tone="info">{rangeSummary(f.from, f.untilValue)}</Callout>}
      {f.plan?.ok && <EffectNotice params={{ action: "rango", from: f.from, until: f.untilValue ?? undefined, id: editing?.id }} />}
      {f.serverError && <Callout tone="debe">{f.serverError}</Callout>}

      <Button type="submit" size="sm" className="w-full" loading={f.loading} disabled={!f.plan?.ok}>
        Guardar semana
      </Button>
    </form>
  );
}
