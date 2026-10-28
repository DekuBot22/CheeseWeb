"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { swipeOf } from "@/lib/swipe";
import { startsInSwipeBlocker } from "./swipe-blocker";
import { useWeekScope } from "./WeekScopeProvider";

// En el celular, en Inicio: deslizar el dedo hacia la derecha va a la semana anterior y hacia la izquierda a la siguiente.
// El botón del selector sigue ahí. Se ignora si el gesto empieza en un campo, una tabla con scroll horizontal o una ventana.
export function WeekSwipe({ children }: { children: ReactNode }) {
  const { scope, weeks, hrefFor } = useWeekScope();
  const router = useRouter();
  const enabled = usePathname() === "/admin";
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    const blocked = e.touches.length !== 1 || startsInSwipeBlocker(e.target);
    start.current = blocked || !touch ? null : { x: touch.clientX, y: touch.clientY, t: e.timeStamp };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const from = start.current;
    start.current = null;
    const touch = e.changedTouches[0];
    if (!enabled || !from || !touch) return;

    const direction = swipeOf({ dx: touch.clientX - from.x, dy: touch.clientY - from.y, ms: e.timeStamp - from.t });
    if (!direction) return;

    // `weeks` va de la más nueva a la más vieja: la anterior está un lugar más adelante.
    const i = weeks.findIndex((w) => w.from === scope.week.from);
    const target = direction === "right" ? weeks[i + 1] : i > 0 ? weeks[i - 1] : undefined;
    if (i < 0 || !target) return;
    router.push(hrefFor(weeks.indexOf(target) === 0 ? null : target), { scroll: false });
  }

  return (
    <div
      className={enabled ? "min-h-[60dvh]" : undefined}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => (start.current = null)}
    >
      {children}
    </div>
  );
}
