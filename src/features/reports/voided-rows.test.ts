import { describe, expect, it } from "vitest";
import { buildVoidedRows } from "./voided-rows";

const VOID = "2026-10-12T10:00:00Z";

describe("buildVoidedRows", () => {
  it("lista solo lo anulado, lo más reciente primero, con su motivo", () => {
    const rows = buildVoidedRows({
      orders: [
        {
          id: "o1", client_id: "c1", client_name: "Ana", quantity: 2, unit: "kg", cheese_type: "semi", salt_level: "bajo",
          price_per_kg_snapshot: 1000, cost_per_kg_snapshot: 0, total: 2000, amount_paid: 0, payment_status: "debe",
          status: "pendiente", created_at: "2026-10-05T15:00:00Z", voided_at: VOID, void_reason: "Duplicado",
        },
        {
          id: "o2", client_id: "c1", client_name: "Ana", quantity: 1, unit: "kg", cheese_type: "semi", salt_level: "bajo",
          price_per_kg_snapshot: 1000, cost_per_kg_snapshot: 0, total: 1000, amount_paid: 0, payment_status: "debe",
          status: "pendiente", created_at: "2026-10-06T15:00:00Z",
        },
      ],
      payments: [
        { id: "a1", order_id: "o1", amount: 500, method: null, created_at: "2026-10-06T15:00:00Z", voided_at: "2026-10-13T10:00:00Z", void_reason: "Error", orders: { client_name: "Ana" } },
      ],
      purchases: [],
      providerPayments: [],
      discounts: [],
    });
    expect(rows.map((r) => [r.tipo, r.monto, r.motivo])).toEqual([
      ["Abono", 500, "Error"],
      ["Pedido", 2000, "Duplicado"],
    ]);
  });

  it("sin nada anulado devuelve una lista vacía", () => {
    expect(buildVoidedRows({ orders: [], payments: [], purchases: [], providerPayments: [], discounts: [] })).toEqual([]);
  });
});
