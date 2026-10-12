"use client";

import { useSyncExternalStore } from "react";
import type { Unit } from "@/domain/units";

// Unidad con la que el dueño prefiere ver los pesos (libra por defecto: así piensa).
// Se recuerda en el navegador; si no se puede guardar (modo privado), vale mientras
// la página siga abierta. Store de módulo leído con useSyncExternalStore, como
// ui/toast-store.ts: sin error de hidratación ni setState dentro de un efecto.
const KEY = "cuaderno:unidad-peso";
const DEFAULT_UNIT: Unit = "lb";

let memory: Unit | null = null;
const listeners = new Set<() => void>();

function read(): Unit {
  if (memory) return memory;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "kg" || stored === "lb") return stored;
  } catch {
    // Almacenamiento bloqueado: se usa la unidad por defecto.
  }
  return DEFAULT_UNIT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function choose(unit: Unit) {
  memory = unit;
  try {
    localStorage.setItem(KEY, unit);
  } catch {
    // Sin almacenamiento: se queda solo en memoria.
  }
  listeners.forEach((listener) => listener());
}

export function useWeightUnit(): [Unit, (unit: Unit) => void] {
  const unit = useSyncExternalStore(subscribe, read, () => DEFAULT_UNIT);
  return [unit, choose];
}
