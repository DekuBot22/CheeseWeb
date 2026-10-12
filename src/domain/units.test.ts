import { describe, expect, it } from "vitest";
import { KG_PER_LB, formatWeight, perKgToPerLb, perLbToPerKg, splitWeight, toKg } from "./units";

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

describe("formatWeight (unidades enteras + gramos)", () => {
  it("45,38 kg son 45 kg 380 g, o 90 lb 380 g", () => {
    expect(formatWeight(45.38, "kg")).toBe("45 kg 380 g");
    expect(formatWeight(45.38, "lb")).toBe("90 lb 380 g");
  });

  it("pasado de 500 g la libra sube: 45,70 kg son 91 lb 200 g", () => {
    expect(formatWeight(45.7, "kg")).toBe("45 kg 700 g");
    expect(formatWeight(45.7, "lb")).toBe("91 lb 200 g");
  });

  it("omite los gramos en cero y la parte entera en cero", () => {
    expect(formatWeight(45, "kg")).toBe("45 kg");
    expect(formatWeight(45, "lb")).toBe("90 lb");
    expect(formatWeight(0.38, "kg")).toBe("380 g");
    expect(formatWeight(0.5, "lb")).toBe("1 lb");
    expect(formatWeight(0.25, "lb")).toBe("250 g");
  });

  it("sin ventas o con un valor inválido muestra cero", () => {
    expect(formatWeight(0, "kg")).toBe("0 kg");
    expect(formatWeight(0, "lb")).toBe("0 lb");
    expect(formatWeight(Number.NaN, "kg")).toBe("0 kg");
    expect(formatWeight(-3, "lb")).toBe("0 lb");
    expect(formatWeight(0.004, "kg")).toBe("0 kg");
  });

  it("no arrastra restos de decimales al sumar", () => {
    expect(formatWeight(0.1 + 0.2, "kg")).toBe("300 g");
    expect(formatWeight(5.0399999, "kg")).toBe("5 kg 40 g");
  });

  it("separa los miles con punto", () => {
    expect(formatWeight(1204.5, "kg")).toBe("1.204 kg 500 g");
  });

  it("splitWeight devuelve las dos partes", () => {
    expect(splitWeight(45.38, "lb")).toEqual({ whole: 90, grams: 380 });
  });
});
