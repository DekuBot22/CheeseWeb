// Guarda una semana con "desde / hasta" (crear sin id, editar con id). Devuelve el mensaje de error o "" si salió bien.
export async function postWeekRange(body: {
  from: string;
  until: string | null;
  id?: string;
  note?: string;
}): Promise<string> {
  try {
    const res = await fetch("/api/admin/week-openings/range", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return res.ok ? "" : (data.error ?? "No se pudo guardar la semana");
  } catch {
    return "No se pudo conectar. Intenta de nuevo.";
  }
}
