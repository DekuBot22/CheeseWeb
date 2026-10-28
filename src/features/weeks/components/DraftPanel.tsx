"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { draftInput, setEdge, setOngoing, type Draft, type Edge } from "@/domain/week-draft";
import { rangeSummary, strayDays, type OpeningRef, type WeekRangePlan } from "@/domain/week-range";
import { formatDayShort } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { SegmentedButtons } from "@/ui/SegmentedButtons";
import { Sheet } from "@/ui/Sheet";
import { avisar } from "@/ui/toast-store";
import { EffectNotice } from "./EffectNotice";
import { postWeekRange } from "./post-week-range";
import { VoidOpeningForm } from "./VoidOpeningForm";

const EDGE_HINT: Record<Edge, string> = {
  from: "Toca el nuevo día de inicio.",
  last: "Toca el último día de la semana.",
};

// Aviso de días sueltos antes de la primera semana, con el atajo de juntarlos a esa semana.
function StrayNotice({ plan, draft, today, onChange }: { plan: WeekRangePlan; draft: Draft; today: string; onChange: (d: Draft) => void }) {
  if (!plan.ok || plan.after[0] !== draft.from) return null;
  const stray = strayDays(plan.after, today);
  if (!stray) return null;
  const range = stray.days === 1 ? `El ${formatDayShort(stray.from)}` : `Del ${formatDayShort(stray.from)} al ${formatDayShort(stray.to)}`;
  return (
    <Callout tone="aviso">
      {range} queda {stray.days === 1 ? "1 día suelto" : `${stray.days} días sueltos`} antes de tu primera semana.{" "}
      <button type="button" className="font-medium underline" onClick={() => onChange({ ...draft, from: stray.from })}>
        Juntarlo a esta semana
      </button>
    </Callout>
  );
}

// Resumen en vivo del borrador, o el error del dominio. «Ya está así» no es un error: aún no se movió nada.
function PlanMessage({ plan, draft }: { plan: WeekRangePlan; draft: Draft }) {
  const input = draftInput(draft);
  const unchanged = !plan.ok && plan.error === "Esa semana ya está así";
  if (plan.ok || unchanged) return <Callout tone="info">{rangeSummary(input.from, input.until)}</Callout>;
  return <Callout tone="debe">{plan.error}</Callout>;
}

// Panel de la semana seleccionada: qué borde se mueve, resumen, efecto en las cifras y Guardar / Cancelar / Anular.
export function DraftPanel({
  draft,
  plan,
  openings,
  today,
  onChange,
  onClose,
}: {
  draft: Draft;
  plan: WeekRangePlan;
  openings: OpeningRef[];
  today: string;
  onChange: (draft: Draft) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [voiding, setVoiding] = useState(false);
  const input = draftInput(draft);
  const canContinue = !openings.some((o) => o.id !== draft.id && o.date > draft.from);

  async function save() {
    if (!plan.ok) return;
    setSaving(true);
    setError("");
    const message = await postWeekRange({ from: input.from, until: input.until, id: draft.id });
    setSaving(false);
    if (message) return setError(message);
    avisar("Semana guardada");
    onClose();
    router.refresh();
  }

  return (
    <div className="aparece flex flex-col gap-3 rounded-md border border-linea bg-hoja-2 p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SegmentedButtons
          label="Qué mover"
          value={draft.edge}
          onChange={(edge) => onChange(setEdge(draft, edge))}
          options={[
            { value: "from", label: "Inicio" },
            { value: "last", label: "Fin" },
          ]}
        />
        <p className="text-[0.8125rem] text-tinta-2">{EDGE_HINT[draft.edge]}</p>
      </div>

      {canContinue && (
        <label className="flex items-center gap-2 text-sm text-tinta">
          <input type="checkbox" checked={draft.last === null} onChange={(e) => onChange(setOngoing(draft, e.target.checked, today))} />
          Sigue en curso
        </label>
      )}

      <div aria-live="polite" className="flex flex-col gap-2">
        <PlanMessage plan={plan} draft={draft} />
        <StrayNotice plan={plan} draft={draft} today={today} onChange={onChange} />
      </div>
      {plan.ok && <EffectNotice compact params={{ action: "rango", from: input.from, until: input.until ?? undefined, id: draft.id }} />}
      {error && <Callout tone="debe">{error}</Callout>}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" loading={saving} disabled={!plan.ok} onClick={save}>
          Guardar semana
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        {draft.id && (
          <Button size="sm" variant="ghost" className="md:ml-auto" onClick={() => setVoiding(true)}>
            Anular semana
          </Button>
        )}
      </div>

      {draft.id && (
        <Sheet open={voiding} onClose={() => setVoiding(false)} title="Anular apertura">
          <VoidOpeningForm
            id={draft.id}
            from={draft.from}
            onDone={() => {
              setVoiding(false);
              onClose();
            }}
          />
        </Sheet>
      )}
    </div>
  );
}
