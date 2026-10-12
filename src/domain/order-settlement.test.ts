import { describe, expect, it } from "vitest";
import { applyPayment, previewOrderEdit, saleTimestamp, settleOrder, sumActivePayments } from "./order";

describe("settleOrder", () => {
  it("abono exacto → pagado, sin excedente", () => {
    expect(settleOrder(1000, 1000)).toEqual({ amountPaid: 1000, paymentStatus: "pagado", excess: 0 });
  });

  it("abono parcial y sin abonos", () => {
    expect(settleOrder(1000, 400)).toEqual({ amountPaid: 400, paymentStatus: "parcial", excess: 0 });
    expect(settleOrder(1000, 0)).toEqual({ amountPaid: 0, paymentStatus: "debe", excess: 0 });
  });

  it("tolera un centavo de diferencia", () => {
    expect(settleOrder(1000, 999.99).paymentStatus).toBe("pagado");
    expect(settleOrder(1000, 999.98).paymentStatus).toBe("parcial");
  });

  it("lo que sobra queda como excedente", () => {
    expect(settleOrder(1000, 1500)).toEqual({ amountPaid: 1000, paymentStatus: "pagado", excess: 500 });
  });

  it("un pedido anulado no cobra nada: todo lo abonado es excedente", () => {
    expect(settleOrder(1000, 600, true)).toEqual({ amountPaid: 0, paymentStatus: "debe", excess: 600 });
  });
});

describe("sumActivePayments", () => {
  it("no suma los abonos anulados", () => {
    expect(
      sumActivePayments([
        { amount: 500, voided_at: null },
        { amount: 300, voided_at: "2026-10-12T10:00:00Z" },
        { amount: 200 },
      ])
    ).toBe(700);
  });
});

describe("previewOrderEdit", () => {
  it("bajar el total por debajo de lo abonado pasa la diferencia a saldo a favor", () => {
    const p = previewOrderEdit({ total: 1000, paidSum: 800 }, 500);
    expect(p.after.paymentStatus).toBe("pagado");
    expect(p.creditDelta).toBe(300);
  });

  it("subir el total consume el excedente previo y deja el pedido parcial", () => {
    const p = previewOrderEdit({ total: 500, paidSum: 800 }, 1000);
    expect(p.before.excess).toBe(300);
    expect(p.after.paymentStatus).toBe("parcial");
    expect(p.creditDelta).toBe(-300);
  });

  it("sin abonos no mueve el saldo a favor", () => {
    expect(previewOrderEdit({ total: 1000, paidSum: 0 }, 2000).creditDelta).toBe(0);
  });
});

describe("applyPayment sobre settleOrder", () => {
  it("abono con excedente", () => {
    const a = applyPayment({ total: 1000, amount_paid: 400 }, 800);
    expect(a).toMatchObject({ appliedToOrder: 600, creditToAdd: 200, newAmountPaid: 1000, paymentStatus: "pagado" });
  });
});

describe("saleTimestamp", () => {
  const now = new Date("2026-10-12T03:00:00Z"); // en Bogotá aún es domingo 11 a las 10 p. m.

  it("sin fecha o con la fecha de hoy en Bogotá usa el instante actual", () => {
    expect(saleTimestamp(null, now)).toBe(now.toISOString());
    expect(saleTimestamp("2026-10-11", now)).toBe(now.toISOString());
  });

  it("una fecha pasada cae al mediodía de Bogotá", () => {
    expect(saleTimestamp("2026-10-09", now)).toBe("2026-10-09T17:00:00.000Z");
  });
});
