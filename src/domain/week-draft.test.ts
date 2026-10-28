import { describe, expect, it } from "vitest";
import { draftInput, setEdge, setOngoing, startDraft, tapDay } from "./week-draft";
import { planWeekRange, type OpeningRef } from "./week-range";

const TODAY = "2026-10-27";
const ref = (id: string, date: string): OpeningRef => ({ id, date });
const three = [ref("a", "2026-10-10"), ref("b", "2026-10-18"), ref("c", "2026-10-24")];
const real = [ref("a", "2026-10-18"), ref("b", "2026-10-27")];

describe("startDraft", () => {
  it("tocar un día dentro de una semana marcada la selecciona (mueve el inicio)", () => {
    expect(startDraft(three, "2026-10-20", TODAY)).toEqual({ id: "b", from: "2026-10-18", last: "2026-10-23", edge: "from" });
  });

  it("la semana en curso queda sin fin", () => {
    expect(startDraft(three, "2026-10-26", TODAY)).toEqual({ id: "c", from: "2026-10-24", last: null, edge: "from" });
  });

  it("un día sin semana crea una nueva hasta el día antes de la siguiente apertura", () => {
    expect(startDraft(real, "2026-10-10", TODAY)).toEqual({ from: "2026-10-10", last: "2026-10-17", edge: "last" });
    expect(startDraft([], "2026-10-10", TODAY)).toEqual({ from: "2026-10-10", last: null, edge: "last" });
  });

  it("no deja elegir días futuros", () => {
    expect(startDraft(three, "2026-10-28", TODAY)).toBeNull();
  });
});

describe("tapDay, setEdge y setOngoing", () => {
  const base = startDraft(three, "2026-10-20", TODAY)!;

  it("mueve el borde elegido", () => {
    expect(tapDay(base, "2026-10-19", TODAY)).toMatchObject({ from: "2026-10-19", last: "2026-10-23" });
    expect(tapDay(setEdge(base, "last"), "2026-10-22", TODAY)).toMatchObject({ from: "2026-10-18", last: "2026-10-22" });
  });

  it("tocar hoy en el fin deja la semana en curso; los futuros se ignoran", () => {
    expect(tapDay(setEdge(base, "last"), TODAY, TODAY).last).toBeNull();
    expect(tapDay(base, "2026-10-28", TODAY)).toBe(base);
  });

  it("desmarcar «sigue en curso» pone el fin en ayer (equivale a abrir hoy)", () => {
    const current = startDraft(three, "2026-10-26", TODAY)!;
    expect(setOngoing(current, false, TODAY).last).toBe("2026-10-26");
    expect(setOngoing(setOngoing(current, false, TODAY), true, TODAY).last).toBeNull();
  });
});

describe("el borrador reutiliza planWeekRange (caso real del dueño)", () => {
  it("tocar el 10: borrador 10–17 y el plan inserta solo el 10", () => {
    const draft = startDraft(real, "2026-10-10", TODAY)!;
    expect(draftInput(draft)).toEqual({ from: "2026-10-10", until: "2026-10-18", editingId: undefined });
    const plan = planWeekRange(real, draftInput(draft), TODAY);
    expect(plan).toMatchObject({ ok: true, steps: [{ kind: "insert", dates: ["2026-10-10"] }] });
  });

  it("seleccionar la del 27 y poner el inicio en 24 mueve esa apertura", () => {
    const draft = tapDay(startDraft(real, "2026-10-27", TODAY)!, "2026-10-24", TODAY);
    expect(draftInput(draft)).toEqual({ from: "2026-10-24", until: null, editingId: "b" });
    expect(planWeekRange(real, draftInput(draft), TODAY)).toMatchObject({ ok: true, steps: [{ kind: "move", id: "b", date: "2026-10-24" }] });
  });

  it("ponerle fin a la semana en curso con ayer inserta hoy", () => {
    const draft = setOngoing(startDraft(three, "2026-10-26", TODAY)!, false, TODAY);
    expect(planWeekRange(three, draftInput(draft), TODAY)).toMatchObject({ ok: true, steps: [{ kind: "insert", dates: ["2026-10-27"] }] });
  });

  it("dejar en curso una semana que tiene otra después da el error del dominio", () => {
    const draft = tapDay(setEdge(startDraft(three, "2026-10-20", TODAY)!, "last"), TODAY, TODAY);
    expect(planWeekRange(three, draftInput(draft), TODAY)).toMatchObject({ ok: false, field: "until", error: expect.stringMatching(/anula la semana/) });
  });
});
