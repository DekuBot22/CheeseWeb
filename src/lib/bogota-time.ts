// Hora de Colombia (America/Bogota): UTC-5 todo el año, sin horario de verano.
// El negocio se mide siempre en esta hora, no en la del servidor (en Vercel
// corre en UTC) ni en la del navegador.

export const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

// "Reloj de pared" de Bogotá: un Date cuyos getters UTC devuelven la hora local de Bogotá.
export function toBogotaWall(date: Date): Date {
  return new Date(date.getTime() + BOGOTA_OFFSET_MS);
}

// Fecha (AAAA-MM-DD) tal como se ve en Bogotá en ese instante. Sirve para
// comparar contra columnas `date` de la base (purchase_date, payment_date).
export function bogotaDate(date: Date = new Date()): string {
  return toBogotaWall(date).toISOString().slice(0, 10);
}
