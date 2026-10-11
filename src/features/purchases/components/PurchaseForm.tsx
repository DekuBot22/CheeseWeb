"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { bogotaDate } from "@/lib/bogota-time";

export function PurchaseForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const uid = useId();
  const [date, setDate] = useState(bogotaDate());
  const [kg, setKg] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_date: date,
          kg: Number(kg),
          total_cost: Number(totalCost),
          description: description || undefined,
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
      if (onDone) onDone();
      else router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Fecha" htmlFor={`${uid}-fecha`}>
        <Input id={`${uid}-fecha`} type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Kilogramos" htmlFor={`${uid}-kg`}>
          <Input
            id={`${uid}-kg`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="Ej. 50"
          />
        </Field>
        <Field label="Costo total" htmlFor={`${uid}-costo`}>
          <Input
            id={`${uid}-costo`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="Ej. 900000"
          />
        </Field>
      </div>

      <Field label="Descripción (opcional)" htmlFor={`${uid}-desc`}>
        <Input
          id={`${uid}-desc`}
          type="text"
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Lote del sábado"
        />
      </Field>

      <Button type="submit" loading={loading}>
        Registrar compra
      </Button>
      <div aria-live="polite">
        {error && <p role="alert" className="aparece text-sm font-medium text-debe">{error}</p>}
        {saved && !error && <p className="aparece text-sm font-medium text-cobrado">✓ Compra registrada</p>}
      </div>
    </form>
  );
}
