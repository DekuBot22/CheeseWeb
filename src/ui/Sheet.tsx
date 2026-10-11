"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconClose } from "./icons";

// Panel modal sobre <dialog> nativo: atrapa el foco y cierra con Esc sin
// código extra. Hoja inferior en móvil, panel lateral en escritorio.
// La animación vive en la clase `.hoja` (globals.css): entrada/salida con CSS puro.
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Mientras está abierta sigue a `children`; al cerrar se queda con el último contenido.
  // Así la salida (180 ms) no baja vacía ni muestra el estado de "sin datos" que el padre
  // pone al cerrar (p. ej. orders=[]). Se vuelve a montar con otra `key` en cada apertura
  // para que el formulario empiece limpio.
  const [shown, setShown] = useState<ReactNode>(null);
  const [wasOpen, setWasOpen] = useState(false);
  const [session, setSession] = useState(0);
  if (open && shown !== children) setShown(children);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((n) => n + 1);
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className="hoja m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-lg border-t border-linea bg-hoja-3 p-0 text-tinta shadow-flota md:ml-auto md:mt-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-t-0"
    >
      <div className="flex items-center justify-between border-b border-linea px-5 py-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="presionable flex h-11 w-11 items-center justify-center rounded-md text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
        >
          <IconClose />
        </button>
      </div>
      <div key={session} className="p-5">
        {shown}
      </div>
    </dialog>
  );
}
