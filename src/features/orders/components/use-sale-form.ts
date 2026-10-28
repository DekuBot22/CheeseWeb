"use client";

import { useState } from "react";
import type { CheeseType, SaltLevel } from "@/domain/catalog";
import { discountedPricePerKg, priceOrder, type Order } from "@/domain/order";
import type { Unit } from "@/domain/units";

export type SaleMode = "cantidad" | "valor";

// Estado de la hoja "Nueva venta": qué se vendió, a quién, si ya pagó y de qué día.
// El total que se ve es una estimación con el precio vigente; el servidor lo fija.
// `initialDate`: fecha con la que arranca (al mirar una semana pasada, su último día); vacía = hoy.
export function useSaleForm(
  pricePerKg: number,
  onDone: (order: Order, paymentError?: string) => void,
  initialDate = ""
) {
  const [clientName, setClientName] = useState("");
  const [mode, setMode] = useState<SaleMode>("cantidad");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>("lb");
  const [amount, setAmount] = useState("");
  const [cheese, setCheese] = useState<CheeseType>("semi");
  const [salt, setSalt] = useState<SaltLevel>("intermedio");
  const [discount, setDiscount] = useState("");
  const [note, setNote] = useState("");
  // Descuento y nota son poco habituales: van detrás de una casilla. Al desmarcarla
  // se borra lo escrito, para que no se mande sin que se vea.
  const [showDiscount, setShowDiscount] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState("");
  const [date, setDate] = useState(initialDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDiscount(on: boolean) {
    setShowDiscount(on);
    if (!on) setDiscount("");
  }

  function toggleNote(on: boolean) {
    setShowNote(on);
    if (!on) setNote("");
  }

  const qty = Number(quantity);
  const value = Number(amount);
  const disc = Number(discount);
  const discountPerUnit = mode === "cantidad" && Number.isFinite(disc) && disc > 0 ? disc : 0;
  // Precio por kg de esta venta (con el descuento, si hay) y cuánto se ahorra el cliente.
  const salePricePerKg = discountPerUnit ? discountedPricePerKg(pricePerKg, discountPerUnit, unit) : pricePerKg;
  const total =
    mode === "valor"
      ? Number.isFinite(value) && value > 0 ? Math.round(value) : 0
      : Number.isFinite(qty) && qty > 0 && salePricePerKg > 0
        ? priceOrder({ quantity: qty, unit }, salePricePerKg).total
        : 0;
  const saved =
    discountPerUnit && total > 0 ? priceOrder({ quantity: qty, unit }, pricePerKg).total - total : 0;

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
          ...(mode === "valor" ? { amount: value } : { quantity: qty, unit, discount: discountPerUnit || undefined }),
          cheese_type: cheese,
          salt_level: salt,
          note: note.trim() || undefined,
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
    discount, setDiscount, discountPerUnit, salePricePerKg, saved,
    note, setNote,
    showDiscount, toggleDiscount,
    showNote, toggleNote,
    paid, setPaid,
    method, setMethod,
    date, setDate,
    total, loading, error, submit,
  };
}
