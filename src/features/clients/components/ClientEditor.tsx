"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/Button";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { Field, Input, Textarea } from "@/ui/Field";
import type { Client } from "@/domain/client";

export function ClientEditor({ client }: { client: Client }) {
  const router = useRouter();
  const uid = useId();
  const [phone, setPhone] = useState(client.phone ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, notes }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card>
      <CardHeader title="Datos de contacto" subtitle="Solo los ves tú." />
      <CardBody>
        <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
          <Field label="Teléfono" htmlFor={`${uid}-tel`}>
            <Input
              id={`${uid}-tel`}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 3001234567"
            />
          </Field>
          <Field label="Notas" htmlFor={`${uid}-notas`}>
            <Textarea
              id={`${uid}-notas`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej. prefiere entrega los sábados"
            />
          </Field>
          <div className="flex items-center gap-3" aria-live="polite">
            <Button type="submit" loading={status === "loading"}>
              Guardar
            </Button>
            {status === "saved" && <span className="text-sm font-medium text-cobrado">✓ Guardado</span>}
            {status === "error" && <span className="text-sm font-medium text-debe">Error al guardar</span>}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
