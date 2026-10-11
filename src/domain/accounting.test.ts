import { describe, expect, it } from "vitest";
import {
  computeStats,
  kgSold,
  percentChange,
  sumWeeks,
  weeklySeries,
  type StatOrder,
  type StatPurchase,
} from "./accounting";

// Atajo: las pruebas arman los tres conjuntos por separado.
const weekly = (
  orders: StatOrder[],
  purchases: StatPurchase[],
  providerPayments: { amount: number; payment_date: string }[],
  weeks: number,
  now: Date
) => weeklySeries({ orders, purchases, providerPayments }, weeks, now);

const order = (over: Partial<StatOrder> = {}): StatOrder => ({
  quantity: 1,
  unit: "kg",
  total: 1000,
  amount_paid: 0,
  cost_per_kg_snapshot: 0,
  created_at: "2026-10-05T15:00:00Z",
  ...over,
});

const purchase = (over: Partial<StatPurchase> = {}): StatPurchase => ({
  kg: 10,
  total_cost: 600,
  purchase_date: "2026-10-05",
  ...over,
});

describe("computeStats", () => {
  it("sin compras estima el costo con kg × costo por kg del pedido", () => {
    const s = computeStats(
      [order({ quantity: 2, unit: "kg", total: 1000, cost_per_kg_snapshot: 300 }), order({ quantity: 3, unit: "lb", total: 500, cost_per_kg_snapshot: 400 })],
      [],
      []
    );
    expect(s.usingRealCost).toBe(false);
    expect(s.cost).toBe(2 * 300 + 1.5 * 400);
    expect(s.revenue).toBe(1500);
    expect(s.profit).toBe(1500 - 1200);
  });

  it("con compras el costo es lo comprado, no lo estimado", () => {
    const s = computeStats([order({ cost_per_kg_snapshot: 999 })], [purchase({ total_cost: 600 })], []);
    expect(s.usingRealCost).toBe(true);
    expect(s.cost).toBe(600);
    expect(s.profit).toBe(400);
    expect(s.margin).toBe(40);
  });

  it("sin ingresos el margen es 0", () => {
    expect(computeStats([], [purchase()], []).margin).toBe(0);
  });

  it("acepta números que llegan como texto desde la base", () => {
    const s = computeStats(
      [order({ total: "30000.00" as unknown as number, amount_paid: "10000.00" as unknown as number })],
      [],
      []
    );
    expect(s.revenue).toBe(30000);
    expect(s.collected).toBe(10000);
  });

  it("el saldo con el proveedor es comprado menos pagado", () => {
    const s = computeStats([], [purchase({ total_cost: 900 })], [{ amount: 400, payment_date: "2026-10-06" }]);
    expect(s.saldoProveedor).toBe(500);
  });
});

describe("kgSold y percentChange", () => {
  it("kgSold convierte libras (1 kg = 2 lb)", () => {
    expect(kgSold([{ quantity: 4, unit: "lb" }, { quantity: 1, unit: "kg" }])).toBe(3);
  });

  it("percentChange devuelve null sin base y usa el valor absoluto de la base", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(5, 0)).toBeNull();
    expect(percentChange(50, -100)).toBe(150);
  });
});

describe("weeklySeries", () => {
  // Sábado 10 oct 2026, 10 a. m. en Bogotá: la semana actual empezó a las 05:00Z.
  const now = new Date("2026-10-10T15:00:00Z");

  it("devuelve una fila por semana, de la más antigua a la más nueva", () => {
    const series = weekly([], [], [], 3, now);
    expect(series).toHaveLength(3);
    expect(series.map((w) => w.start.toISOString())).toEqual([
      "2026-09-26T05:00:00.000Z",
      "2026-10-03T05:00:00.000Z",
      "2026-10-10T05:00:00.000Z",
    ]);
  });

  it("el pedido del viernes 11 p. m. y el del sábado 00:30 caen en semanas distintas", () => {
    const series = weekly(
      [
        order({ total: 1000, created_at: "2026-10-10T04:00:00Z" }),
        order({ total: 2000, created_at: "2026-10-10T05:30:00Z" }),
      ],
      [],
      [],
      2,
      now
    );
    expect(series[0].stats.revenue).toBe(1000);
    expect(series[1].stats.revenue).toBe(2000);
  });

  it("la compra del sábado de llegada se cuenta en una sola semana", () => {
    const series = weekly([], [purchase({ purchase_date: "2026-10-10", total_cost: 700 })], [], 2, now);
    expect(series[0].stats.comprado).toBe(0);
    expect(series[1].stats.comprado).toBe(700);
  });

  it("el pago al proveedor del viernes y el del sábado siguiente tampoco se duplican", () => {
    const series = weekly(
      [],
      [],
      [
        { amount: 100, payment_date: "2026-10-09" },
        { amount: 200, payment_date: "2026-10-10" },
      ],
      2,
      now
    );
    expect(series[0].stats.pagadoProveedor).toBe(100);
    expect(series[1].stats.pagadoProveedor).toBe(200);
  });

  it("cada semana usa su propio criterio de costo (real o estimado)", () => {
    const series = weekly(
      [
        order({ total: 1000, created_at: "2026-10-05T15:00:00Z", cost_per_kg_snapshot: 300 }),
        order({ total: 1000, created_at: "2026-10-12T15:00:00Z", cost_per_kg_snapshot: 300 }),
      ],
      [purchase({ purchase_date: "2026-10-05", total_cost: 600 })],
      [],
      2,
      new Date("2026-10-13T15:00:00Z")
    );
    expect(series[0].stats.usingRealCost).toBe(true);
    expect(series[1].stats.usingRealCost).toBe(false);
  });
});

