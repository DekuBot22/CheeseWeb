"use client";

import { useMemo, useState } from "react";
import {
  toKg,
  formatCOP,
  formatDate,
  KG_PER_LB,
  CHEESE_TYPE_LABELS,
  SALT_LEVEL_LABELS,
} from "@/lib/constants";
import type { CheeseType, SaltLevel } from "@/lib/types";

type Unit = "kg" | "lb";
type Status = "idle" | "loading" | "success" | "error";

const CHEESE_TYPES: CheeseType[] = ["duro", "semi", "blando"];
const SALT_LEVELS: SaltLevel[] = ["alto", "intermedio", "bajo"];

const CHIP_BASE =
  "rounded-lg border px-2 py-2 text-sm font-semibold transition-transform duration-150";
const CHIP_ACTIVE = "border-curado bg-curado text-cuajada -rotate-1 shadow-sm";
const CHIP_INACTIVE =
  "border-corteza bg-white text-tinta hover:border-curado hover:-rotate-1";

export default function OrderForm({
  pricePerKg,
  updatedAt,
}: {
  pricePerKg: number;
  updatedAt: string | null;
}) {
  const [clientName, setClientName] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [cheeseType, setCheeseType] = useState<CheeseType>("semi");
  const [saltLevel, setSaltLevel] = useState<SaltLevel>("intermedio");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const qtyNumber = Number(quantity);
  const total = useMemo(() => {
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) return 0;
    return Math.round(toKg(qtyNumber, unit) * pricePerKg);
  }, [qtyNumber, unit, pricePerKg]);

  const pricePerLb = pricePerKg * KG_PER_LB;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          quantity: qtyNumber,
          unit,
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

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
        <div className="mb-2 text-4xl">✅</div>
        <h2 className="font-display text-lg font-semibold text-emerald-900">
          ¡Pedido enviado!
        </h2>
        <p className="mt-1 text-sm text-emerald-800">
          Gracias {clientName}, tu pedido de {quantity} {unit} fue recibido. Te
          contactaremos para confirmarlo.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setClientName("");
            setQuantity("");
          }}
          className="mt-4 text-sm font-medium text-emerald-700 underline underline-offset-2"
        >
          Hacer otro pedido
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-corteza bg-white p-6 shadow-sm"
    >
      <div className="price-tag mb-1 rounded-xl bg-corteza/40 px-5 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-tinta/80">Precio por kg</span>
          <span className="font-mono text-lg font-bold text-tinta">
            {formatCOP(pricePerKg)}
          </span>
        </div>
        <div className="mt-0.5 flex items-baseline justify-between">
          <span className="text-xs font-medium text-tinta/60">Precio por libra</span>
          <span className="font-mono text-sm font-semibold text-tinta/80">
            {formatCOP(pricePerLb)}
          </span>
        </div>
      </div>
      {updatedAt && (
        <p className="mb-5 mt-1.5 text-xs text-tinta/50">
          Actualizado el {formatDate(updatedAt)}
        </p>
      )}

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium text-tinta/80">Tu nombre</span>
        <input
          required
          minLength={2}
          maxLength={100}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ej. María Pérez"
          className="w-full rounded-lg border border-corteza px-3 py-2 text-tinta outline-none focus:border-curado focus:ring-2 focus:ring-curado/30"
        />
      </label>

      <div className="mb-4">
        <span className="mb-1 block text-sm font-medium text-tinta/80">Unidad</span>
        <div className="grid grid-cols-2 gap-2">
          {(["kg", "lb"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`${CHIP_BASE} ${unit === u ? CHIP_ACTIVE : CHIP_INACTIVE}`}
            >
              {u === "kg" ? "Kilogramos" : "Libras"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-1 block text-sm font-medium text-tinta/80">Tipo de queso</span>
        <div className="grid grid-cols-3 gap-2">
          {CHEESE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCheeseType(type)}
              className={`${CHIP_BASE} px-2 ${
                cheeseType === type ? CHIP_ACTIVE : CHIP_INACTIVE
              }`}
            >
              {CHEESE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-1 block text-sm font-medium text-tinta/80">Nivel de sal</span>
        <div className="grid grid-cols-3 gap-2">
          {SALT_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSaltLevel(level)}
              className={`${CHIP_BASE} px-2 text-xs sm:text-sm ${
                saltLevel === level ? CHIP_ACTIVE : CHIP_INACTIVE
              }`}
            >
              {SALT_LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      <label className="mb-5 block">
        <span className="mb-1 block text-sm font-medium text-tinta/80">
          Cantidad ({unit})
        </span>
        <input
          required
          type="number"
          step="0.01"
          min="0.01"
          max="1000"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Ej. 2"
          className="w-full rounded-lg border border-corteza px-3 py-2 text-tinta outline-none focus:border-curado focus:ring-2 focus:ring-curado/30"
        />
      </label>

      <div className="mb-5 flex items-center justify-between border-t border-dashed border-terracota/30 pt-4">
        <span className="text-sm font-medium text-tinta/70">Total estimado</span>
        <span className="font-mono text-xl font-bold text-tinta">{formatCOP(total)}</span>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-curado px-4 py-3 text-sm font-semibold text-cuajada transition-colors hover:bg-terracota disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Enviar pedido"}
      </button>
    </form>
  );
}
