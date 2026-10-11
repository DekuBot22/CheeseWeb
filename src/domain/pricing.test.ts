import { describe, expect, it } from "vitest";
import { profitPerLb, unitProfit } from "./pricing";

describe("unitProfit", () => {
  it("precio 13.000 y costo 11.000 dejan 2.000 por libra (≈15,4 %)", () => {
    const r = unitProfit(13000, 11000);
    expect(r.ganancia).toBe(2000);
    expect(r.margen).toBeCloseTo(15.38, 2);
  });

  it("con precio 0 el margen es 0", () => {
    expect(unitProfit(0, 500)).toEqual({ ganancia: -500, margen: 0 });
  });

  it("si el costo supera al precio la ganancia es negativa", () => {
    expect(unitProfit(10000, 12000).ganancia).toBe(-2000);
  });
});

describe("profitPerLb", () => {
  it("400.000 de ganancia con 100 kg (200 lb) son 2.000 por libra", () => {
    expect(profitPerLb(400000, 100)).toBe(2000);
  });

  it("sin kilos vendidos no hay ganancia por libra", () => {
    expect(profitPerLb(1000, 0)).toBeNull();
  });
});
