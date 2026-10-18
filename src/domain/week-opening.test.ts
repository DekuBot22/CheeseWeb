import { describe, expect, it } from "vitest";
import { openingDateError } from "./week-opening";

const TODAY = "2026-10-14";

describe("openingDateError al abrir una semana", () => {
  it("sin aperturas previas sirve hoy o una fecha pasada", () => {
    expect(openingDateError([], TODAY, TODAY)).toBeNull();
    expect(openingDateError([], "2026-10-04", TODAY)).toBeNull();
  });

  it("rechaza fechas futuras, mal escritas o ya abiertas", () => {
    expect(openingDateError([], "2026-10-15", TODAY)).toMatch(/futura/);
    expect(openingDateError([], "2026-13-40", TODAY)).toBe("Fecha inválida");
    expect(openingDateError(["2026-10-10"], "2026-10-10", TODAY)).toMatch(/Ya hay/);
  });

  it("solo después de la última apertura vigente", () => {
    expect(openingDateError(["2026-10-10"], "2026-10-12", TODAY)).toBeNull();
    expect(openingDateError(["2026-10-10"], "2026-10-08", TODAY)).toMatch(/después de la última/);
  });
});

describe("openingDateError al mover una apertura", () => {
  const others = ["2026-10-03", "2026-10-12"]; // se mueve la del 10 entre estas dos... (no está en others)

  it("debe quedar entre la anterior y la siguiente", () => {
    expect(openingDateError(others, "2026-10-11", TODAY, "2026-10-10")).toBeNull();
    expect(openingDateError(others, "2026-10-04", TODAY, "2026-10-10")).toBeNull();
    expect(openingDateError(others, "2026-10-03", TODAY, "2026-10-10")).toMatch(/Ya hay/);
    expect(openingDateError(others, "2026-10-02", TODAY, "2026-10-10")).toMatch(/después del 3 oct 2026/);
    expect(openingDateError(others, "2026-10-13", TODAY, "2026-10-10")).toMatch(/antes del 12 oct 2026/);
  });

  it("la última apertura se puede mover hasta hoy, nunca al futuro", () => {
    expect(openingDateError(["2026-10-03"], "2026-10-14", TODAY, "2026-10-10")).toBeNull();
    expect(openingDateError(["2026-10-03"], "2026-10-15", TODAY, "2026-10-10")).toMatch(/futura/);
  });
});
