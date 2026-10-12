"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { avisar } from "@/ui/toast-store";

// Respaldo bajo demanda. El automático corre solo cada noche (cron de Vercel).
export function BackupCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el respaldo");
        return;
      }
      avisar("Respaldo enviado a Telegram");
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Respaldo"
        subtitle="Cada noche se envía a tu Telegram una copia completa (JSON) y el Excel de todo el tiempo."
      />
      <CardBody>
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-tinta-2">
            Guarda esos archivos: si algún día se pierde la base de datos, con ellos se recupera todo.
          </p>
          <Button onClick={send} loading={loading}>
            Enviar respaldo ahora
          </Button>
          {error && (
            <p role="alert" className="aparece text-[0.8125rem] font-medium text-debe">
              {error}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
