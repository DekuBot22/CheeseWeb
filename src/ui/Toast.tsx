"use client";

import { useSyncExternalStore } from "react";
import { getAvisoServerSnapshot, getAvisoSnapshot, subscribeAviso } from "./toast-store";

// Una sola instancia, montada en el layout del panel. La región con role="status" existe
// siempre (así los lectores de pantalla anuncian el texto que entra); el aviso en sí se
// anima con la clase .aviso. Va encima de la barra inferior en móvil y abajo a la derecha
// en escritorio. Sin botones dentro: se descarta solo a los ~2,5 s.
export function Toast() {
  const aviso = useSyncExternalStore(subscribeAviso, getAvisoSnapshot, getAvisoServerSnapshot);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 lg:bottom-6 lg:justify-end lg:px-8"
    >
      {aviso && (
        <p
          key={aviso.id}
          data-saliendo={aviso.saliendo ? "" : undefined}
          className="aviso rounded-md border border-linea bg-hoja-3 px-4 py-2.5 text-sm font-medium text-tinta shadow-flota"
        >
          <span aria-hidden="true" className="mr-2 text-cobrado">
            ✓
          </span>
          {aviso.texto}
        </p>
      )}
    </div>
  );
}
