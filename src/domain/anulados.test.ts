import { describe, expect, it } from "vitest";
import { computeStats, kgSold, sumWeeks, weeklySeries, type StatOrder } from "./accounting";
import { buildClientRows, summarizeClientOrders } from "./client-balance";
import { buildLedger, providerTotals, remainingForDiscount } from "./provider-ledger";
import { receivables, type OpenOrder } from "./receivables";
import type { ProviderDiscount, ProviderPayment, Purchase } from "./purchase";

const VOID = "2026-10-12T10:00:00Z";

const order = (over: Partial<StatOrder> = {}): StatOrder => ({
  quantity: 2,
  unit: "kg",
  total: 1000,
  amount_paid: 400,
  cost_per_kg_snapshot: 100,
  created_at: "2026-10-05T15:00:00Z",
  ...over,
});

describe("computeStats con anulados", () => {
  it("un pedido anulado no suma a ingresos, cobrado ni costo", () => {
    const s = computeStats([order(), order({ voided_at: VOID, total: 9999, amount_paid: 9999 })], [], []);
    expect(s.revenue).toBe(1000);
    expect(s.collected).toBe(400);
    expect(s.cost).toBe(80); // 2 kg × 100 × 40 % cobrado
  });

  it("una compra anulada no suma a lo comprado", () => {
    const s = computeStats([order()], [{ kg: 10, total_cost: 600, purchase_date: "2026-10-05", voided_at: VOID }], []);
    expect(s.comprado).toBe(0);
  });

  it("un pago y un descuento anulados no tocan el saldo ni lo descontado", () => {
    const s = computeStats(
      [],
      [{ kg: 10, total_cost: 600, purchase_date: "2026-10-05" }],
      [{ amount: 100, payment_date: "2026-10-06", voided_at: VOID }],
      [{ amount: 50, discount_date: "2026-10-06", voided_at: VOID }]
    );
    expect(s.pagadoProveedor).toBe(0);
    expect(s.descontado).toBe(0);
    expect(s.saldoProveedor).toBe(600);
  });
});

describe("series y kilos con anulados", () => {
  const now = new Date("2026-10-08T12:00:00Z");

  it("orderCount, kgSold y kgBought excluyen lo anulado", () => {
    const [week] = weeklySeries(
      {
        orders: [order(), order({ voided_at: VOID })],
        purchases: [
          { kg: 10, total_cost: 600, purchase_date: "2026-10-05" },
          { kg: 99, total_cost: 999, purchase_date: "2026-10-05", voided_at: VOID },
        ],
        providerPayments: [],
      },
      1,
      now
    );
    expect(week.orderCount).toBe(1);
    expect(week.kgSold).toBe(2);
    expect(week.kgBought).toBe(10);
    expect(sumWeeks([week]).revenue).toBe(1000);
  });

  it("kgSold ignora los anulados", () => {
    expect(kgSold([{ quantity: 3, unit: "kg" }, { quantity: 5, unit: "kg", voided_at: VOID }])).toBe(3);
  });
});

describe("receivables y clientes con anulados", () => {
  const open = (over: Partial<OpenOrder> = {}): OpenOrder => ({
    id: "a",
    client_id: "c1",
    client_name: "Ana",
    total: 1000,
    amount_paid: 0,
    created_at: "2026-10-05T15:00:00Z",
    ...over,
  });
  const now = new Date("2026-10-10T12:00:00Z");

  it("un pedido anulado que debe no entra en el total ni en la antigüedad", () => {
    const r = receivables([open(), open({ id: "b", voided_at: VOID, total: 5000 })], now);
    expect(r.total).toBe(1000);
    expect(r.aging.reduce((s, a) => s + a.amount, 0)).toBe(1000);
  });

  it("un cliente con solo pedidos anulados no aparece como deudor", () => {
    expect(receivables([open({ voided_at: VOID })], now).debtors).toHaveLength(0);
  });

  it("buildClientRows no cuenta los anulados en deuda, pedidos ni último pedido", () => {
    const client = { id: "c1", name: "Ana", phone: null, notes: null, credit_balance: 0, created_at: "2026-01-01T00:00:00Z" };
    const rows = buildClientRows(
      [client],
      [
        { client_id: "c1", total: 1000, amount_paid: 0, payment_status: "debe", created_at: "2026-10-01T00:00:00Z" },
        { client_id: "c1", total: 700, amount_paid: 0, payment_status: "debe", created_at: "2026-10-09T00:00:00Z", voided_at: VOID },
      ],
      now
    );
    expect(rows[0]).toMatchObject({ debe: 1000, orders: 1, lastOrderAt: "2026-10-01T00:00:00Z" });
    expect(rows[0].daysInDebt).toBe(9);
  });

  it("summarizeClientOrders deja fuera lo anulado", () => {
    expect(
      summarizeClientOrders([
        { total: 1000, amount_paid: 400 },
        { total: 700, amount_paid: 0, voided_at: VOID },
      ])
    ).toEqual({ debe: 600, comprado: 1000, count: 1 });
  });
});

describe("libro del proveedor con anulados", () => {
  const purchase = (over: Partial<Purchase> = {}): Purchase => ({
    id: "p1",
    purchase_date: "2026-10-05",
    kg: 10,
    total_cost: 600,
    description: null,
    created_at: "2026-10-05T12:00:00Z",
    ...over,
  });
  const payment = (over: Partial<ProviderPayment> = {}): ProviderPayment => ({
    id: "g1",
    payment_date: "2026-10-06",
    amount: 200,
    method: null,
    notes: null,
    created_at: "2026-10-06T12:00:00Z",
    ...over,
  });
  const discount = (over: Partial<ProviderDiscount> = {}): ProviderDiscount => ({
    id: "d1",
    discount_date: "2026-10-07",
    amount: 100,
    reason: "salado",
    purchase_id: "p1",
    kg: null,
    notes: null,
    created_at: "2026-10-07T12:00:00Z",
    ...over,
  });

  it("las filas anuladas aparecen marcadas y el saldo las salta", () => {
    const ledger = buildLedger([purchase()], [payment({ voided_at: VOID, void_reason: "Error" })], [discount()]);
    expect(ledger.map((r) => [r.key, r.voided, r.saldo])).toEqual([
      ["c-p1", false, 600],
      ["p-g1", true, 600],
      ["d-d1", false, 500],
    ]);
    expect(ledger[1].voidReason).toBe("Error");
    expect(ledger[1].id).toBe("g1");
  });

  it("providerTotals ignora los anulados", () => {
    expect(
      providerTotals([purchase(), purchase({ voided_at: VOID })], [payment()], [discount({ voided_at: VOID })])
    ).toEqual({ comprado: 600, pagado: 200, descontado: 0, saldo: 400 });
  });

  it("al anular un descuento, el tope de la compra vuelve a subir", () => {
    const p = purchase();
    expect(remainingForDiscount(p, [discount()])).toBe(500);
    expect(remainingForDiscount(p, [discount({ voided_at: VOID })])).toBe(600);
  });
});
