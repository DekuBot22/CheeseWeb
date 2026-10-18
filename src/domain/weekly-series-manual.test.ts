import { describe, expect, it } from "vitest";
import { weeklySeries, type StatOrder, type StatPurchase } from "./accounting";
import { buildCalendar, currentWeek, lastWeeks } from "./week-calendar";

const at = (isoLocal: string) => new Date(`${isoLocal}-05:00`);

const order = (over: Partial<StatOrder>): StatOrder => ({
  quantity: 2,
  unit: "kg",
  total: 52000,
  amount_paid: 52000,
  cost_per_kg_snapshot: 22000,
  created_at: "2026-10-05T15:00:00Z",
  ...over,
});

const purchase = (over: Partial<StatPurchase>): StatPurchase => ({
  kg: 10,
  total_cost: 220000,
  purchase_date: "2026-10-05",
  ...over,
});

describe("weeklySeries con semanas del calendario", () => {
  // Lotes del domingo 4 y del lunes 12: la semana del 4 dura 8 días (del 4 al 11).
  const now = at("2026-10-14T10:00:00");
  const cal = buildCalendar(["2026-10-04", "2026-10-12"], now);
  const weeks = lastWeeks(cal, 2, currentWeek(cal));

  const data = {
    orders: [
      order({ created_at: "2026-10-03T22:00:00-05:00" }), // sábado: aún semana anterior
      order({ created_at: "2026-10-04T08:00:00-05:00" }), // domingo: semana nueva
      order({ created_at: "2026-10-11T23:30:00-05:00" }), // domingo siguiente: aún la misma
      order({ created_at: "2026-10-12T00:10:00-05:00" }), // lunes: semana nueva
    ],
    purchases: [purchase({ purchase_date: "2026-10-04" }), purchase({ purchase_date: "2026-10-12" })],
    providerPayments: [],
  };

  it("una semana de 8 días reúne pedidos y compras de todo su rango, sin traslapes", () => {
    const [long, current] = weeklySeries(data, weeks);
    expect(long.days).toBe(8);
    expect(long.manual).toBe(true);
    expect(long.orderCount).toBe(2);
    expect(long.kgBought).toBe(10);
    expect(current.orderCount).toBe(1);
    expect(current.kgBought).toBe(10);
  });

  it("la compra del sábado anterior a la apertura no cuenta en la semana nueva", () => {
    const [long] = weeklySeries({ ...data, purchases: [purchase({ purchase_date: "2026-10-03" })] }, weeks);
    expect(long.kgBought).toBe(0);
  });

  it("con un número de semanas usa la regla de siempre (sábado a viernes, 7 días)", () => {
    const series = weeklySeries(data, 3, now);
    expect(series).toHaveLength(3);
    expect(series.every((w) => w.days === 7 && !w.manual)).toBe(true);
  });
});
