"use client";

import { useId } from "react";
import { normalizeClientName } from "@/domain/client";
import { Field, Input } from "@/ui/Field";

const MAX_SUGGESTIONS = 6;

// Nombre del cliente con sugerencias de los que ya existen: elegir uno evita crear
// duplicados ("Rosa" y "rosa " son el mismo cliente, pero "Rosita" no).
export function ClientPicker({
  value,
  names,
  onChange,
}: {
  value: string;
  names: string[];
  onChange: (name: string) => void;
}) {
  const uid = useId();
  const { key } = normalizeClientName(value);
  const exact = names.some((n) => normalizeClientName(n).key === key);
  const matches = key
    ? names.filter((n) => normalizeClientName(n).key.includes(key) && normalizeClientName(n).key !== key).slice(0, MAX_SUGGESTIONS)
    : [];

  return (
    <div className="flex flex-col gap-2">
      <Field label="Cliente" htmlFor={`${uid}-cliente`}>
        <Input
          id={`${uid}-cliente`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          maxLength={100}
          placeholder="Nombre del cliente"
        />
      </Field>
      {matches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {matches.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="presionable rounded-full border border-linea px-3 py-1 text-xs text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
            >
              {n}
            </button>
          ))}
        </div>
      )}
      {key && (
        <p className="text-[0.8125rem] text-tinta-2">
          {exact ? "Cliente existente." : `Cliente nuevo: se creará «${value.trim()}».`}
        </p>
      )}
    </div>
  );
}
