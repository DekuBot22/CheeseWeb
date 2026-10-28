import { describe, expect, it } from "vitest";
import { paymentDateError, paymentTimestamp } from "./payment-date";

// Pedido del 10 oct 2026 a las 3 p. m. en Bogotá. Hoy es 27 oct 2026 (mediodía en Bogotá).
const ORDER = "2026-10-10T20:00:00.000Z";
const NOW = new Date("2026-10-27T17:00:00.000Z");

describe("paymentDateError", () => {
  it("sin fecha no hay nada que validar", () => {
    expect(paymentDateError(undefined, ORDER, NOW)).toBeNull();
    expect(paymentDateError("", ORDER, NOW)).toBeNull();
  });
  it("acepta desde el día del pedido hasta hoy", () => {
    expect(paymentDateError("2026-10-10", ORDER, NOW)).toBeNull();
    expect(paymentDateError("2026-10-20", ORDER, NOW)).toBeNull();
    expect(paymentDateError("2026-10-27", ORDER, NOW)).toBeNull();
  });
  it("rechaza una fecha futura", () => {
    expect(paymentDateError("2026-10-28", ORDER, NOW)).toBe("La fecha del abono no puede ser futura");
  });
  it("rechaza un día anterior al pedido", () => {
    expect(paymentDateError("2026-10-09", ORDER, NOW)).toBe("El abono no puede ser anterior al pedido");
  });
  it("el día del pedido se compara en hora de Bogotá, no UTC", () => {
    // 11 oct 02:00 UTC = 10 oct 21:00 en Bogotá: el pedido es del día 10.
    expect(paymentDateError("2026-10-10", "2026-10-11T02:00:00.000Z", NOW)).toBeNull();
  });
});

describe("paymentTimestamp", () => {
  it("hoy o sin fecha: ahora", () => {
    expect(paymentTimestamp(undefined, ORDER, NOW)).toBe(NOW.toISOString());
    expect(paymentTimestamp("2026-10-27", ORDER, NOW)).toBe(NOW.toISOString());
  });
  it("un día pasado: ese día a las 12:00 de Bogotá", () => {
    expect(paymentTimestamp("2026-10-20", ORDER, NOW)).toBe("2026-10-20T17:00:00.000Z");
  });
  it("el mismo día del pedido nunca queda antes del pedido", () => {
    // Pedido a las 3 p. m.; mediodía del mismo día sería antes: queda en el instante del pedido.
    expect(paymentTimestamp("2026-10-10", ORDER, NOW)).toBe(ORDER);
  });
});
