import { describe, expect, it } from "vitest";
import { backupCaption, backupFileNames, fitsTelegram, GZIP_THRESHOLD_BYTES, TELEGRAM_DOC_MAX_BYTES } from "./backup-file";

describe("backupFileNames", () => {
  it("usa la fecha de Bogotá: un sábado 23:30 allá sigue siendo sábado", () => {
    // 2026-10-17 es sábado; 23:30 en Bogotá = 04:30 UTC del domingo 18.
    const names = backupFileNames(new Date("2026-10-18T04:30:00Z"));
    expect(names.date).toBe("2026-10-17");
    expect(names.json).toBe("respaldo-2026-10-17.json");
    expect(names.jsonGz).toBe("respaldo-2026-10-17.json.gz");
    expect(names.xlsx).toBe("quesoweb-respaldo-2026-10-17.xlsx");
  });
});

describe("tamaños", () => {
  it("el umbral para comprimir queda por debajo del tope de Telegram", () => {
    expect(GZIP_THRESHOLD_BYTES).toBeLessThan(TELEGRAM_DOC_MAX_BYTES);
    expect(fitsTelegram(TELEGRAM_DOC_MAX_BYTES)).toBe(true);
    expect(fitsTelegram(TELEGRAM_DOC_MAX_BYTES + 1)).toBe(false);
  });
});

describe("backupCaption", () => {
  it("resume los conteos con plurales", () => {
    const text = backupCaption({ clients: 1, orders: 12, payments: 0, purchases: 3 }, "2026-10-17");
    expect(text).toContain("2026-10-17");
    expect(text).toContain("1 cliente");
    expect(text).toContain("12 pedidos");
    expect(text).toContain("3 compras");
  });
});
