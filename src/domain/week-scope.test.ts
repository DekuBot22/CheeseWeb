import { describe, expect, it } from "vitest";
import { isEmptyWeek, weeklySeries, type StatOrder } from "./accounting";
import { receivables, type OpenOrder } from "./receivables";
import { buildCalendar, currentWeek, lastWeeks } from "./week-calendar";
import { inWeek, inWeekDate, resolveWeek, scopeOrders } from "./week-scope";

const at = (isoLocal: string) => new Date(`${isoLocal}-05:00`);
const now = at("2026-10-27T10:00:00");
// Aperturas a mano: 10 oct (semana de 8 días), 18 oct y 24 oct (en curso).
const cal = buildCalendar(["2026-10-10", "2026-10-18", "2026-10-24"], now);

describe("resolveWeek", () => {
  it("sin parámetro, inválido o futuro da la semana actual y la URL limpia", () => {
    for (const value of [undefined, "", "hola", "2026-13-45", "2027-01-01"]) {
      const s = resolveWeek(cal, value);
      expect(s.isCurrent).toBe(true);
      expect(s.param).toBeNull();
      expect(s.week.from).toBe("2026-10-24");
    }
  });

  it("una fecha dentro de la semana actual también es la actual (sin parámetro)", () => {
    const s = resolveWeek(cal, "2026-10-26");
    expect(s.isCurrent).toBe(true);
    expect(s.param).toBeNull();
  });

  it("una fecha a mitad de una semana abierta a mano da esa semana con su primer día como parámetro", () => {
    const s = resolveWeek(cal, "2026-10-14");
    expect(s.isCurrent).toBe(false);
    expect(s.week.from).toBe("2026-10-10");
    expect(s.week.to).toBe("2026-10-17");
    expect(s.param).toBe("2026-10-10");
  });

  it("antes de la primera apertura rige sábado a viernes", () => {
    const s = resolveWeek(cal, "2026-10-07");
    expect(s.week.from).toBe("2026-10-03");
    expect(s.week.to).toBe("2026-10-09");
    expect(s.param).toBe("2026-10-03");
  });

  it("sin aperturas no deja ver el futuro", () => {
    const empty = buildCalendar([], now);
    const s = resolveWeek(empty, "2026-11-20");
    expect(s.isCurrent).toBe(true);
    expect(s.param).toBeNull();
  });
});

describe("inWeek / inWeekDate: bordes en hora de Bogotá", () => {
  const week = resolveWeek(cal, "2026-10-14").week; // 10 al 17 oct

  it("el último minuto del día final cuenta; el primero del día siguiente no", () => {
    expect(inWeek(week, "2026-10-17T23:59:59-05:00")).toBe(true);
    expect(inWeek(week, "2026-10-18T00:00:30-05:00")).toBe(false);
    expect(inWeek(week, "2026-10-10T00:00:00-05:00")).toBe(true);
    expect(inWeek(week, "2026-10-09T23:59:59-05:00")).toBe(false);
  });

  it("viernes 23:59 vs sábado 00:30 antes de la primera apertura", () => {
    const old = resolveWeek(cal, "2026-10-07").week; // sáb 3 a vie 9
    expect(inWeek(old, "2026-10-09T23:59:00-05:00")).toBe(true);
    expect(inWeek(old, "2026-10-10T00:30:00-05:00")).toBe(false);
  });

  it("las columnas de fecha usan from..to ambos incluidos", () => {
    expect(inWeekDate(week, "2026-10-10")).toBe(true);
    expect(inWeekDate(week, "2026-10-17")).toBe(true);
    expect(inWeekDate(week, "2026-10-18")).toBe(false);
  });
});

describe("scopeOrders", () => {
  const orders = [{ created_at: "2026-10-11T12:00:00-05:00" }, { created_at: "2026-10-20T12:00:00-05:00" }];
  it("filtra por semana y con null devuelve todo", () => {
    expect(scopeOrders(orders, resolveWeek(cal, "2026-10-12").week)).toHaveLength(1);
    expect(scopeOrders(orders, null)).toHaveLength(2);
  });
});

describe("cuadre con Ganancias", () => {
  const mk = (created_at: string, total: number, paid: number, id: string): StatOrder & OpenOrder => ({
    id,
    client_id: null,
    client_name: `Cliente ${id}`,
    quantity: 2,
    unit: "kg",
    total,
    amount_paid: paid,
    cost_per_kg_snapshot: 22000,
    created_at,
    voided_at: null,
  });
  const orders = [
    mk("2026-10-06T10:00:00-05:00", 50000, 50000, "a"),
    mk("2026-10-11T10:00:00-05:00", 100000, 30000, "b"),
    mk("2026-10-17T23:00:00-05:00", 60000, 0, "c"),
    mk("2026-10-18T00:30:00-05:00", 40000, 10000, "d"),
    mk("2026-10-25T10:00:00-05:00", 80000, 80000, "e"),
    mk("2026-10-26T10:00:00-05:00", 20000, 5000, "f"),
  ];

  it("para cada semana, la deuda de sus pedidos = vendido − cobrado de Ganancias", () => {
    const weeks = lastWeeks(cal, 4, currentWeek(cal));
    const series = weeklySeries({ orders, purchases: [], providerPayments: [] }, weeks);
    weeks.forEach((week, i) => {
      const debt = receivables(scopeOrders(orders, week), now).total;
      expect(debt).toBe(series[i].stats.revenue - series[i].stats.collected);
    });
  });

  it("Inicio (2 semanas) y Ganancias (12 semanas) dan el mismo punto para la semana elegida", () => {
    const week = resolveWeek(cal, "2026-10-12").week;
    const data = { orders, purchases: [], providerPayments: [] };
    const two = weeklySeries(data, lastWeeks(cal, 2, week));
    const twelve = weeklySeries(data, lastWeeks(cal, 12, week));
    expect(two[two.length - 1]).toEqual(twelve[twelve.length - 1]);
    expect(isEmptyWeek(two[1])).toBe(false);
  });
});
