import { describe, expect, it } from "vitest";
import { bogotaDate } from "@/lib/bogota-time";
import {
  buildCalendar,
  currentWeek,
  lastWeeks,
  nextWeek,
  previousWeek,
  weekOf,
  weeksSince,
} from "./week-calendar";
import { shiftWeek, weekRange } from "./week";

// Bogotá es UTC-5 todo el año. 2026-10-03, 10 y 17 son sábados; el 11 es domingo y el 12 lunes.
const at = (isoLocal: string) => new Date(`${isoLocal}-05:00`);
const range = (w: { from: string; to: string }) => `${w.from}..${w.to}`;

describe("sin aperturas el calendario es idéntico a la regla de siempre (sábado a viernes)", () => {
  const cal = buildCalendar([], at("2026-10-14T10:00:00"));

  it("coincide con weekRange en cada día de 3 años, a varias horas (incluidas 23:30 y 00:00 de Bogotá)", () => {
    const first = Date.parse("2024-01-01T00:00:00-05:00");
    const hours = ["00:00:00.000", "05:30:00.000", "12:00:00.000", "19:30:00.000", "23:30:00.000", "23:59:59.999"];
    let checked = 0;
    for (let day = 0; day < 3 * 366; day++) {
      const date = bogotaDate(new Date(first + day * 86_400_000 + 12 * 3_600_000));
      for (const h of hours) {
        const instant = at(`${date}T${h}`);
        const old = weekRange(instant);
        const week = weekOf(cal, instant);
        expect(week.start.getTime()).toBe(old.start.getTime());
        expect(week.end.getTime()).toBe(old.end.getTime());
        expect(week.manual).toBe(false);
        expect(week.days).toBe(7);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(6000);
  });

  it("la semana actual y las anteriores son las de shiftWeek", () => {
    const now = at("2026-10-14T10:00:00");
    const current = currentWeek(cal);
    expect(current.start.getTime()).toBe(weekRange(now).start.getTime());
    const weeks = lastWeeks(cal, 4, current);
    for (let i = 0; i < 4; i++) {
      const expected = weekRange(shiftWeek(current.start.toISOString(), -(3 - i)));
      expect(weeks[i].start.getTime()).toBe(expected.start.getTime());
      expect(weeks[i].end.getTime()).toBe(expected.end.getTime());
    }
  });

  it("la semana de hoy puede terminar en el futuro (viernes), como siempre", () => {
    const w = currentWeek(cal);
    expect(range(w)).toBe("2026-10-10..2026-10-16");
  });
});

describe("con aperturas marcadas", () => {
  it("primera apertura un lunes: la semana de sábado anterior queda de 2 días", () => {
    const cal = buildCalendar(["2026-10-12"], at("2026-10-14T10:00:00"));
    const previous = weekOf(cal, at("2026-10-11T12:00:00"));
    expect(range(previous)).toBe("2026-10-10..2026-10-11");
    expect(previous.days).toBe(2);
    expect(previous.manual).toBe(false);
    const current = weekOf(cal, at("2026-10-12T00:00:00"));
    expect(current.from).toBe("2026-10-12");
    expect(current.manual).toBe(true);
  });

  it("el lote que llega el domingo: las ventas del sábado quedan en la semana anterior", () => {
    const cal = buildCalendar(["2026-10-04"], at("2026-10-08T10:00:00"));
    expect(weekOf(cal, at("2026-10-03T22:00:00")).to).toBe("2026-10-03");
    expect(weekOf(cal, at("2026-10-04T00:00:00")).from).toBe("2026-10-04");
  });

  it("entre dos aperturas la semana dura hasta el día antes de la siguiente (9 días)", () => {
    const cal = buildCalendar(["2026-10-03", "2026-10-12"], at("2026-10-14T10:00:00"));
    const w = weekOf(cal, at("2026-10-07T10:00:00"));
    expect(range(w)).toBe("2026-10-03..2026-10-11");
    expect(w.days).toBe(9);
    expect(w.end.toISOString()).toBe("2026-10-12T04:59:59.999Z");
  });

  it("si se olvida abrir, la semana en curso se alarga (14 días)", () => {
    const cal = buildCalendar(["2026-10-03"], at("2026-10-16T10:00:00"));
    const w = currentWeek(cal);
    expect(range(w)).toBe("2026-10-03..2026-10-16");
    expect(w.days).toBe(14);
    expect(w.end.getTime()).toBeGreaterThanOrEqual(at("2026-10-16T23:59:59.999").getTime());
  });

  it("la semana en curso dura al menos 7 días aunque lleve pocos", () => {
    const cal = buildCalendar(["2026-10-12"], at("2026-10-13T10:00:00"));
    const w = currentWeek(cal);
    expect(range(w)).toBe("2026-10-12..2026-10-18");
    expect(w.days).toBe(7);
  });

  it("ignora duplicadas y aperturas futuras", () => {
    const cal = buildCalendar(["2026-10-12", "2026-10-12", "2026-10-30"], at("2026-10-14T10:00:00"));
    expect(cal.openings).toEqual(["2026-10-12"]);
    expect(currentWeek(cal).from).toBe("2026-10-12");
  });

  it("cada día pertenece a una sola semana: sin huecos ni traslapes (compras del día de apertura cuentan una vez)", () => {
    const cal = buildCalendar(["2026-09-27", "2026-10-06", "2026-10-12"], at("2026-10-20T10:00:00"));
    const weeks = lastWeeks(cal, 8, currentWeek(cal));
    for (let d = new Date("2026-09-01T12:00:00-05:00"); bogotaDate(d) <= "2026-10-20"; d = new Date(d.getTime() + 86_400_000)) {
      const date = bogotaDate(d);
      const matches = weeks.filter((w) => date >= w.from && date <= w.to);
      expect(matches.length, date).toBeLessThanOrEqual(1);
      if (date >= weeks[0].from) expect(matches.length, date).toBe(1);
    }
    // contiguas: cada semana empieza justo cuando termina la anterior
    for (let i = 1; i < weeks.length; i++) {
      expect(weeks[i].start.getTime()).toBe(weeks[i - 1].end.getTime() + 1);
    }
  });

  it("previousWeek y nextWeek son inversas; la de hoy no tiene siguiente", () => {
    const cal = buildCalendar(["2026-10-04", "2026-10-12"], at("2026-10-14T10:00:00"));
    const current = currentWeek(cal);
    expect(nextWeek(cal, current)).toBeNull();
    const prev = previousWeek(cal, current);
    expect(range(prev)).toBe("2026-10-04..2026-10-11");
    expect(nextWeek(cal, prev)?.from).toBe(current.from);
    // hacia atrás sigue con la regla del sábado, recortada por la primera apertura
    const before = previousWeek(cal, prev);
    expect(range(before)).toBe("2026-10-03..2026-10-03");
    expect(range(previousWeek(cal, before))).toBe("2026-09-26..2026-10-02");
  });

  it("weeksSince llega hasta la semana del primer movimiento", () => {
    const cal = buildCalendar([], at("2026-10-14T10:00:00"));
    const weeks = weeksSince(cal, at("2026-09-20T10:00:00"), currentWeek(cal), 260);
    expect(weeks[0].from).toBe("2026-09-19");
    expect(weeks).toHaveLength(4);
    expect(weeksSince(cal, at("2020-01-01T10:00:00"), currentWeek(cal), 10)).toHaveLength(10);
  });
});
