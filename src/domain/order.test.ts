import { describe, expect, it } from "vitest";
import { applyPayment, priceOrder, remainingOf } from "./order";

describe("remainingOf", () => {
  it("es lo que falta, nunca negativo, y acepta texto numérico", () => {
    expect(remainingOf({ total: 1000, amount_paid: 400 })).toBe(600);
    expect(remainingOf({ total: 1000, amount_paid: 1500 })).toBe(0);
    expect(remainingOf({ total: "1000.00" as unknown as number, amount_paid: "250.00" as unknown as number })).toBe(750);
  });
});

describe("priceOrder", () => {
  it("por cantidad: 3 lb a $20.000/kg son 1,5 kg = $30.000", () => {
    expect(priceOrder({ quantity: 3, unit: "lb" }, 20000)).toEqual({ quantity: 3, unit: "lb", total: 30000 });
  });

  it("por cantidad en kg", () => {
    expect(priceOrder({ quantity: 2, unit: "kg" }, 20000).total).toBe(40000);
  });

  it("por valor: $15.000 a $20.000/kg son 0,75 kg y el total queda exacto", () => {
    expect(priceOrder({ amount: 15000, quantity: 0, unit: "lb" }, 20000)).toEqual({
      quantity: 0.75,
      unit: "kg",
      total: 15000,
    });
  });

  it("por valor muy pequeño nunca baja de 0,01 kg", () => {
    expect(priceOrder({ amount: 1000, quantity: 0, unit: "kg" }, 5_000_000).quantity).toBe(0.01);
  });

  it("redondea a 2 decimales los kg equivalentes", () => {
    expect(priceOrder({ amount: 10000, quantity: 0, unit: "kg" }, 30000).quantity).toBe(0.33);
  });
});

describe("applyPayment", () => {
  it("un abono parcial deja el pedido en parcial", () => {
    expect(applyPayment({ total: 10000, amount_paid: 0 }, 4000)).toEqual({
      appliedToOrder: 4000,
      creditToAdd: 0,
      newAmountPaid: 4000,
      paymentStatus: "parcial",
    });
  });

  it("un abono exacto lo deja pagado", () => {
    expect(applyPayment({ total: 10000, amount_paid: 6000 }, 4000).paymentStatus).toBe("pagado");
  });

  it("si solo falta un centavo, queda pagado", () => {
    expect(applyPayment({ total: 10000, amount_paid: 9999.99 }, 0.005).paymentStatus).toBe("pagado");
  });

  it("si se paga de más, el excedente va a saldo a favor", () => {
    expect(applyPayment({ total: 10000, amount_paid: 0 }, 12000)).toEqual({
      appliedToOrder: 10000,
      creditToAdd: 2000,
      newAmountPaid: 10000,
      paymentStatus: "pagado",
    });
  });

  it("un pedido ya pagado manda todo el abono a saldo a favor", () => {
    expect(applyPayment({ total: 10000, amount_paid: 10000 }, 500)).toEqual({
      appliedToOrder: 0,
      creditToAdd: 500,
      newAmountPaid: 10000,
      paymentStatus: "pagado",
    });
  });
});
