import { describe, expect, it } from "vitest";
import { buildLedger, providerTotals, remainingForDiscount } from "./provider-ledger";
import type { ProviderDiscount, ProviderPayment, Purchase } from "./purchase";

const purchase = (id: string, date: string, total: number, createdAt: string, over: Partial<Purchase> = {}): Purchase => ({
  id,
  purchase_date: date,
  kg: 10,
  total_cost: total,
  description: null,
  created_at: createdAt,
  ...over,
});

const payment = (id: string, date: string, amount: number, createdAt: string, over: Partial<ProviderPayment> = {}): ProviderPayment => ({
  id,
  payment_date: date,
  amount,
  method: null,
  notes: null,
  created_at: createdAt,
  ...over,
});

describe("buildLedger", () => {
  it("acumula el saldo de lo más viejo a lo más nuevo (compra suma, pago resta)", () => {
    const ledger = buildLedger(
      [purchase("p2", "2026-10-10", 900, "2026-10-10T12:00:00Z"), purchase("p1", "2026-10-03", 600, "2026-10-03T12:00:00Z")],
      [payment("g1", "2026-10-05", 400, "2026-10-05T12:00:00Z")]
    );
    expect(ledger.map((r) => [r.key, r.saldo])).toEqual([
      ["c-p1", 600],
      ["p-g1", 200],
      ["c-p2", 1100],
    ]);
  });

  it("a igual fecha manda la hora de registro", () => {
    const ledger = buildLedger(
      [purchase("p1", "2026-10-10", 500, "2026-10-10T18:00:00Z")],
      [payment("g1", "2026-10-10", 500, "2026-10-10T09:00:00Z")]
    );
    expect(ledger.map((r) => r.key)).toEqual(["p-g1", "c-p1"]);
    expect(ledger.map((r) => r.saldo)).toEqual([-500, 0]);
  });

  it("arma el detalle con kg y descripción, o método y nota", () => {
    const ledger = buildLedger(
      [purchase("p1", "2026-10-03", 600, "2026-10-03T12:00:00Z", { kg: 12.5, description: "Lote del sábado" })],
      [payment("g1", "2026-10-04", 100, "2026-10-04T12:00:00Z", { method: "Nequi", notes: "abono" })]
    );
    expect(ledger[0].detail).toBe("12.5 kg · Lote del sábado");
    expect(ledger[1].detail).toBe("Nequi · abono");
  });

  it("sin movimientos devuelve una lista vacía", () => {
    expect(buildLedger([], [])).toEqual([]);
  });
});

const discount = (
  id: string,
  date: string,
  amount: number,
  createdAt: string,
  over: Partial<ProviderDiscount> = {}
): ProviderDiscount => ({
  id,
  discount_date: date,
  amount,
  reason: "salado",
  purchase_id: null,
  kg: null,
  notes: null,
  created_at: createdAt,
  ...over,
});

describe("buildLedger con descuentos", () => {
  it("el descuento resta del saldo y respeta el orden por fecha y hora de registro", () => {
    const ledger = buildLedger(
      [purchase("p1", "2026-10-03", 900, "2026-10-03T12:00:00Z")],
      [payment("g1", "2026-10-05", 400, "2026-10-05T12:00:00Z")],
      [
        discount("d2", "2026-10-05", 50, "2026-10-05T15:00:00Z"),
        discount("d1", "2026-10-04", 100, "2026-10-04T12:00:00Z"),
      ]
    );
    expect(ledger.map((r) => [r.key, r.saldo])).toEqual([
      ["c-p1", 900],
      ["d-d1", 800],
      ["p-g1", 400],
      ["d-d2", 350],
    ]);
    expect(ledger[1].descuento).toBe(100);
  });

  it("arma el detalle del descuento con motivo, kg, nota y la compra asociada", () => {
    const ledger = buildLedger(
      [purchase("p1", "2026-10-03", 900, "2026-10-03T12:00:00Z")],
      [],
      [
        discount("d1", "2026-10-04", 30000, "2026-10-04T12:00:00Z", {
          kg: 6,
          notes: "muy salado",
          purchase_id: "p1",
        }),
      ]
    );
    expect(ledger[1].kind).toBe("descuento");
    expect(ledger[1].detail).toBe("Queso salado · 6 kg · muy salado · compra del 3 oct 2026");
  });
});

describe("providerTotals", () => {
  it("el saldo es todo lo comprado menos todo lo pagado", () => {
    expect(providerTotals([{ total_cost: 600 }, { total_cost: 400 }], [{ amount: 250 }])).toEqual({
      comprado: 1000,
      pagado: 250,
      descontado: 0,
      saldo: 750,
    });
  });

  it("los descuentos también reducen lo que se le debe", () => {
    expect(
      providerTotals([{ total_cost: 600 }, { total_cost: 400 }], [{ amount: 250 }], [{ amount: 100 }])
    ).toEqual({ comprado: 1000, pagado: 250, descontado: 100, saldo: 650 });
  });
});

describe("remainingForDiscount", () => {
  const compra = { id: "p1", total_cost: 900000 };

  it("descuenta de la compra lo ya descontado con ese purchase_id", () => {
    expect(
      remainingForDiscount(compra, [
        { purchase_id: "p1", amount: 100000 },
        { purchase_id: "p1", amount: 50000 },
        { purchase_id: "otra", amount: 999999 },
        { purchase_id: null, amount: 999999 },
      ])
    ).toBe(750000);
  });

  it("nunca baja de 0", () => {
    expect(remainingForDiscount(compra, [{ purchase_id: "p1", amount: 900000 }])).toBe(0);
    expect(remainingForDiscount(compra, [{ purchase_id: "p1", amount: 950000 }])).toBe(0);
  });
});
