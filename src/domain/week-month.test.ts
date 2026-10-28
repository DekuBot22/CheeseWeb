import { describe, expect, it } from "vitest";
import { addMonths, canGoNext, GRID_FIRST_DAY, monthGrid, monthOf, rowStart, shiftMonth, weekdayOf } from "./week-month";

const TODAY = "2026-10-27"; // martes
const OPENINGS = ["2026-10-10", "2026-10-18", "2026-10-24"];
type Grid = ReturnType<typeof monthGrid>;
const cells = (grid: Grid) => grid.rows.flat();
const cell = (grid: Grid, date: string) => cells(grid).find((c) => c.date === date)!;

describe("monthGrid: forma de la cuadrícula", () => {
  const grid = monthGrid("2026-10", OPENINGS, TODAY);

  it("filas completas de 7 días que empiezan en sábado y rellenan con días de meses vecinos", () => {
    expect(grid.label).toBe("octubre 2026");
    expect(grid.rows).toHaveLength(6);
    expect(grid.rows.every((r) => r.length === 7)).toBe(true);
    expect(grid.rows.every((r) => weekdayOf(r[0].date) === GRID_FIRST_DAY)).toBe(true);
    expect(grid.rows[0][0]).toMatchObject({ date: "2026-09-26", inMonth: false });
    expect(cell(grid, "2026-10-01")).toMatchObject({ inMonth: true, day: 1 });
    expect(grid.rows[5][6].date).toBe("2026-11-06");
  });

  it("marca hoy y desactiva los días futuros, que no llevan banda", () => {
    expect(cell(grid, TODAY)).toMatchObject({ isToday: true, isFuture: false });
    expect(cell(grid, "2026-10-28")).toMatchObject({ isFuture: true, band: null, weekFrom: null });
  });
});

describe("monthGrid: bandas de las semanas marcadas", () => {
  const grid = monthGrid("2026-10", OPENINGS, TODAY);

  it("antes de la primera apertura no hay banda (sin semana)", () => {
    expect(cell(grid, "2026-10-09")).toMatchObject({ band: null, weekFrom: null });
  });

  it("cada semana tiene su color, inicio y fin", () => {
    expect(cell(grid, "2026-10-10")).toMatchObject({ band: 0, isStart: true, isEnd: false, weekFrom: "2026-10-10" });
    expect(cell(grid, "2026-10-17")).toMatchObject({ band: 0, isStart: false, isEnd: true });
    expect(cell(grid, "2026-10-18")).toMatchObject({ band: 1, isStart: true });
    expect(cell(grid, "2026-10-23")).toMatchObject({ band: 1, isEnd: true });
    expect(cell(grid, "2026-10-24")).toMatchObject({ band: 2, isStart: true, ongoing: true });
  });

  it("la semana en curso llega hasta hoy", () => {
    expect(cell(grid, TODAY)).toMatchObject({ band: 2, ongoing: true, isEnd: true });
  });

  it("dos semanas seguidas no comparten color, también con más de 4 aperturas", () => {
    const many = ["2026-09-01", "2026-09-08", "2026-09-15", "2026-09-22", "2026-09-29", "2026-10-06"];
    const g = monthGrid("2026-10", many, TODAY);
    const bands = g.weeks.map((w) => w.band);
    expect(bands.every((b, i) => i === 0 || b !== bands[i - 1])).toBe(true);
    expect(cell(g, "2026-10-06").band).toBe(1); // sexta apertura (índice 5) → 5 % 4
  });

  it("el caso real [18, 27]: el 17 queda sin banda (no existe semana fantasma)", () => {
    const g = monthGrid("2026-10", ["2026-10-18", "2026-10-27"], TODAY);
    expect(cell(g, "2026-10-17").band).toBeNull();
    expect(cell(g, "2026-10-26")).toMatchObject({ band: 0, isEnd: true });
    expect(cell(g, "2026-10-27")).toMatchObject({ band: 1, isStart: true, ongoing: true });
  });
});

describe("monthGrid: semanas del mes y estado vacío", () => {
  it("lista las semanas que tocan el mes con sus días", () => {
    const { weeks } = monthGrid("2026-10", OPENINGS, TODAY);
    expect(weeks).toEqual([
      { from: "2026-10-10", to: "2026-10-17", days: 8, band: 0 },
      { from: "2026-10-18", to: "2026-10-23", days: 6, band: 1 },
      { from: "2026-10-24", to: null, days: 4, band: 2 },
    ]);
  });

  it("un mes anterior a la primera apertura está vacío", () => {
    const g = monthGrid("2026-09", OPENINGS, TODAY);
    expect(g.empty).toBe(true);
    expect(cells(g).every((c) => c.band === null)).toBe(true);
  });

  it("sin aperturas todo está vacío, y un mes futuro no hereda la semana en curso", () => {
    expect(monthGrid("2026-10", [], TODAY).empty).toBe(true);
    expect(monthGrid("2026-11", OPENINGS, TODAY).empty).toBe(true);
  });

  it("una semana que cruza de mes aparece en los dos meses", () => {
    const openings = ["2026-09-28", "2026-10-05"];
    expect(monthGrid("2026-09", openings, TODAY).weeks.map((w) => w.from)).toEqual(["2026-09-28"]);
    expect(monthGrid("2026-10", openings, TODAY).weeks.map((w) => w.from)).toEqual(["2026-09-28", "2026-10-05"]);
  });
});

describe("monthGrid: borrador", () => {
  it("pinta el contorno del borrador; sin fin llega hasta hoy", () => {
    const g = monthGrid("2026-10", OPENINGS, TODAY, { from: "2026-10-18", last: "2026-10-23" });
    expect(cells(g).filter((c) => c.inDraft).map((c) => c.date)).toEqual([
      "2026-10-18",
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
    ]);
    const open = monthGrid("2026-10", OPENINGS, TODAY, { from: "2026-10-25", last: null });
    expect(cells(open).filter((c) => c.inDraft).map((c) => c.date)).toEqual(["2026-10-25", "2026-10-26", "2026-10-27"]);
  });
});

describe("navegación de meses", () => {
  it("suma y resta meses cruzando de año", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-10", 0)).toBe("2026-10");
    expect(monthOf("2026-10-27")).toBe("2026-10");
  });

  it("no se puede pasar del mes actual", () => {
    expect(canGoNext("2026-09", TODAY)).toBe(true);
    expect(canGoNext("2026-10", TODAY)).toBe(false);
  });
});

describe("ayudantes de teclado", () => {
  it("shiftMonth conserva el día o baja al último del mes", () => {
    expect(shiftMonth("2026-10-27", -1)).toBe("2026-09-27");
    expect(shiftMonth("2026-10-31", -1)).toBe("2026-09-30");
    expect(shiftMonth("2026-01-31", 1)).toBe("2026-02-28");
    expect(shiftMonth("2026-12-15", 1)).toBe("2027-01-15");
  });

  it("rowStart da el sábado de la fila", () => {
    expect(rowStart("2026-10-27")).toBe("2026-10-24");
    expect(rowStart("2026-10-24")).toBe("2026-10-24");
    expect(rowStart("2026-10-23")).toBe("2026-10-17");
  });
});
