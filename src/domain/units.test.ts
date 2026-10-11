import { describe, expect, it } from "vitest";
import { KG_PER_LB, toKg } from "./units";

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
