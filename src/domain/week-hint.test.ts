import { describe, expect, it } from "vitest";
import { buildCalendar, currentWeek } from "./week-calendar";
import { canOpenOn, openWeekHint, shortenedPreviousWeek, suggestOpenOnPurchase, weekElapsed } from "./week-hint";

const at = (isoLocal: string) => new Date(`${isoLocal}-05:00`);
const weekAt = (openings: string[], now: string) => currentWeek(buildCalendar(openings, at(now)));

describe("weekElapsed", () => {
  it("cuenta el día de apertura como el primero", () => {
    const week = weekAt(["2026-10-12"], "2026-10-14T10:00:00");
    expect(weekElapsed(week, "2026-10-12")).toBe(1);
    expect(weekElapsed(week, "2026-10-14")).toBe(3);
  });
});

describe("openWeekHint", () => {
  it("avisa cuando hoy llegó la primera compra de la semana y la semana no empezó hoy", () => {
    const week = weekAt([], "2026-10-11T10:00:00"); // domingo, semana automática del sábado 10
    expect(openWeekHint(week, "2026-10-11", ["2026-10-11"])).toBe("compra");
  });

  it("no avisa si la semana ya empezó hoy ni si ya hubo otra compra esta semana", () => {
    const sat = weekAt([], "2026-10-10T10:00:00");
    expect(openWeekHint(sat, "2026-10-10", ["2026-10-10"])).toBeNull();
    const week = weekAt([], "2026-10-13T10:00:00");
    expect(openWeekHint(week, "2026-10-13", ["2026-10-10", "2026-10-13"])).toBeNull();
  });

  it("avisa con una semana abierta a mano de 6 días o más", () => {
    expect(openWeekHint(weekAt(["2026-10-12"], "2026-10-16T10:00:00"), "2026-10-16", [])).toBeNull();
    expect(openWeekHint(weekAt(["2026-10-12"], "2026-10-17T10:00:00"), "2026-10-17", [])).toBe("largo");
  });

  it("en semanas automáticas no insiste cada semana", () => {
    expect(openWeekHint(weekAt([], "2026-10-15T10:00:00"), "2026-10-15", [])).toBeNull();
  });
});

describe("shortenedPreviousWeek", () => {
  it("avisa cuántos días le quedan a la semana anterior si la apertura cae a mitad de semana", () => {
    // 2026-10-12 es lunes: la semana del sábado 10 queda con sábado y domingo.
    expect(shortenedPreviousWeek("2026-10-12", "2026-10-14")).toBe(2);
  });

  it("no avisa si la apertura cae en sábado", () => {
    expect(shortenedPreviousWeek("2026-10-10", "2026-10-14")).toBeNull();
  });
});

describe("compra que abre semana", () => {
  const week = { today: "2026-10-16", from: "2026-10-12", lastOpening: "2026-10-12" };

  it("solo se puede abrir después de la última apertura y no en el futuro", () => {
    expect(canOpenOn(week, "2026-10-16")).toBe(true);
    expect(canOpenOn(week, "2026-10-13")).toBe(true);
    expect(canOpenOn(week, "2026-10-12")).toBe(false);
    expect(canOpenOn(week, "2026-10-17")).toBe(false);
    expect(canOpenOn({ ...week, lastOpening: null }, "2026-10-01")).toBe(true);
  });

  it("sugiere la casilla cuando la semana lleva 5 días o más", () => {
    expect(suggestOpenOnPurchase(week)).toBe(true); // 12 → 16 = 5 días
    expect(suggestOpenOnPurchase({ ...week, today: "2026-10-15" })).toBe(false);
  });
});
