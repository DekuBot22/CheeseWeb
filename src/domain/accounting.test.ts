import { describe, expect, it } from "vitest";
import {
  computeStats,
  kgSold,
  percentChange,
  sumWeeks,
  weeklySeries,
  withCostFallback,
  type StatOrder,
  type StatPurchase,
} from "./accounting";
import { formatWeight } from "./units";

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
  it("la ganancia es lo cobrado menos el costo de esa parte; lo no cobrado no cuenta", () => {
    const s = computeStats(
      [
        order({ quantity: 2, unit: "kg", total: 1000, amount_paid: 1000, cost_per_kg_snapshot: 300 }),
        order({ quantity: 3, unit: "lb", total: 500, amount_paid: 250, cost_per_kg_snapshot: 400 }),
        order({ quantity: 1, unit: "kg", total: 800, amount_paid: 0, cost_per_kg_snapshot: 300 }),
      ],
      [],
      []
    );
    expect(s.revenue).toBe(2300);
    expect(s.collected).toBe(1250);
    // 2 kg completos + la mitad de 1,5 kg; el pedido sin pagar no pone costo.
    expect(s.cost).toBe(2 * 300 + 1.5 * 400 * 0.5);
    expect(s.kgPaid).toBe(2 + 0.75);
    expect(s.profit).toBe(1250 - 900);
  });

  it("las compras, descuentos y pagos del proveedor no cambian la ganancia", () => {
    const orders = [order({ total: 1000, amount_paid: 1000, cost_per_kg_snapshot: 300 })];
    const sin = computeStats(orders, [], []);
    const con = computeStats(
      orders,
      [purchase({ total_cost: 9000 })],
      [{ amount: 500, payment_date: "2026-10-06" }],
      [{ amount: 200, discount_date: "2026-10-06" }]
    );
    expect(con.profit).toBe(sin.profit);
    expect(con.cost).toBe(sin.cost);
    expect(con.profit).toBe(700);
    expect(con.margin).toBe(70);
  });

  it("un abono a medias da pesos enteros: el costo sube al peso siguiente", () => {
    // 3.000 de 26.000 con costo 22.000/kg: costo 2.538,46 → 2.539; ganancia 461.
    const gladys = order({ quantity: 1, unit: "kg", total: 26000, amount_paid: 3000, cost_per_kg_snapshot: 22000 });
    const s = computeStats([gladys], [], []);
    expect(s.cost).toBe(2539);
    expect(s.profit).toBe(461);
    // Pagados completos no cambian: 2 kg a 22.000 cuestan exactamente 44.000.
    const full = order({ quantity: 2, unit: "kg", total: 52000, amount_paid: 52000, cost_per_kg_snapshot: 22000 });
    expect(computeStats([full], [], []).profit).toBe(8000);
  });

  it("si el pedido quedó con costo 0 usa el costo por kg de Ajustes", () => {
    const orders = [order({ total: 1000, amount_paid: 1000, cost_per_kg_snapshot: 0 })];
    expect(computeStats(orders, [], []).profit).toBe(1000);
    expect(computeStats(withCostFallback(orders, 400), [], []).profit).toBe(600);
  });

  it("sin nada cobrado el margen es 0", () => {
    expect(computeStats([order()], [purchase()], []).margin).toBe(0);
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

  it("suma kg y pedidos de la semana: por valor, en libras, con descuento; sin anulados ni la semana anterior", () => {
    const series = weekly(
      [
        // Por valor: $40.000 a $26.000/kg → 1,54 kg guardados.
        order({ quantity: 1.54, unit: "kg", total: 40000, created_at: "2026-10-10T15:00:00Z" }),
        order({ quantity: 3, unit: "lb", total: 39000, created_at: "2026-10-10T16:00:00Z" }),
        // Con descuento: 2 kg a $25.000/kg; los kg no cambian.
        order({ quantity: 2, unit: "kg", total: 50000, created_at: "2026-10-10T17:00:00Z" }),
        order({ quantity: 10, unit: "kg", voided_at: "2026-10-10T18:00:00Z", created_at: "2026-10-10T17:30:00Z" }),
        // Viernes 11:30 p. m. de Bogotá: es de la semana anterior.
        order({ quantity: 7, unit: "kg", created_at: "2026-10-10T04:30:00Z" }),
      ],
      [],
      [],
      2,
      now
    );
    const current = series[1];
    expect(current.orderCount).toBe(3);
    expect(current.kgSold).toBeCloseTo(5.04, 5);
    expect(formatWeight(current.kgSold, "kg")).toBe("5 kg 40 g");
    expect(formatWeight(current.kgSold, "lb")).toBe("10 lb 40 g");
    expect(series[0].orderCount).toBe(1);
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

  it("el costo de cada semana sale de sus propios pedidos", () => {
    const series = weekly(
      [
        order({ total: 1000, amount_paid: 1000, created_at: "2026-10-05T15:00:00Z", cost_per_kg_snapshot: 300 }),
        order({ total: 1000, amount_paid: 500, created_at: "2026-10-12T15:00:00Z", cost_per_kg_snapshot: 300 }),
      ],
      [purchase({ purchase_date: "2026-10-05", total_cost: 600 })],
      [],
      2,
      new Date("2026-10-13T15:00:00Z")
    );
    expect(series[0].stats.cost).toBe(300);
    expect(series[1].stats.cost).toBe(150);
  });
});

describe("sumWeeks", () => {
  const now = new Date("2026-10-13T15:00:00Z");
  const series = weekly(
    [
      order({ total: 1000, amount_paid: 500, created_at: "2026-10-05T15:00:00Z", cost_per_kg_snapshot: 600 }),
      order({ total: 1000, amount_paid: 500, created_at: "2026-10-12T15:00:00Z", cost_per_kg_snapshot: 600 }),
    ],
    [purchase({ purchase_date: "2026-10-05", total_cost: 600 })],
    [],
    3,
    now
  );

  it("suma costo y ganancia de cada semana", () => {
    const total = sumWeeks(series);
    expect(total.cost).toBe(300 + 300);
    expect(total.revenue).toBe(2000);
    expect(total.collected).toBe(1000);
    expect(total.profit).toBe(400);
    expect(total.margin).toBe(40);
  });
});

describe("descuentos del proveedor", () => {
  const discount = (amount: number, discount_date = "2026-10-06") => ({ amount, discount_date });

  it("el descuento baja lo descontado y el saldo, pero no la ganancia", () => {
    const orders = [order({ total: 1300, amount_paid: 1300 })];
    const sin = computeStats(orders, [purchase({ total_cost: 900 })], []);
    const con = computeStats(orders, [purchase({ total_cost: 900 })], [], [discount(150)]);
    expect(con.descontado).toBe(150);
    expect(con.saldoProveedor).toBe(sin.saldoProveedor - 150);
    expect(con.profit).toBe(sin.profit);
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

  it("semana con descuento pero sin compras: solo baja el saldo", () => {
    const s = computeStats([order({ total: 1000, cost_per_kg_snapshot: 300 })], [], [], [discount(100)]);
    expect(s.saldoProveedor).toBe(-100);
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

  it("sumWeeks suma los descuentos", () => {
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
  });

  it("sin descuentos lo descontado es 0", () => {
    const s = computeStats([order()], [purchase({ total_cost: 600 })], []);
    expect(s.descontado).toBe(0);
    expect(s.saldoProveedor).toBe(600);
  });
});
