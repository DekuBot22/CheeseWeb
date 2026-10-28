"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { bogotaDate } from "@/lib/bogota-time";

export function ProviderPaymentForm({ onDone, initialDate }: { onDone?: () => void; initialDate?: string }) {
  const router = useRouter();
  const uid = useId();
  const [date, setDate] = useState(initialDate ?? bogotaDate());
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/provider-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_date: date,
          amount: Number(amount),
          method: method || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el pago");
        return;
      }
      setAmount("");
      setMethod("");
      setNotes("");
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
        <Field label="Monto" htmlFor={`${uid}-monto`}>
          <Input
            id={`${uid}-monto`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej. 500000"
          />
        </Field>
        <Field label="Método (opcional)" htmlFor={`${uid}-metodo`}>
          <Input
            id={`${uid}-metodo`}
            type="text"
            maxLength={50}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Efectivo…"
          />
        </Field>
      </div>

      <Field label="Nota (opcional)" htmlFor={`${uid}-nota`}>
        <Input
          id={`${uid}-nota`}
          type="text"
          maxLength={300}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      <Button type="submit" size="sm" className="w-full md:w-auto md:self-start" loading={loading}>
        Registrar pago
      </Button>
      <div aria-live="polite">
        {error && <p role="alert" className="aparece text-sm font-medium text-debe">{error}</p>}
        {saved && !error && <p className="aparece text-sm font-medium text-cobrado">✓ Pago registrado</p>}
      </div>
    </form>
  );
}
