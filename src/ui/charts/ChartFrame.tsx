"use client";

import { useId, useState, type ReactNode } from "react";
import { Card, CardBody } from "../Card";

// Marco común de las gráficas: título, leyenda, nota y tabla alternativa
// ("Ver datos", arriba a la derecha) para quien no puede o no quiere leer la gráfica.
export function ChartFrame({
  title,
  subtitle,
  legend,
  note,
  table,
  children,
}: {
  title: string;
  subtitle?: string;
  legend?: { label: string; color: string; hatched?: boolean }[];
  note?: string;
  table: { headers: string[]; rows: string[][] };
  children: ReactNode;
}) {
  const [showData, setShowData] = useState(false);
  const tableId = useId();

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[0.9375rem]/[1.375rem] font-semibold text-tinta">{title}</h2>
            {subtitle && <p className="text-[0.8125rem]/[1.125rem] text-tinta-2">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-expanded={showData}
            aria-controls={tableId}
            onClick={() => setShowData((v) => !v)}
            className="presionable shrink-0 text-[0.8125rem]/[1.125rem] font-semibold text-acento hover:underline"
          >
            {showData ? "Ocultar datos" : "Ver datos"}
          </button>
        </div>

        {legend && legend.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem]/[1.125rem] text-tinta-2">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-[2px]"
                  style={{
                    // Rayado = dato estimado (mismo patrón que las barras).
                    background: l.hatched
                      ? `repeating-linear-gradient(45deg, ${l.color} 0 2px, transparent 2px 4px)`
                      : l.color,
                  }}
                  aria-hidden="true"
                />
                {l.label}
              </li>
            ))}
          </ul>
        )}

        <div>{children}</div>

        {note && <p className="text-xs/4 text-tinta-3">{note}</p>}

        <div id={tableId} hidden={!showData} className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.8125rem]">
            <thead>
              <tr>
                {table.headers.map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`border-b border-linea px-2 py-1.5 text-xs font-medium text-tinta-3 ${i === 0 ? "text-left" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r) => (
                <tr key={r[0]} className="border-b border-linea-suave last:border-b-0">
                  {r.map((c, i) => (
                    <td key={i} className={`px-2 py-1.5 ${i === 0 ? "text-left" : "num text-right"}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
