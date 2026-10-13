import type { Unit } from "@/domain/units";

const INPUT =
  "w-full rounded-lg border border-corteza px-3 py-2 text-tinta outline-none focus:border-curado focus:ring-2 focus:ring-curado/30";
const LABEL = "mb-1 block text-sm font-medium text-tinta/80";

// Campo de cantidad (en kg o lb) o de valor en pesos, según cómo pida el cliente.
export function QuantityInput(props: {
  byAmount: boolean;
  unit: Unit;
  quantity: string;
  amount: string;
  amountValid: boolean;
  equivalent: { kg: number; lb: number };
  onQuantity: (value: string) => void;
  onAmount: (value: string) => void;
}) {
  if (props.byAmount) {
    return (
      <label className="mb-5 block">
        <span className={LABEL}>¿Cuántos pesos de queso quieres?</span>
        <input
          required
          type="number"
          inputMode="numeric"
          step="500"
          min="1000"
          max="5000000"
          value={props.amount}
          onChange={(e) => props.onAmount(e.target.value)}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder="Ej. 15000"
          className={INPUT}
        />
        {props.amountValid && (
          <span className="mt-1 block text-xs text-tinta/60">
            Aproximadamente {props.equivalent.lb.toFixed(2)} lb ({props.equivalent.kg.toFixed(2)} kg)
          </span>
        )}
      </label>
    );
  }

  return (
    <label className="mb-5 block">
      <span className={LABEL}>Cantidad ({props.unit})</span>
      <input
        required
        type="number"
        step="0.01"
        min="0.01"
        max="1000"
        value={props.quantity}
        onChange={(e) => props.onQuantity(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        placeholder="Ej. 2"
        className={INPUT}
      />
    </label>
  );
}
