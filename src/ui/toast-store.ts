// Aviso de confirmación tras guardar (A2). Store de módulo leído con useSyncExternalStore,
// igual que features/pwa/install-prompt-store.ts: no hace falta provider ni contexto.
// Solo hay un aviso a la vez: uno nuevo reemplaza al anterior.
// ui/ no sabe de negocio: quien llama pone el texto ("Abono registrado").

// Botón opcional dentro del aviso (p. ej. "Deshacer"). ui/ no sabe de negocio: quien llama pone qué hace.
export interface AvisoAccion {
  etiqueta: string;
  alHacer: () => void;
}

export interface Aviso {
  id: number;
  texto: string;
  saliendo: boolean;
  accion?: AvisoAccion;
}

export interface AvisoOpciones {
  accion?: AvisoAccion;
  // Cuánto se queda visible; con una acción conviene más tiempo para alcanzar a pulsarla.
  duracion?: number;
}

export const AVISO_CON_ACCION_MS = 8000;

export const AVISO_VISIBLE_MS = 2400;
export const AVISO_SALIDA_MS = 150;

let actual: Aviso | null = null;
let secuencia = 0;
let timerSalida: ReturnType<typeof setTimeout> | undefined;
let timerQuitar: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function limpiarTimers() {
  clearTimeout(timerSalida);
  clearTimeout(timerQuitar);
}

// Empieza la salida (data-saliendo) y desmonta el aviso cuando termina su transición CSS.
// Se usa un timeout y no `transitionend` para que funcione igual con movimiento reducido.
function empezarSalida() {
  if (!actual) return;
  actual = { ...actual, saliendo: true };
  emit();
  timerQuitar = setTimeout(descartarAviso, AVISO_SALIDA_MS);
}

export function avisar(texto: string, { accion, duracion }: AvisoOpciones = {}) {
  limpiarTimers();
  actual = { id: ++secuencia, texto, saliendo: false, accion };
  emit();
  timerSalida = setTimeout(empezarSalida, duracion ?? (accion ? AVISO_CON_ACCION_MS : AVISO_VISIBLE_MS));
}

export function descartarAviso() {
  limpiarTimers();
  actual = null;
  emit();
}

export function subscribeAviso(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getAvisoSnapshot = () => actual;
export const getAvisoServerSnapshot = () => null;
