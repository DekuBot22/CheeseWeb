import { describe, expect, it } from "vitest";
import { weekTitle } from "./format";

describe("weekTitle", () => {
  it("deja la etiqueta igual en semanas de 7 días", () => {
    expect(weekTitle("10 oct", 7)).toBe("10 oct");
  });

  it("agrega la duración cuando la semana es más larga o más corta", () => {
    expect(weekTitle("10 oct", 9)).toBe("10 oct · 9 días");
    expect(weekTitle("10 oct", 2)).toBe("10 oct · 2 días");
    expect(weekTitle("10 oct", 1)).toBe("10 oct · 1 día");
  });
});