describe("sumWeeks", () => {
  const now = new Date("2026-10-13T15:00:00Z");
  const series = weekly(
    [
      order({ total: 1000, created_at: "2026-10-05T15:00:00Z", cost_per_kg_snapshot: 300 }),
      order({ total: 1000, created_at: "2026-10-12T15:00:00Z", cost_per_kg_snapshot: 300 }),
    ],
    [purchase({ purchase_date: "2026-10-05", total_cost: 600 })],
    [],
    3,
    now
  );

  it("suma el costo de cada semana sin recalcular el período de un golpe", () => {
    const total = sumWeeks(series);
    expect(total.cost).toBe(600 + 300);
    expect(total.revenue).toBe(2000);
    expect(total.profit).toBe(1100);
  });

  it("basta una semana con ventas y costo estimado para marcar el total como estimado", () => {
    expect(sumWeeks(series).usingRealCost).toBe(false);
  });

  it("las semanas sin ingresos no cambian si el costo es real", () => {
    const onlyReal = weekly([order({ total: 1000, created_at: "2026-10-05T15:00:00Z" })], [purchase()], [], 3, now);
    expect(sumWeeks(onlyReal).usingRealCost).toBe(true);
  });
});

describe("descuentos del proveedor", () => {
  const discount = (amount: number, discount_date = "2026-10-06") => ({ amount, discount_date });

  it("el descuento baja el costo neto y sube la ganancia", () => {
    const orders = [order({ total: 1300 })];
    const sin = computeStats(orders, [purchase({ total_cost: 900 })], []);
    const con = computeStats(orders, [purchase({ total_cost: 900 })], [], [discount(150)]);
    expect(con.cost).toBe(750);
    expect(con.descontado).toBe(150);
    expect(con.profit - sin.profit).toBe(150);
  });

  it("el saldo con el proveedor es comprado − descontado − pagado", () => {
    const s = computeStats(
      [],
      [purchase({ total_cost: 900 })],
      [{ amount: 400, payment_date: "2026-10-06" }],
      [discount(150)]
    );
    expect(s.saldoProveedor).toBe(350);
  });

  it("semana con descuento pero sin compras: no resta del costo estimado, solo del saldo", () => {
    const s = computeStats([order({ total: 1000, cost_per_kg_snapshot: 300 })], [], [], [discount(100)]);
    expect(s.usingRealCost).toBe(false);
    expect(s.cost).toBe(300);
    expect(s.descuentoSinCompra).toBe(true);
    expect(s.saldoProveedor).toBe(-100);
  });

  it("un descuento mayor que la compra deja el costo en 0 y el saldo negativo", () => {
    const s = computeStats([], [purchase({ total_cost: 500 })], [], [discount(800)]);
    expect(s.cost).toBe(0);
    expect(s.saldoProveedor).toBe(-300);
  });

  it("weeklySeries: el descuento del viernes va a la semana anterior y el del sábado a la nueva", () => {
    const now = new Date("2026-10-10T15:00:00Z");
    const series = weeklySeries(
      {
        orders: [],
        purchases: [],
        providerPayments: [],
        discounts: [discount(100, "2026-10-09"), discount(200, "2026-10-10")],
      },
      2,
      now
    );
    expect(series[0].stats.descontado).toBe(100);
    expect(series[1].stats.descontado).toBe(200);
  });

  it("sumWeeks suma los descuentos y propaga descuentoSinCompra", () => {
    const now = new Date("2026-10-13T15:00:00Z");
    const series = weeklySeries(
      {
        orders: [],
        purchases: [purchase({ purchase_date: "2026-10-05", total_cost: 600 })],
        providerPayments: [],
        discounts: [discount(100, "2026-10-06"), discount(50, "2026-10-12")],
      },
      2,
      now
    );
    const total = sumWeeks(series);
    expect(total.descontado).toBe(150);
    expect(total.saldoProveedor).toBe(450);
    expect(total.descuentoSinCompra).toBe(true);
  });

  it("sin descuentos todo queda como antes (retrocompatible)", () => {
    const s = computeStats([order()], [purchase({ total_cost: 600 })], []);
    expect(s.descontado).toBe(0);
    expect(s.descuentoSinCompra).toBe(false);
    expect(s.cost).toBe(600);
  });
});
