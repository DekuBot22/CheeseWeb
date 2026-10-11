import { describe, expect, it } from "vitest";
import type { Client } from "./client";
import {
  buildClientRows,
  filterClientRows,
  sortClientRows,
  type ClientOrder,
} from "./client-balance";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-10-31T12:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * DAY).toISOString();

const client = (id: string, name: string, over: Partial<Client> = {}): Client => ({
  id,
  name,
  phone: null,
  notes: null,
  credit_balance: 0,
  created_at: daysAgo(100),
  ...over,
});

const o = (client_id: string | null, over: Partial<ClientOrder> = {}): ClientOrder => ({
  client_id,
  total: 1000,
  amount_paid: 0,
  payment_status: "debe",
  created_at: daysAgo(1),
  ...over,
});

const clients = [client("a", "Ana"), client("b", "Beto", { phone: "3001112222" }), client("c", "Carla", { credit_balance: 500 })];
const orders = [
  o("a", { total: 1000, amount_paid: 200, payment_status: "parcial", created_at: daysAgo(10) }),
  o("a", { total: 500, created_at: daysAgo(3) }),
  o("b", { total: 700, amount_paid: 700, payment_status: "pagado", created_at: daysAgo(40) }),
  o(null, { total: 9999 }),
];

describe("buildClientRows", () => {
  const rows = buildClientRows(clients, orders, now);
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  it("suma lo que debe y cuenta los pedidos de cada cliente", () => {
    expect(byId.a).toMatchObject({ debe: 800 + 500, orders: 2, daysInDebt: 10 });
  });

  it("un cliente solo con pedidos pagados no debe nada ni tiene antigüedad", () => {
    expect(byId.b).toMatchObject({ debe: 0, orders: 1, daysInDebt: null });
  });

  it("ignora pedidos sin cliente y conserva el saldo a favor", () => {
    expect(byId.c).toMatchObject({ debe: 0, orders: 0, lastOrderAt: null, credit: 500 });
  });

  it("el último pedido es el más reciente", () => {
    expect(byId.a.lastOrderAt).toBe(daysAgo(3));
  });
});

describe("filterClientRows y sortClientRows", () => {
  const rows = buildClientRows(clients, orders, now);

  it("filtra por nombre o teléfono sin importar mayúsculas", () => {
    expect(filterClientRows(rows, "ANA").map((r) => r.id)).toEqual(["a"]);
    expect(filterClientRows(rows, "300111").map((r) => r.id)).toEqual(["b"]);
    expect(filterClientRows(rows, "  ")).toHaveLength(3);
  });

  it("deuda: de mayor a menor, con desempate por nombre", () => {
    expect(sortClientRows(rows, "deuda").map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("antigua: primero la deuda más vieja, los que no deben al final", () => {
    expect(sortClientRows(rows, "antigua").map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("nombre: alfabético", () => {
    expect(sortClientRows(rows, "nombre").map((r) => r.name)).toEqual(["Ana", "Beto", "Carla"]);
  });

  it("pedidos: más pedidos primero", () => {
    expect(sortClientRows(rows, "pedidos").map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("no modifica el arreglo original", () => {
    const copy = [...rows];
    sortClientRows(rows, "nombre");
    expect(rows).toEqual(copy);
  });
});
