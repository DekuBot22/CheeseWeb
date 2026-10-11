import { describe, expect, it } from "vitest";
import { bogotaDate } from "@/lib/bogota-time";
import { parseWeekParam, shiftWeek, weekDateRange, weekRange } from "./week";

// 2026-10-03 y 2026-10-10 son sábados. Bogotá es UTC-5 todo el año.
const iso = (d: Date) => d.toISOString();

describe("weekRange (sábado a viernes, hora de Bogotá)", () => {
  it("viernes 11 p. m. en Bogotá sigue en la semana que empezó el sábado 3", () => {
    const { start, end } = weekRange(new Date("2026-10-10T04:00:00Z"));
    expect(iso(start)).toBe("2026-10-03T05:00:00.000Z");
    expect(iso(end)).toBe("2026-10-10T04:59:59.999Z");
  });

  it("sábado 00:30 en Bogotá ya es la semana nueva", () => {
    const { start } = weekRange(new Date("2026-10-10T05:30:00Z"));
    expect(iso(start)).toBe("2026-10-10T05:00:00.000Z");
  });

  it("viernes 7:30 p. m. en Bogotá (ya sábado en UTC) sigue en la semana del 3", () => {
    const { start } = weekRange(new Date("2026-10-10T00:30:00Z"));
    expect(iso(start)).toBe("2026-10-03T05:00:00.000Z");
  });

  it("frontera exacta: 00:00:00.000 del sábado es semana nueva, 23:59:59.999 del viernes es la anterior", () => {
    expect(iso(weekRange(new Date("2026-10-10T05:00:00.000Z")).start)).toBe("2026-10-10T05:00:00.000Z");
    expect(iso(weekRange(new Date("2026-10-10T04:59:59.999Z")).start)).toBe("2026-10-03T05:00:00.000Z");
  });

  it("el inicio y el fin de una semana pertenecen a esa misma semana", () => {
    const { start, end } = weekRange(new Date("2026-10-07T15:00:00Z"));
    expect(weekRange(start).start.getTime()).toBe(start.getTime());
    expect(weekRange(end).start.getTime()).toBe(start.getTime());
  });
});

describe("weekDateRange", () => {
  it("la semana del 10 va del sábado 10 al viernes 16 (ambos incluidos)", () => {
    const { start, end } = weekRange(new Date("2026-10-12T15:00:00Z"));
    expect(weekDateRange(start, end)).toEqual({ from: "2026-10-10", to: "2026-10-16" });
  });

  it("una compra del sábado siguiente (17) queda fuera de esa semana", () => {
    const { start, end } = weekRange(new Date("2026-10-12T15:00:00Z"));
    const { from, to } = weekDateRange(start, end);
    const inWeek = (d: string) => d >= from && d <= to;
    expect(inWeek("2026-10-16")).toBe(true);
    expect(inWeek("2026-10-17")).toBe(false);
  });
});

describe("bogotaDate", () => {
  it("devuelve la fecha vista en Bogotá, no la de UTC ni la del servidor", () => {
    expect(bogotaDate(new Date("2026-10-11T03:00:00Z"))).toBe("2026-10-10");
    expect(bogotaDate(new Date("2026-10-11T05:00:00Z"))).toBe("2026-10-11");
  });
});

describe("shiftWeek", () => {
  it("avanza y retrocede de 7 en 7 días cruzando el año", () => {
    expect(iso(shiftWeek("2026-12-26T05:00:00.000Z", 1))).toBe("2027-01-02T05:00:00.000Z");
    expect(iso(shiftWeek("2026-12-26T05:00:00.000Z", -1))).toBe("2026-12-19T05:00:00.000Z");
  });
});

describe("parseWeekParam", () => {
  it("acepta AAAA-MM-DD y devuelve un instante de ese día en Bogotá", () => {
    expect(iso(parseWeekParam("2026-10-10")!)).toBe("2026-10-10T17:00:00.000Z");
  });

  it("rechaza texto vacío, mal formado o fechas imposibles", () => {
    expect(parseWeekParam(undefined)).toBeNull();
    expect(parseWeekParam("10/10/2026")).toBeNull();
    expect(parseWeekParam("2026-13-45")).toBeNull();
  });
});
