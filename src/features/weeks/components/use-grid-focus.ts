"use client";

import { useEffect, useRef, useState } from "react";
import { addDays } from "@/domain/week-calendar";
import { monthOf, rowStart, shiftMonth } from "@/domain/week-month";

// A qué fecha lleva cada tecla del patrón WAI-ARIA de cuadrícula de fechas.
function targetOf(key: string, date: string): string | null {
  switch (key) {
    case "ArrowLeft":
      return addDays(date, -1);
    case "ArrowRight":
      return addDays(date, 1);
    case "ArrowUp":
      return addDays(date, -7);
    case "ArrowDown":
      return addDays(date, 7);
    case "Home":
      return rowStart(date);
    case "End":
      return addDays(rowStart(date), 6);
    case "PageUp":
      return shiftMonth(date, -1);
    case "PageDown":
      return shiftMonth(date, 1);
    default:
      return null;
  }
}

// Foco itinerante: un solo día de la cuadrícula está en el orden de tabulación y las flechas lo mueven
// (cambiando de mes si hace falta). Los días futuros están desactivados, así que el foco se detiene en hoy.
export function useGridFocus(gridId: string, today: string, month: string, setMonth: (month: string) => void) {
  const [focusDate, setFocusDate] = useState(today);
  const pending = useRef(false);

  const tabDate = monthOf(focusDate) === month ? focusDate : `${month}-01`;

  function onKeyDown(e: React.KeyboardEvent) {
    const date = (e.target as HTMLElement).dataset.date;
    const next = date ? targetOf(e.key, date) : null;
    if (!date || !next) return;
    e.preventDefault();
    const clamped = next > today ? today : next;
    if (clamped === date) return;
    pending.current = true;
    setFocusDate(clamped);
    setMonth(monthOf(clamped));
  }

  function onFocus(e: React.FocusEvent) {
    const date = (e.target as HTMLElement).dataset.date;
    if (date) setFocusDate(date);
  }

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    document.getElementById(gridId)?.querySelector<HTMLElement>(`[data-date="${focusDate}"]`)?.focus();
  }, [gridId, focusDate, month]);

  return { tabDate, onKeyDown, onFocus };
}
