import { describe, expect, it } from "vitest";
import { affectedWeeks, calendarChanges, moveOpeningEffect, openWeekEffect, voidOpeningEffect } from "./week-effect";

const TODAY = "2026-10-20"; // martes

describe("openWeekEffect", () => {
  it("abrir hoy pasa lo de hoy de la semana automática a la nueva", () => {
    // Sábado 17 oct es la semana automática; abrir el lunes 19 mueve lunes y martes.
    expect(openWeekEffect([], "2026-10-19", TODAY)).toEqual({
      from: "2026-10-19",
      to: TODAY,
      fromWeek: "2026-10-17",
      toWeek: "2026-10-19",
    });
  });

  it("abrir justo el sábado no cambia nada", () => {
    expect(openWeekEffect([], "2026-10-17", TODAY)).toBeNull();
  });

  it("abrir con fecha pasada mueve todo desde esa fecha", () => {
    const effect = openWeekEffect(["2026-10-05"], "2026-10-12", TODAY);
    expect(effect).toEqual({ from: "2026-10-12", to: TODAY, fromWeek: "2026-10-05", toWeek: "2026-10-12" });
  });
});

describe("moveOpeningEffect", () => {
  const openings = ["2026-10-05", "2026-10-12"];

  it("mover antes: los días entre las dos fechas pasan a la semana movida", () => {
    expect(moveOpeningEffect(openings, "2026-10-12", "2026-10-10", TODAY)).toEqual({
      from: "2026-10-10",
      to: "2026-10-11",
      fromWeek: "2026-10-05",
      toWeek: "2026-10-10",
    });
  });

  it("mover después: los días pasan a la semana anterior", () => {
    expect(moveOpeningEffect(openings, "2026-10-12", "2026-10-14", TODAY)).toEqual({
      from: "2026-10-12",
      to: "2026-10-13",
      fromWeek: "2026-10-12",
      toWeek: "2026-10-05",
    });
  });
});

describe("voidOpeningEffect", () => {
  it("anular una apertura junta su semana con la anterior", () => {
    expect(voidOpeningEffect(["2026-10-05", "2026-10-12", "2026-10-19"], "2026-10-12", TODAY)).toEqual({
      from: "2026-10-12",
      to: "2026-10-18",
      fromWeek: "2026-10-12",
      toWeek: "2026-10-05",
    });
  });

  it("anular la última apertura mueve todo hasta hoy", () => {
    expect(voidOpeningEffect(["2026-10-05", "2026-10-19"], "2026-10-19", TODAY)?.to).toBe(TODAY);
  });
});

describe("calendarChanges", () => {
  it("sin cambios de aperturas no hay tramos", () => {
    expect(calendarChanges(["2026-10-18"], ["2026-10-18"], "2026-10-27")).toEqual([]);
  });

  it("insertar el 24 después del 18 mueve del 24 a hoy a la semana nueva", () => {
    expect(calendarChanges(["2026-10-18"], ["2026-10-18", "2026-10-24"], "2026-10-27")).toEqual([
      { from: "2026-10-24", to: "2026-10-27", fromWeek: "2026-10-18", toWeek: "2026-10-24" },
    ]);
  });

  it("insertar el 12 antes de todo: dos tramos, de dos semanas automáticas distintas", () => {
    expect(calendarChanges(["2026-10-18"], ["2026-10-12", "2026-10-18"], "2026-10-27")).toEqual([
      { from: "2026-10-12", to: "2026-10-16", fromWeek: "2026-10-10", toWeek: "2026-10-12" },
      { from: "2026-10-17", to: "2026-10-17", fromWeek: "2026-10-17", toWeek: "2026-10-12" },
    ]);
  });

  it("insertar en medio solo cuenta hasta la siguiente apertura", () => {
    expect(calendarChanges(["2026-10-12", "2026-10-24"], ["2026-10-12", "2026-10-18", "2026-10-24"], "2026-10-27")).toEqual([
      { from: "2026-10-18", to: "2026-10-23", fromWeek: "2026-10-12", toWeek: "2026-10-18" },
    ]);
  });
});

describe("affectedWeeks", () => {
  it("devuelve las semanas nuevas que tocan los cambios", () => {
    const after = ["2026-10-18", "2026-10-24"];
    const segments = calendarChanges(["2026-10-18"], after, "2026-10-27");
    expect(affectedWeeks(after, segments, "2026-10-27").map((w) => [w.from, w.to])).toEqual([
      ["2026-10-18", "2026-10-23"],
      ["2026-10-24", "2026-10-30"],
    ]);
  });
});
