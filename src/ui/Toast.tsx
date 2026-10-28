"use client";

import { useSyncExternalStore } from "react";
import { descartarAviso, getAvisoServerSnapshot, getAvisoSnapshot, subscribeAviso } from "./toast-store";

// Una sola instancia, montada en el layout del panel. La región con role="status" existe
// siempre (así los lectores de pantalla anuncian el texto que entra); el aviso en sí se
// anima con la clase .aviso. Va encima de la barra inferior en móvil y abajo a la derecha
// en escritorio. Se descarta solo (~2,5 s); si trae una acción ("Deshacer") dura más y lleva un botón.
export function Toast() {
  const aviso = useSyncExternalStore(subscribeAviso, getAvisoSnapshot, getAvisoServerSnapshot);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:bottom-6 md:justify-end md:px-8"
    >
      {aviso && (
        <p
          key={aviso.id}
          data-saliendo={aviso.saliendo ? "" : undefined}
          className="aviso flex items-center rounded-md border border-linea bg-hoja-3 px-4 py-2.5 text-sm/5 font-medium text-tinta shadow-flota"
        >
          <span aria-hidden="true" className="mr-2 text-cobrado">
            ✓
          </span>
          {aviso.texto}
          {aviso.accion && (
            <button
              type="button"
              onClick={() => {
                aviso.accion?.alHacer();
                descartarAviso();
              }}
              className="presionable pointer-events-auto -my-2 -mr-3 ml-3 min-h-11 rounded-sm px-3 text-sm font-semibold text-acento underline-offset-2 hover:underline"
            >
              {aviso.accion.etiqueta}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
