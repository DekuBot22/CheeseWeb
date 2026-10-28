import { describe, expect, it } from "vitest";
import { salesByDay, withSales } from "./week-activity";
import { monthGrid } from "./week-month";

describe("salesByDay", () => {
  it("cuenta por día de Bogotá, no por día UTC", () => {
    // 2026-10-18 02:00 UTC = 17 oct 21:00 en Bogotá.
    const out = salesByDay(["2026-10-18T02:00:00Z", "2026-10-17T15:00:00Z", "2026-10-18T15:00:00Z"]);
    expect(out).toEqual({ "2026-10-17": 2, "2026-10-18": 1 });
  });
  it("sin pedidos no hay días", () => expect(salesByDay([])).toEqual({}));
});

describe("withSales", () => {
  it("anota las ventas solo en los días que tienen y no cambia la cuadrícula original", () => {
    const grid = monthGrid("2026-10", ["2026-10-10"], "2026-10-27");
    const out = withSales(grid, { "2026-10-12": 3 });
    const all = out.rows.flat();
    expect(all.find((c) => c.date === "2026-10-12")?.sales).toBe(3);
    expect(all.filter((c) => c.sales !== undefined)).toHaveLength(1);
    expect(grid.rows.flat().every((c) => c.sales === undefined)).toBe(true);
  });
});
