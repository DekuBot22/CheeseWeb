"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconClose } from "./icons";

// Panel modal sobre <dialog> nativo: atrapa el foco y cierra con Esc sin
// código extra. Hoja inferior en móvil, panel lateral en escritorio.
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
      className="m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-lg border-t border-linea bg-hoja-3 md:border-l md:border-t-0 p-0 text-tinta shadow-flota backdrop:bg-black/70 backdrop:backdrop-blur-[2px] md:ml-auto md:mt-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none"
    >
      <div className="flex items-center justify-between border-b border-linea px-5 py-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-11 w-11 items-center justify-center rounded-md text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
        >
          <IconClose />
        </button>
      </div>
      <div className="p-5">{open && children}</div>
    </dialog>
  );
}
