"use client";

import { SEGMENT_GROUP, segmentClasses } from "./SegmentedControl";

// Selector con botones para cambios que viven en el navegador (p. ej. libras/kilos).
export function SegmentedButtons<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className={SEGMENT_GROUP}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={segmentClasses(value === o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
