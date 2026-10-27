import { describe, expect, it } from "vitest";
import { buildCalendar, dayStart, weekOf } from "./week-calendar";
import { planWeekRange, weekUntil, type OpeningRef, type WeekRangePlan } from "./week-range";

const TODAY = "2026-10-27"; // martes
const NOW = new Date(`${TODAY}T12:00:00-05:00`);
const ref = (id: string, date: string): OpeningRef => ({ id, date });

function okPlan(plan: WeekRangePlan) {
  if (!plan.ok) throw new Error(`esperaba un plan válido, salió: ${plan.error}`);
  return plan;
}
const weekAt = (after: string[], date: string) => weekOf(buildCalendar(after, NOW), dayStart(date));

describe("planWeekRange: crear", () => {
  it("el caso del usuario: del 18 al 24 solo inserta el 24 y el 24 abre la semana en curso", () => {
    const plan = okPlan(planWeekRange([ref("a", "2026-10-18")], { from: "2026-10-18", until: "2026-10-24" }, TODAY));
    expect(plan.steps).toEqual([{ kind: "insert", dates: ["2026-10-24"] }]);
    expect(plan.after).toEqual(["2026-10-18", "2026-10-24"]);
    expect(weekAt(plan.after, "2026-10-20")).toMatchObject({ from: "2026-10-18", to: "2026-10-23", days: 6 });
    expect(weekAt(plan.after, "2026-10-24")).toMatchObject({ from: "2026-10-24", to: "2026-10-30" });
  });

  it("desde el 24 sigue en curso da lo mismo", () => {
    const plan = okPlan(planWeekRange([ref("a", "2026-10-18")], { from: "2026-10-24", until: null }, TODAY));
    expect(plan.steps).toEqual([{ kind: "insert", dates: ["2026-10-24"] }]);
  });

  it("registrar la semana del 12 antes de la del 18: 10-11 queda automática de 2 días", () => {
    const plan = okPlan(planWeekRange([ref("a", "2026-10-18"), ref("b", "2026-10-24")], { from: "2026-10-12", until: "2026-10-18" }, TODAY));
    expect(plan.steps).toEqual([{ kind: "insert", dates: ["2026-10-12"] }]);
    expect(weekAt(plan.after, "2026-10-11")).toMatchObject({ from: "2026-10-10", to: "2026-10-11", days: 2, manual: false });
    expect(weekAt(plan.after, "2026-10-15")).toMatchObject({ from: "2026-10-12", to: "2026-10-17", manual: true });
  });

  it("si el hasta cae antes de la siguiente apertura, lo que sobra forma su propia semana", () => {
    const plan = okPlan(planWeekRange([ref("b", "2026-10-24")], { from: "2026-10-12", until: "2026-10-15" }, TODAY));
    expect(plan.steps).toEqual([{ kind: "insert", dates: ["2026-10-12", "2026-10-15"] }]);
    expect(weekAt(plan.after, "2026-10-20")).toMatchObject({ from: "2026-10-15", to: "2026-10-23" });
  });

  it("una semana de un solo día vale", () => {
    const plan = okPlan(planWeekRange([ref("b", "2026-10-18")], { from: "2026-10-24", until: "2026-10-25" }, TODAY));
    expect(weekAt(plan.after, "2026-10-24")).toMatchObject({ from: "2026-10-24", to: "2026-10-24", days: 1 });
  });

  it("rechaza fechas futuras, mal escritas o fin antes del inicio", () => {
    expect(planWeekRange([], { from: "2026-10-28", until: null }, TODAY)).toMatchObject({ ok: false, field: "from", error: expect.stringMatching(/futuro/) });
    expect(planWeekRange([], { from: "2026-10-20", until: "2026-10-28" }, TODAY)).toMatchObject({ ok: false, field: "until", error: expect.stringMatching(/futuro/) });
    expect(planWeekRange([], { from: "2026-13-40", until: null }, TODAY)).toMatchObject({ ok: false, field: "from", error: "Fecha inválida" });
    expect(planWeekRange([], { from: "2026-10-20", until: "2026-10-20" }, TODAY)).toMatchObject({ ok: false, field: "until", error: expect.stringMatching(/después del inicio/) });
    expect(planWeekRange([], { from: "2026-10-20", until: "2026-10-19" }, TODAY)).toMatchObject({ ok: false, field: "until" });
  });

  it("rechaza un traslape y dice la fecha", () => {
    const plan = planWeekRange([ref("a", "2026-10-18")], { from: "2026-10-12", until: "2026-10-24" }, TODAY);
    expect(plan).toMatchObject({ ok: false, field: "until", error: expect.stringMatching(/ya empieza otra semana \(el 18 oct 2026\)/) });
  });

  it('"sigue en curso" con aperturas posteriores pide el hasta', () => {
    const plan = planWeekRange([ref("a", "2026-10-18")], { from: "2026-10-12", until: null }, TODAY);
    expect(plan).toMatchObject({ ok: false, field: "until", error: expect.stringMatching(/Indica hasta cuándo/) });
  });

  it("rechaza lo que ya está así", () => {
    const plan = planWeekRange([ref("a", "2026-10-18"), ref("b", "2026-10-24")], { from: "2026-10-18", until: "2026-10-24" }, TODAY);
    expect(plan).toMatchObject({ ok: false, error: "Esa semana ya está así" });
  });
});

