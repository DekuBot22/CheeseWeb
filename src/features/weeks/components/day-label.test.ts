import { describe, expect, it } from "vitest";
import { monthGrid } from "@/domain/week-month";
import { dayLabel, weekRangeLabel } from "./day-label";

const TODAY = "2026-10-27";
const grid = monthGrid("2026-10", ["2026-10-10", "2026-10-18", "2026-10-24"], TODAY);
const label = (date: string) => dayLabel(grid.rows.flat().find((c) => c.date === date)!, grid.weeks);

describe("dayLabel", () => {
  it("el día de llegada lo dice y da el rango de su semana", () => {
    expect(label("2026-10-18")).toBe("domingo 18 de octubre, llegó el queso, semana del 18 oct al 23 oct");
  });

  it("un día cualquiera de una semana, y la semana en curso", () => {
    expect(label("2026-10-20")).toBe("martes 20 de octubre, semana del 18 oct al 23 oct");
    expect(label("2026-10-26")).toBe("lunes 26 de octubre, semana del 24 oct en curso");
  });

  it("antes de la primera apertura y días futuros", () => {
    expect(label("2026-10-09")).toBe("viernes 9 de octubre, sin semana");
    expect(label("2026-10-28")).toBe("miércoles 28 de octubre, todavía no llega");
  });

  it("weekRangeLabel", () => {
    expect(weekRangeLabel({ from: "2026-10-10", to: "2026-10-17" })).toBe("10 oct al 17 oct");
    expect(weekRangeLabel({ from: "2026-10-24", to: null })).toBe("24 oct en curso");
  });
});
