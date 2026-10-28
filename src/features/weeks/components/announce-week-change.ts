import type { OpeningRef } from "@/domain/week-range";
import { avisar } from "@/ui/toast-store";

// Pide al servidor volver a las fechas de apertura de antes; devuelve el mensaje de error o "" si salió bien.
async function postRestore(dates: string[]): Promise<string> {
  try {
    const res = await fetch("/api/admin/week-openings/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates }),
    });
    const data = await res.json();
    return res.ok ? "" : (data.error ?? "No se pudo deshacer");
  } catch {
    return "No se pudo conectar. Intenta de nuevo.";
  }
}

// Aviso de "Semana guardada / Apertura anulada" con el botón «Deshacer» durante unos segundos.
// `before` son las aperturas que había ANTES del cambio: deshacer vuelve exactamente a esas fechas.
export function announceWeekChange(text: string, before: readonly OpeningRef[], refresh: () => void) {
  avisar(text, {
    accion: {
      etiqueta: "Deshacer",
      alHacer: async () => {
        const message = await postRestore(before.map((o) => o.date));
        avisar(message || "Cambio deshecho");
        refresh();
      },
    },
  });
}
