"use client";

import { useMemo, useState } from "react";
import type { CheeseType, SaltLevel } from "@/domain/catalog";
import { KG_PER_LB, toKg, type Unit } from "@/domain/units";

export type OrderMode = "cantidad" | "valor";
type Status = "idle" | "loading" | "success" | "error";

// Estado del formulario público de pedido: lo que el cliente va eligiendo, el
// total estimado en vivo y el envío a /api/orders.
export function useOrderForm(pricePerKg: number) {
  const [clientName, setClientName] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [cheeseType, setCheeseType] = useState<CheeseType>("semi");
  const [saltLevel, setSaltLevel] = useState<SaltLevel>("intermedio");
  const [quantity, setQuantity] = useState("");
  const [mode, setMode] = useState<OrderMode>("cantidad");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const byAmount = mode === "valor";
  const qtyNumber = Number(quantity);
  const amountNumber = Number(amount);
  const amountValid = Number.isFinite(amountNumber) && amountNumber > 0;
  const total = useMemo(() => {
    if (byAmount) return amountValid ? Math.round(amountNumber) : 0;
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) return 0;
    return Math.round(toKg(qtyNumber, unit) * pricePerKg);
  }, [byAmount, amountValid, amountNumber, qtyNumber, unit, pricePerKg]);

  const equivKg = amountValid ? amountNumber / pricePerKg : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          ...(byAmount ? { amount: amountNumber } : { quantity: qtyNumber, unit }),
          cheese_type: cheeseType,
          salt_level: saltLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Ocurrió un error, intenta de nuevo.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("No se pudo enviar el pedido. Revisa tu conexión.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setClientName("");
    setQuantity("");
    setAmount("");
  }

  return {
    clientName,
    setClientName,
    unit,
    setUnit,
    cheeseType,
    setCheeseType,
    saltLevel,
    setSaltLevel,
    quantity,
    setQuantity,
    mode,
    setMode,
    amount,
    setAmount,
    status,
    errorMsg,
    byAmount,
    amountValid,
    total,
    equivalent: { kg: equivKg, lb: equivKg / KG_PER_LB },
    submit,
    reset,
  };
}
