import type { ReactNode } from "react";
import { Card, CardBody } from "../Card";

// Marco común de las gráficas: título, leyenda, nota y tabla alternativa
// ("Ver datos") para quien no puede o no quiere leer la gráfica.
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
  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-lg/7 font-semibold text-tinta">{title}</h2>
            {subtitle && <p className="text-[0.8125rem] text-tinta-2">{subtitle}</p>}
          </div>
          {legend && legend.length > 1 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tinta-2">
              {legend.map((l) => (
                <li key={l.label} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
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
        </div>

        {children}

        {note && <p className="mt-2 text-xs text-tinta-3">{note}</p>}

        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-[0.8125rem] font-medium text-tinta-2 hover:text-tinta">
            Ver datos
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-[0.8125rem]">
              <thead>
                <tr>
                  {table.headers.map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`border-b border-linea px-2 py-1.5 text-xs font-semibold text-tinta-3 ${i === 0 ? "text-left" : "text-right"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-linea last:border-b-0">
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
        </details>
      </CardBody>
    </Card>
  );
}
