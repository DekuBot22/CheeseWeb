"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { Field, Input } from "./Field";

// Formulario de confirmación con motivo obligatorio (anular algo). No sabe de
// negocio: quien lo usa pone las sugerencias, el texto del botón y la acción.
export function ReasonForm({
  suggestions,
  confirmLabel,
  loading,
  error,
  onSubmit,
  onCancel,
  children,
}: {
  suggestions: readonly string[];
  confirmLabel: string;
  loading: boolean;
  error: string;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const uid = useId();
  const [reason, setReason] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(reason.trim());
      }}
      className="flex flex-col gap-4"
    >
      {children}

      <Field label="Motivo" htmlFor={`${uid}-motivo`} error={error} hint="Queda guardado para poder revisarlo después.">
        <Input
          id={`${uid}-motivo`}
          type="text"
          maxLength={300}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${uid}-motivo-desc`}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setReason(s)}
            className="presionable rounded-full border border-linea px-3 py-1 text-xs text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Volver
        </Button>
        <Button type="submit" size="sm" variant="danger" loading={loading} className="flex-1">
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
}
