"use client";

import { useLinkStatus } from "next/link";

// Barrita de "cargando" que va DENTRO de un <Link> (que debe ser `relative`). Los filtros y
// las pestañas cambian la URL pero la pantalla vieja se queda quieta hasta que responde el
// servidor; esto avisa que el toque se registró. El retraso de 120 ms vive en CSS
// (.link-pendiente): con red rápida nunca llega a verse.
export function LinkPending() {
  const { pending } = useLinkStatus();
  return <span aria-hidden="true" className="link-pendiente" data-pending={pending ? "" : undefined} />;
}
