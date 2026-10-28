// Decide si un gesto de dedo es un "deslizar" horizontal claro. Puro (sin DOM) para poder probarlo.

export interface Gesture {
  dx: number;
  dy: number;
  ms: number;
}

// Cuánto hay que recorrer en horizontal, qué tan horizontal debe ser frente a lo vertical y cuánto puede tardar.
export const SWIPE_MIN_PX = 72;
export const SWIPE_MAX_MS = 700;
export const SWIPE_RATIO = 2;

// "left" = el dedo fue hacia la izquierda; "right" = hacia la derecha; null = no cuenta (scroll, toque lento o corto).
export function swipeOf({ dx, dy, ms }: Gesture): "left" | "right" | null {
  if (ms > SWIPE_MAX_MS) return null;
  if (Math.abs(dx) < SWIPE_MIN_PX) return null;
  if (Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return null;
  return dx < 0 ? "left" : "right";
}
