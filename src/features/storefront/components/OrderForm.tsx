"use client";

import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS, type CheeseType, type SaltLevel } from "@/domain/catalog";
import type { Unit } from "@/domain/units";
import { formatCOP } from "@/lib/format";
import { ChipGroup } from "./ChipGroup";
import { OrderSuccess } from "./OrderSuccess";
import { PriceTag } from "./PriceTag";
import { QuantityInput } from "./QuantityInput";
import { useOrderForm, type OrderMode } from "./use-order-form";

const MODES: { value: OrderMode; label: string }[] = [
  { value: "cantidad", label: "Por cantidad" },
  { value: "valor", label: "Por valor ($)" },
];
const UNITS: { value: Unit; label: string }[] = [
  { value: "kg", label: "Kilogramos" },
  { value: "lb", label: "Libras" },
];
const CHEESES = (Object.keys(CHEESE_TYPE_LABELS) as CheeseType[]).map((value) => ({
  value,
  label: CHEESE_TYPE_LABELS[value],
}));
const SALTS = (["alto", "intermedio", "bajo"] as SaltLevel[]).map((value) => ({
  value,
  label: SALT_LEVEL_LABELS[value],
}));

export function OrderForm({ pricePerKg, updatedAt }: { pricePerKg: number; updatedAt: string | null }) {
  const f = useOrderForm(pricePerKg);

  if (f.status === "success") {
    const summary = f.byAmount ? `${formatCOP(f.total)} de queso` : `${f.quantity} ${f.unit}`;
    return <OrderSuccess clientName={f.clientName} summary={summary} onReset={f.reset} />;
  }

  return (
    <form onSubmit={f.submit} className="relative rounded-2xl border border-corteza bg-white p-6 shadow-sm">
      <PriceTag pricePerKg={pricePerKg} updatedAt={updatedAt} />

      {/* Campo trampa para robots: fuera de pantalla y fuera del orden de tabulación. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Sitio web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium text-tinta/80">Tu nombre</span>
        <input
          required
          minLength={2}
          maxLength={100}
          value={f.clientName}
          onChange={(e) => f.setClientName(e.target.value)}
          placeholder="Ej. María Pérez"
          className="w-full rounded-lg border border-corteza px-3 py-2 text-tinta outline-none focus:border-curado focus:ring-2 focus:ring-curado/30"
        />
      </label>

      <ChipGroup label="¿Cómo quieres pedir?" options={MODES} value={f.mode} onChange={f.setMode} />
      {!f.byAmount && <ChipGroup label="Unidad" options={UNITS} value={f.unit} onChange={f.setUnit} />}
      <ChipGroup
        label="Tipo de queso"
        options={CHEESES}
        value={f.cheeseType}
        onChange={f.setCheeseType}
        columns={3}
        chipClassName="px-2"
      />
      <ChipGroup
        label="Nivel de sal"
        options={SALTS}
        value={f.saltLevel}
        onChange={f.setSaltLevel}
        columns={3}
        chipClassName="px-2 text-xs sm:text-sm"
      />

      <QuantityInput
        byAmount={f.byAmount}
        unit={f.unit}
        quantity={f.quantity}
        amount={f.amount}
        amountValid={f.amountValid}
        equivalent={f.equivalent}
        onQuantity={f.setQuantity}
        onAmount={f.setAmount}
      />

      <div className="mb-5 flex items-center justify-between border-t border-dashed border-terracota/30 pt-4">
        <span className="text-sm font-medium text-tinta/70">Total estimado</span>
        <span className="font-mono text-xl font-bold text-tinta">{formatCOP(f.total)}</span>
      </div>

      {f.errorMsg && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{f.errorMsg}</p>}

      <button
        type="submit"
        disabled={f.status === "loading"}
        className="w-full rounded-lg bg-curado px-4 py-3 text-sm font-semibold text-cuajada transition-colors hover:bg-terracota disabled:opacity-60"
      >
        {f.status === "loading" ? "Enviando..." : "Enviar pedido"}
      </button>
    </form>
  );
}
