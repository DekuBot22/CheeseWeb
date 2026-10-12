import { describe, expect, it } from "vitest";
import { activeOnly, isVoided } from "./void";

describe("anulación", () => {
  it("una fila sin voided_at (o con null) está vigente", () => {
    expect(isVoided({})).toBe(false);
    expect(isVoided({ voided_at: null })).toBe(false);
    expect(isVoided({ voided_at: "2026-10-12T10:00:00Z", void_reason: "Duplicado" })).toBe(true);
  });

  it("activeOnly deja solo las vigentes y no muta la lista", () => {
    const rows = [{ id: 1 }, { id: 2, voided_at: "2026-10-12T10:00:00Z" }, { id: 3, voided_at: null }];
    expect(activeOnly(rows).map((r) => r.id)).toEqual([1, 3]);
    expect(rows).toHaveLength(3);
  });
});
