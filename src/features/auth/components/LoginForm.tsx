"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/Button";
import { Card, CardBody } from "@/ui/Card";
import { Field, Input } from "@/ui/Field";

export function LoginForm() {
  const router = useRouter();
  const uid = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Contraseña incorrecta");
        setLoading(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Contraseña" htmlFor={`${uid}-pass`} error={error}>
            <Input
              id={`${uid}-pass`}
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${uid}-pass-desc` : undefined}
            />
          </Field>
          <Button type="submit" loading={loading}>
            Ingresar
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
