import { describe, expect, it } from "vitest";
import { KG_PER_LB, perKgToPerLb, perLbToPerKg, toKg } from "./units";

describe("unidades (1 kg = 2 lb)", () => {
  it("usa el factor regional, no el internacional", () => {
    expect(KG_PER_LB).toBe(0.5);
  });

  it("convierte libras a kilos y deja los kilos igual", () => {
    expect(toKg(2, "lb")).toBe(1);
    expect(toKg(1, "kg")).toBe(1);
    expect(toKg(3, "lb")).toBe(1.5);
  });
});

describe("precios por libra y por kilo", () => {
  it("13.000 por libra son exactamente 26.000 por kilo, y al revés", () => {
    expect(perLbToPerKg(13000)).toBe(26000);
    expect(perKgToPerLb(26000)).toBe(13000);
  });

  it("ida y vuelta con decimales", () => {
    expect(perLbToPerKg(12500.5)).toBe(25001);
    expect(perKgToPerLb(25001)).toBe(12500.5);
  });

  it("redondea a 2 decimales lo que escriba el usuario", () => {
    expect(perLbToPerKg(0.333)).toBe(0.67);
    expect(perKgToPerLb(0.333)).toBe(0.17);
  });
});
