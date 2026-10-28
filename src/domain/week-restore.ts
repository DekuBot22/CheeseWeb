// Deshacer un cambio de semanas: volver a las fechas de apertura que había antes.
// Se compara por FECHA (no por id): mover o editar una semana anula la apertura vieja y crea otra con id nuevo.

export interface RestorePlan {
  // Aperturas vigentes que sobran (no estaban antes): se anulan.
  void: string[];
  // Fechas que había antes y ya no están: se vuelven a abrir.
  add: string[];
}

export function restorePlan(active: { id: string; date: string }[], target: readonly string[]): RestorePlan {
  const wanted = new Set(target);
  const has = new Set(active.map((o) => o.date));
  return {
    void: active.filter((o) => !wanted.has(o.date)).map((o) => o.id),
    add: [...wanted].filter((d) => !has.has(d)).sort(),
  };
}
