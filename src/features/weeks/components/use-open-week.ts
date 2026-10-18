"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { avisar } from "@/ui/toast-store";

// Abre una semana nueva en la fecha dada (POST /api/admin/week-openings).
export function useOpenWeek(onDone?: () => void) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openWeek(startDate: string, note?: string): Promise<boolean> {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/week-openings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_date: startDate, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo abrir la semana");
        return false;
      }
      avisar("Semana nueva abierta");
      onDone?.();
      router.refresh();
      return true;
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { openWeek, loading, error };
}
