import { describe, expect, it } from "vitest";
import { hrefWith, type OrdersFilterValues } from "./order-filters";

const base: OrdersFilterValues = { q: "", estado: "todos", pago: "todos", tipo: "todos", periodo: "todos" };

describe("hrefWith", () => {
  it("sin filtros da la ruta limpia", () => {
    expect(hrefWith(base, {})).toBe("/admin/pedidos");
  });

  it("conserva los demás filtros al cambiar uno", () => {
    expect(hrefWith({ ...base, pago: "debe" }, { estado: "pendiente" })).toBe("/admin/pedidos?estado=pendiente&pago=debe");
  });

  it("conserva la semana elegida al cambiar un filtro, y no aparece si es la actual (null)", () => {
    expect(hrefWith({ ...base, semana: "2026-10-10" }, { estado: "pendiente" })).toBe(
      "/admin/pedidos?estado=pendiente&semana=2026-10-10"
    );
    expect(hrefWith({ ...base, semana: null }, { estado: "pendiente" })).toBe("/admin/pedidos?estado=pendiente");
  });
});
