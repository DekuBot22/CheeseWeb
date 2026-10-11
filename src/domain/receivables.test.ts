import { describe, expect, it } from "vitest";
import { receivables, type OpenOrder } from "./receivables";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-10-31T12:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * DAY).toISOString();

const open = (over: Partial<OpenOrder> = {}): OpenOrder => ({
  id: "o1",
  client_id: "c1",
  client_name: "Rosa",
  total: 1000,
  amount_paid: 0,
  created_at: daysAgo(1),
  ...over,
});

describe("receivables: antigüedad", () => {
  // [días, cubeta esperada]: bordes 7/8, 14/15 y 30/31.
  it.each([
    [0, 0],
    [7, 0],
    [8, 1],
    [14, 1],
    [15, 2],
    [30, 2],
    [31, 3],
  ])("un pedido de %i días cae en la cubeta %i", (days, bucket) => {
    const { aging } = receivables([open({ created_at: daysAgo(days) })], now);
    expect(aging.map((a) => a.amount)).toEqual([0, 1, 2, 3].map((i) => (i === bucket ? 1000 : 0)));
  });

  it("las etiquetas de las cubetas son fijas", () => {
    expect(receivables([], now).aging.map((a) => a.label)).toEqual([
      "0–7 días",
      "8–14 días",
      "15–30 días",
      "Más de 30 días",
    ]);
  });
});

describe("receivables: deudores", () => {
  it("agrupa por cliente y suma lo que debe", () => {
    const r = receivables(
      [open({ id: "a", total: 1000, amount_paid: 400 }), open({ id: "b", total: 500 })],
      now
    );
    expect(r.debtors).toHaveLength(1);
    expect(r.debtors[0]).toMatchObject({ owed: 1100, openOrders: 2 });
    expect(r.total).toBe(1100);
  });

  it("sin client_id agrupa por nombre", () => {
    const r = receivables(
      [open({ id: "a", client_id: null, client_name: "Ana" }), open({ id: "b", client_id: null, client_name: "Ana" }), open({ id: "c", client_id: null, client_name: "Luis" })],
      now
    );
    expect(r.debtors.map((d) => d.name).sort()).toEqual(["Ana", "Luis"]);
  });

  it("ignora pedidos sin saldo pendiente", () => {
    const r = receivables([open({ total: 1000, amount_paid: 1000 }), open({ id: "x", total: 1000, amount_paid: 1500 })], now);
    expect(r.debtors).toHaveLength(0);
    expect(r.total).toBe(0);
  });

  it("ordena de mayor a menor deuda", () => {
    const r = receivables(
      [open({ id: "a", client_id: "c1", client_name: "A", total: 100 }), open({ id: "b", client_id: "c2", client_name: "B", total: 900 })],
      now
    );
    expect(r.debtors.map((d) => d.name)).toEqual(["B", "A"]);
  });

  it("toma como antigüedad el pedido más viejo aunque llegue después en la lista", () => {
    const r = receivables(
      [open({ id: "a", created_at: daysAgo(2) }), open({ id: "b", created_at: daysAgo(20) })],
      now
    );
    expect(r.debtors[0].days).toBe(20);
    expect(r.debtors[0].oldestAt).toBe(daysAgo(20));
  });
});
