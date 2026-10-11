import { describe, expect, it } from "vitest";
import { registerPaymentSchema } from "@/features/orders/schemas";
import { createProviderPaymentSchema, createPurchaseSchema } from "./schemas";

// Los formularios omiten del JSON los campos opcionales vacíos (`campo || undefined`).
// En zod 4 eso solo funciona si el campo acepta `undefined`: estas pruebas
// protegen ese comportamiento, que ya falló una vez en producción.
describe("campos opcionales que no viajan en el JSON", () => {
  it("una compra sin descripción es válida", () => {
    const r = createPurchaseSchema.safeParse({ purchase_date: "2026-10-10", kg: 5, total_cost: 100 });
    expect(r.success && r.data.description).toBeNull();
  });

  it("un pago al proveedor sin método ni nota es válido", () => {
    const r = createProviderPaymentSchema.safeParse({ payment_date: "2026-10-10", amount: 5 });
    expect(r.success && [r.data.method, r.data.notes]).toEqual([null, null]);
  });

  it("un abono de cliente sin método es válido", () => {
    const r = registerPaymentSchema.safeParse({ amount: 1000 });
    expect(r.success && r.data.method).toBeNull();
  });

  it("un abono con método lo recorta", () => {
    const r = registerPaymentSchema.safeParse({ amount: 1000, method: "  Nequi " });
    expect(r.success && r.data.method).toBe("Nequi");
  });
});