describe("planWeekRange: editar", () => {
  const openings = [ref("a", "2026-10-12"), ref("b", "2026-10-18"), ref("c", "2026-10-24")];

  it("mover solo el inicio dentro de los vecinos es un movimiento", () => {
    const plan = okPlan(planWeekRange(openings, { editingId: "b", from: "2026-10-17", until: "2026-10-24" }, TODAY));
    expect(plan.steps).toEqual([{ kind: "move", id: "b", date: "2026-10-17" }]);
    expect(plan.after).toEqual(["2026-10-12", "2026-10-17", "2026-10-24"]);
  });

  it("el inicio no puede pasar la semana anterior ni caer en otra apertura", () => {
    expect(planWeekRange(openings, { editingId: "b", from: "2026-10-12", until: "2026-10-24" }, TODAY)).toMatchObject({ ok: false, field: "from", error: expect.stringMatching(/Ya hay/) });
    expect(planWeekRange(openings, { editingId: "b", from: "2026-10-11", until: "2026-10-24" }, TODAY)).toMatchObject({ ok: false, field: "from", error: expect.stringMatching(/después del 12 oct 2026/) });
  });

  it("fin más tarde: primero la siguiente, luego esta; fin más temprano: al revés", () => {
    const later = okPlan(planWeekRange([ref("a", "2026-10-12"), ref("b", "2026-10-18"), ref("c", "2026-10-22")], { editingId: "b", from: "2026-10-19", until: "2026-10-24" }, TODAY));
    expect(later.steps).toEqual([
      { kind: "move", id: "c", date: "2026-10-24" },
      { kind: "move", id: "b", date: "2026-10-19" },
    ]);
    const earlier = okPlan(planWeekRange(openings, { editingId: "b", from: "2026-10-19", until: "2026-10-22" }, TODAY));
    expect(earlier.steps).toEqual([
      { kind: "move", id: "b", date: "2026-10-19" },
      { kind: "move", id: "c", date: "2026-10-22" },
    ]);
  });

  it("el fin debe quedar antes de la apertura que sigue a la siguiente", () => {
    const plan = planWeekRange([ref("a", "2026-10-12"), ref("b", "2026-10-18"), ref("c", "2026-10-22")], { editingId: "a", from: "2026-10-12", until: "2026-10-23" }, TODAY);
    expect(plan).toMatchObject({ ok: false, field: "until", error: expect.stringMatching(/antes del 22 oct 2026/) });
  });

  it("ponerle fin a la semana en curso inserta esa fecha (y mueve el inicio si cambió)", () => {
    const plan = okPlan(planWeekRange([ref("a", "2026-10-12")], { editingId: "a", from: "2026-10-13", until: "2026-10-24" }, TODAY));
    expect(plan.steps).toEqual([
      { kind: "move", id: "a", date: "2026-10-13" },
      { kind: "insert", dates: ["2026-10-24"] },
    ]);
  });

  it('no deja pasar a "en curso" si existe una semana después', () => {
    const plan = planWeekRange(openings, { editingId: "b", from: "2026-10-18", until: null }, TODAY);
    expect(plan).toMatchObject({ ok: false, field: "until", error: expect.stringMatching(/anula la semana del 24 oct 2026/) });
  });

  it("sin cambios es un error", () => {
    expect(planWeekRange(openings, { editingId: "b", from: "2026-10-18", until: "2026-10-24" }, TODAY)).toMatchObject({ ok: false, error: "Esa semana ya está así" });
  });
});

describe("planWeekRange: invariante", () => {
  it("después de varios planes válidos cada día cae en exactamente una semana, sin huecos", () => {
    let current: OpeningRef[] = [];
    const plans: Parameters<typeof planWeekRange>[1][] = [
      { from: "2026-10-18", until: "2026-10-24" },
      { from: "2026-10-12", until: "2026-10-18" },
      { from: "2026-10-20", until: "2026-10-22", editingId: "x1" },
    ];
    let n = 0;
    for (const input of plans) {
      const plan = planWeekRange(current, input, TODAY);
      if (!plan.ok) continue;
      current = plan.after.map((date) => current.find((o) => o.date === date) ?? ref(`x${++n}`, date));
    }
    const cal = buildCalendar(current.map((o) => o.date), NOW);
    let day = "2026-10-12";
    let covered = 0;
    while (day <= TODAY) {
      const w = weekOf(cal, dayStart(day));
      expect(w.from <= day && day <= w.to).toBe(true);
      covered++;
      day = new Date(dayStart(day).getTime() + 36 * 3600 * 1000).toISOString().slice(0, 10);
    }
    expect(covered).toBe(16);
  });
});

describe("weekUntil", () => {
  it("es el inicio de la siguiente semana o null si es la en curso", () => {
    expect(weekUntil(["2026-10-18", "2026-10-24"], "2026-10-18")).toBe("2026-10-24");
    expect(weekUntil(["2026-10-18", "2026-10-24"], "2026-10-24")).toBeNull();
  });
});
