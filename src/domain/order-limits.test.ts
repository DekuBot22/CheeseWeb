import { describe, expect, it } from "vitest";
import { limitKeys, ORDER_LIMITS } from "./order-limits";

describe("limitKeys", () => {
  const checks = limitKeys("abc123", "rosa gómez");

  it("hay un límite por IP corto, uno por IP diario y uno por nombre", () => {
    expect(ORDER_LIMITS.map((l) => [l.id, l.seconds, l.max])).toEqual([
      ["ip10m", 600, 6],
      ["ipdia", 86400, 30],
      ["nombre", 3600, 3],
    ]);
  });

  it("las claves llevan prefijo y valor correcto según el alcance", () => {
    expect(checks.map((c) => c.key)).toEqual([
      "pedido:ip10m:abc123",
      "pedido:ipdia:abc123",
      "pedido:nombre:rosa gómez",
    ]);
    expect(checks.map((c) => c.scope)).toEqual(["ip", "ip", "nombre"]);
  });
});
