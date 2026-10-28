import { describe, expect, it } from "vitest";
import { weeklySeries } from "@/domain/accounting";
import { buildCalendar, lastWeeks } from "@/domain/week-calendar";
import { resolveWeek } from "@/domain/week-scope";
import { weekSummaryNotes } from "./week-summary";

const at = (isoLocal: string) => new Date(`${isoLocal}-05:00`);

describe("weekSummaryNotes en una semana pasada", () => {
  // 3 oct (sáb) a 9 oct = 7 días; 10 a 17 oct = 8 días; 18 oct en adelante.
  const cal = buildCalendar(["2026-10-10", "2026-10-18"], at("2026-10-27T10:00:00"));
  const week = resolveWeek(cal, "2026-10-14").week;
  const [prev, cur] = weeklySeries({ orders: [], purchases: [], providerPayments: [] }, lastWeeks(cal, 2, week));

  it("dice que la semana duró (no que lleva) cuando ya terminó", () => {
    const notes = weekSummaryNotes(week, cur, prev, { elapsed: week.days, past: true }).join(" ");
    expect(notes).toContain("esta duró 8 días");
    expect(notes).not.toContain("lleva");
  });

  it("en la semana en curso sigue diciendo que lleva", () => {
    const notes = weekSummaryNotes(week, cur, prev, { elapsed: 5 }).join(" ");
    expect(notes).toContain("esta lleva 5 días");
  });
});
