export type Platform = "ios" | "android" | "other";

// Detecta el sistema para mostrar las instrucciones de instalación correctas.
// Función pura (recibe el user-agent y los puntos táctiles) para poder probarla.
// Un iPad con iPadOS se presenta como Mac, pero tiene pantalla táctil.
export function detectPlatform(userAgent: string, maxTouchPoints: number): Platform {
  if (/iPhone|iPad|iPod/.test(userAgent)) return "ios";
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return "other";
}
