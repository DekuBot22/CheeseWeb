import { describe, expect, it } from "vitest";
import { withWeekParam } from "./week-param";

describe("withWeekParam", () => {
  it("añade la semana a un enlace limpio", () => {
    expect(withWeekParam("/admin/pedidos", "2026-10-10")).toBe("/admin/pedidos?semana=2026-10-10");
  });

  it("conserva los demás parámetros y reemplaza la semana", () => {
    expect(withWeekParam("/admin/pedidos?estado=pendiente&semana=2026-10-03", "2026-10-10")).toBe(
      "/admin/pedidos?estado=pendiente&semana=2026-10-10"
    );
  });

  it("con semana null la quita y deja el resto", () => {
    expect(withWeekParam("/admin/pedidos?estado=pendiente&semana=2026-10-03", null)).toBe("/admin/pedidos?estado=pendiente");
    expect(withWeekParam("/admin?semana=2026-10-03", null)).toBe("/admin");
  });

  it("no toca enlaces sin semana ni parámetros y conserva el ancla", () => {
    expect(withWeekParam("/admin", undefined)).toBe("/admin");
    expect(withWeekParam("/admin/ajustes#semanas", "2026-10-10")).toBe("/admin/ajustes?semana=2026-10-10#semanas");
  });
});
