import { describe, expect, it } from "vitest";
import { updateClientSchema } from "./schemas";

describe("updateClientSchema", () => {
  it("acepta que falte una de las dos claves (regresión de zod 4)", () => {
    expect(updateClientSchema.safeParse({ phone: "3001234567" }).success).toBe(true);
    expect(updateClientSchema.safeParse({ notes: "Paga los viernes" }).success).toBe(true);
    expect(updateClientSchema.safeParse({}).success).toBe(true);
  });

  it("recorta, convierte vacío en null y deja sin tocar lo que no es texto", () => {
    expect(updateClientSchema.parse({ phone: "  300  ", notes: "   " })).toEqual({ phone: "300", notes: null });
    expect(updateClientSchema.parse({ phone: 5 })).toEqual({ phone: undefined, notes: undefined });
  });
});
