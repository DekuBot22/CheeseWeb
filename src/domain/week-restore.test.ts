import { describe, expect, it } from "vitest";
import { restorePlan } from "./week-restore";

const open = (id: string, date: string) => ({ id, date });

describe("restorePlan", () => {
  it("deshacer una semana nueva: anula la que sobra", () => {
    expect(restorePlan([open("a", "2026-10-10"), open("b", "2026-10-18")], ["2026-10-18"])).toEqual({ void: ["a"], add: [] });
  });
  it("deshacer una anulación: vuelve a abrir la fecha", () => {
    expect(restorePlan([open("b", "2026-10-18")], ["2026-10-10", "2026-10-18"])).toEqual({ void: [], add: ["2026-10-10"] });
  });
  it("deshacer un cambio de fecha: anula la nueva y abre la vieja", () => {
    expect(restorePlan([open("n", "2026-10-11"), open("b", "2026-10-18")], ["2026-10-10", "2026-10-18"])).toEqual({
      void: ["n"],
      add: ["2026-10-10"],
    });
  });
  it("sin diferencias no hace nada", () => {
    expect(restorePlan([open("a", "2026-10-10")], ["2026-10-10"])).toEqual({ void: [], add: [] });
  });
});
