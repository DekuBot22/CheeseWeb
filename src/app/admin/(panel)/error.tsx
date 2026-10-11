"use client";

import { useEffect } from "react";
import { Button } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";

// Este Next usa `retry` (no `reset`) para volver a renderizar el segmento.
export default function PanelError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      title="No se pudo cargar esta pantalla"
      description="Puede ser un problema de conexión con la base de datos. Intenta de nuevo; si sigue fallando, revisa que las tablas de Supabase estén creadas."
      action={<Button onClick={() => retry()}>Reintentar</Button>}
    />
  );
}
