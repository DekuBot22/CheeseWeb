import { describe, expect, it } from "vitest";
import { collectionMessage, whatsappLink, whatsappNumber } from "./collection-message";
import { monthlyCollection } from "./monthly-collection";
import type { OpenOrder } from "./receivables";
import { buildCalendar } from "./week-calendar";

// Semanas a mano: 10 oct–17 oct, 18 oct–23 oct y desde el 24 oct. Hoy es 27 oct 2026 (Bogotá).
const NOW = new Date("2026-10-27T17:00:00.000Z");
const cal = buildCalendar(["2026-10-10", "2026-10-18", "2026-10-24"], NOW);
const PHONES = new Map<string, string | null>([["c1", "300 123 4567"], ["c2", null]]);

let n = 0;
const order = (client: string, iso: string, total: number, paid = 0, id: string | null = null): OpenOrder => ({
  id: `o${++n}`,
  client_id: id,
  client_name: client,
  total,
  amount_paid: paid,
  created_at: iso,
  voided_at: null,
});

describe("monthlyCollection", () => {
  const orders = [
    order("Ana Pérez", "2026-10-12T17:00:00Z", 100000, 20000, "c1"), // semana 10–17: debe 80.000
    order("Ana Pérez", "2026-10-20T17:00:00Z", 50000, 0, "c1"), // semana 18–23: debe 50.000
    order("Ana Pérez", "2026-09-20T17:00:00Z", 30000, 0, "c1"), // septiembre: de meses anteriores
    order("Luis Gómez", "2026-10-25T17:00:00Z", 26000, 0, "c2"), // semana 24 en curso
    order("Pagado Total", "2026-10-13T17:00:00Z", 10000, 10000, "c3"), // sin deuda
  ];

  it("suma por cliente lo que falta cobrar del mes, con desglose por semana", () => {
    const out = monthlyCollection(orders, PHONES, cal, "2026-10");
    expect(out.rows.map((r) => [r.name, r.owed, r.orders])).toEqual([
      ["Ana Pérez", 130000, 2],
      ["Luis Gómez", 26000, 1],
    ]);
    expect(out.rows[0].weeks.map((w) => [w.from, w.owed])).toEqual([
      ["2026-10-10", 80000],
      ["2026-10-18", 50000],
    ]);
    expect(out.total).toBe(156000);
  });

  it("lo de meses anteriores va aparte y no entra en el total del mes", () => {
    const out = monthlyCollection(orders, PHONES, cal, "2026-10");
    expect(out.rows[0].earlierOwed).toBe(30000);
    expect(out.earlierTotal).toBe(30000);
  });

  it("un mes pasado solo cuenta sus pedidos y no los posteriores", () => {
    const out = monthlyCollection(orders, PHONES, cal, "2026-09");
    expect(out.rows.map((r) => [r.name, r.owed])).toEqual([["Ana Pérez", 30000]]);
  });

  it("ignora pedidos anulados y trae el teléfono del cliente", () => {
    const voided = { ...order("Ana Pérez", "2026-10-15T17:00:00Z", 99999, 0, "c1"), voided_at: "2026-10-16T00:00:00Z" };
    const out = monthlyCollection([...orders, voided], PHONES, cal, "2026-10");
    expect(out.rows[0].owed).toBe(130000);
    expect(out.rows[0].phone).toBe("300 123 4567");
  });

  it("lista los meses con deuda (más nuevo primero) incluyendo el actual", () => {
    expect(monthlyCollection(orders, PHONES, cal, "2026-10").months).toContain("2026-09");
    expect(monthlyCollection(orders, PHONES, cal, "2026-10").months[0] >= "2026-09").toBe(true);
  });
});

describe("mensaje de cobro", () => {
  const out = monthlyCollection(
    [order("Ana Pérez", "2026-10-12T17:00:00Z", 100000, 20000, "c1"), order("Ana Pérez", "2026-10-20T17:00:00Z", 50000, 0, "c1")],
    PHONES,
    cal,
    "2026-10"
  );
  const row = out.rows[0];

  it("usa el primer nombre, el desglose por semana y el total", () => {
    const text = collectionMessage(row, "2026-10");
    expect(text).toContain("Hola Ana");
    expect(text).toContain("10 oct al 17 oct");
    expect(text).toContain("18 oct al 23 oct");
    expect(text).toMatch(/Total: .*130\.000/);
    expect(text).not.toContain("meses anteriores");
  });

  it("con una sola semana no repite el desglose", () => {
    const one = monthlyCollection([order("Luis Gómez", "2026-10-25T17:00:00Z", 26000, 0, "c2")], PHONES, cal, "2026-10").rows[0];
    expect(collectionMessage(one, "2026-10")).not.toContain("•");
  });

  it("avisa de lo anterior solo si hay", () => {
    expect(collectionMessage({ ...row, earlierOwed: 30000 }, "2026-10")).toMatch(/Además quedan .*30\.000 de meses anteriores/);
  });

  it("normaliza el número colombiano y abre sin número si no sirve", () => {
    expect(whatsappNumber("300 123 4567")).toBe("573001234567");
    expect(whatsappNumber("+57 300 123 4567")).toBe("573001234567");
    expect(whatsappNumber("12345")).toBeNull();
    expect(whatsappNumber(null)).toBeNull();
    expect(whatsappLink(row, "2026-10")).toMatch(/^https:\/\/wa\.me\/573001234567\?text=Hola%20Ana/);
    expect(whatsappLink({ ...row, phone: null }, "2026-10")).toMatch(/^https:\/\/wa\.me\/\?text=/);
  });
});
