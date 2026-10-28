"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DiscountReason } from "@/domain/purchase";
import { bogotaDate } from "@/lib/bogota-time";
import type { PurchaseOption } from "../types";

const round2 = (n: number) => Math.round(n * 100) / 100;

// Estado y envío del formulario "Nuevo descuento". El monto en pesos es la
// fuente de verdad; "calcular por kg" solo ayuda a obtenerlo (kg × rebaja por kg).
export function useProviderDiscountForm(options: PurchaseOption[], onDone?: () => void, initialDate?: string) {
  const router = useRouter();
  const [reason, setReason] = useState<DiscountReason>("salado");
  const [purchaseId, setPurchaseId] = useState("");
  const [date, setDate] = useState(initialDate ?? bogotaDate());
  const [amount, setAmount] = useState("");
  const [byKg, setByKg] = useState(false);
  const [kg, setKg] = useState("");
  const [rebate, setRebate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const selected = options.find((o) => o.id === purchaseId) ?? null;
  const computed = round2(Number(kg) * Number(rebate));
  const finalAmount = byKg ? computed : Number(amount);

  // Al elegir una compra, la fecha del descuento pasa a ser la de esa compra
  // (así baja el costo de la semana en que entró ese queso); se puede cambiar.
  function pickPurchase(id: string) {
    setPurchaseId(id);
    const option = options.find((o) => o.id === id);
    if (option) setDate(option.date);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/provider-discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discount_date: date,
          amount: finalAmount,
          reason,
          purchase_id: purchaseId || undefined,
          kg: byKg && kg ? Number(kg) : undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el descuento");
        return;
      }
      setAmount("");
      setKg("");
      setRebate("");
      setNotes("");
      setPurchaseId("");
      setSaved(true);
      if (onDone) onDone();
      else router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return {
    values: { reason, purchaseId, date, amount, byKg, kg, rebate, notes, computed, selected },
    status: { loading, error, saved },
    set: { setReason, setDate, setAmount, setByKg, setKg, setRebate, setNotes, pickPurchase },
    submit,
  };
}
