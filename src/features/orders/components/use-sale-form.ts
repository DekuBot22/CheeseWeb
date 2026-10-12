"use client";

import { useState } from "react";
import type { CheeseType, SaltLevel } from "@/domain/catalog";
import { priceOrder, type Order } from "@/domain/order";
import type { Unit } from "@/domain/units";

export type SaleMode = "cantidad" | "valor";

// Estado de la hoja "Nueva venta": qué se vendió, a quién, si ya pagó y de qué día.
// El total que se ve es una estimación con el precio vigente; el servidor lo fija.
export function useSaleForm(pricePerKg: number, onDone: (order: Order, paymentError?: string) => void) {
  const [clientName, setClientName] = useState("");
  const [mode, setMode] = useState<SaleMode>("cantidad");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>("lb");
  const [amount, setAmount] = useState("");
  const [cheese, setCheese] = useState<CheeseType>("semi");
  const [salt, setSalt] = useState<SaltLevel>("intermedio");
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const qty = Number(quantity);
  const value = Number(amount);
  const total =
    mode === "valor"
      ? Number.isFinite(value) && value > 0 ? Math.round(value) : 0
      : Number.isFinite(qty) && qty > 0 ? priceOrder({ quantity: qty, unit }, pricePerKg).total : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          mode,
          ...(mode === "valor" ? { amount: value } : { quantity: qty, unit }),
          cheese_type: cheese,
          salt_level: salt,
          paid,
          method: paid && method ? method : undefined,
          date: date || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la venta");
        return;
      }
      onDone(data.order, data.paymentError);
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return {
    clientName, setClientName,
    mode, setMode,
    quantity, setQuantity,
    unit, setUnit,
    amount, setAmount,
    cheese, setCheese,
    salt, setSalt,
    paid, setPaid,
    method, setMethod,
    date, setDate,
    total, loading, error, submit,
  };
}
