import { describe, expect, it } from "vitest";
import type { WeekPoint } from "./accounting";
import { weekFigures } from "./week-figures";

const point = (revenue: number, collected: number, profit: number, orderCount: number) =>
  ({ stats: { revenue, collected, profit }, orderCount }) as unknown as WeekPoint;

describe("weekFigures", () => {
  it("toma ganancia y por cobrar de cada semana", () => {
    const out = weekFigures(
      [{ from: "2026-10-10" }, { from: "2026-10-18" }],
      [point(936000, 521000, 70000, 12), point(0, 0, 0, 0)]
    );
    expect(out).toEqual([
      { from: "2026-10-10", profit: 70000, pending: 415000, orders: 12 },
      { from: "2026-10-18", profit: 0, pending: 0, orders: 0 },
    ]);
  });

  it("nunca da un por cobrar negativo (cobro de más)", () => {
    const [f] = weekFigures([{ from: "2026-10-10" }], [point(1000, 1500, 500, 1)]);
    expect(f.pending).toBe(0);
  });
});
