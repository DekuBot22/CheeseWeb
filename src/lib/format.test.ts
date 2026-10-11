import { describe, expect, it } from "vitest";
import { weekRange } from "@/domain/week";
import {
  formatCOP,
  formatDate,
  formatDateShort,
  formatDay,
  formatKg,
  formatWeekLabel,
  formatWeekShort,
  plural,
} from "./format";

describe("formato de fechas (siempre hora de Bogotá)", () => {
  it("formatWeekLabel dentro de un mes y cruzando mes/año", () => {
    const a = weekRange(new Date("2026-10-07T15:00:00Z"));
    expect(formatWeekLabel(a.start, a.end)).toBe("3 – 9 oct, 2026");
    const b = weekRange(new Date("2026-12-30T15:00:00Z"));
    expect(formatWeekLabel(b.start, b.end)).toBe("26 dic – 1 ene, 2027");
  });

  it("formatWeekShort", () => {
    expect(formatWeekShort(weekRange(new Date("2026-10-07T15:00:00Z")).start)).toBe("3 oct");
  });

  it("formatDate: 04:00Z es el viernes 11 p. m. en Bogotá", () => {
    expect(formatDate("2026-10-10T04:00:00Z")).toBe("9 de octubre de 2026, 11:00 p. m.");
    expect(formatDate("2026-10-10T17:05:00Z")).toBe("10 de octubre de 2026, 12:05 p. m.");
    expect(formatDate("2026-10-10T05:30:00Z")).toBe("10 de octubre de 2026, 12:30 a. m.");
  });

  it("formatDateShort y formatDay", () => {
    expect(formatDateShort("2026-10-10T04:00:00Z")).toBe("9 oct");
    expect(formatDay("2026-10-04")).toBe("4 oct 2026");
  });
});

describe("formato de números", () => {
  it("formatCOP agrupa miles con punto y sin decimales", () => {
    expect(formatCOP(30000)).toMatch(/30\.000$/);
    expect(formatCOP(30000)).not.toMatch(/,/);
  });

  it("formatKg y plural", () => {
    expect(formatKg(1.26)).toBe("1,3");
    expect(plural(1, "pedido")).toBe("1 pedido");
    expect(plural(3, "pedido")).toBe("3 pedidos");
    expect(plural(0, "pedido")).toBe("0 pedidos");
  });
});
