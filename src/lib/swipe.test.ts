import { describe, expect, it } from "vitest";
import { swipeOf } from "./swipe";

describe("swipeOf", () => {
  it("un deslizar horizontal claro cuenta, con su dirección", () => {
    expect(swipeOf({ dx: -120, dy: 10, ms: 250 })).toBe("left");
    expect(swipeOf({ dx: 120, dy: -10, ms: 250 })).toBe("right");
  });
  it("un movimiento corto no cuenta", () => {
    expect(swipeOf({ dx: 40, dy: 0, ms: 150 })).toBeNull();
  });
  it("un gesto en diagonal o vertical (scroll) no cuenta", () => {
    expect(swipeOf({ dx: 90, dy: 80, ms: 250 })).toBeNull();
    expect(swipeOf({ dx: 20, dy: 300, ms: 250 })).toBeNull();
  });
  it("un arrastre lento no cuenta", () => {
    expect(swipeOf({ dx: 200, dy: 0, ms: 1500 })).toBeNull();
  });
  it("en el límite justo del umbral cuenta", () => {
    expect(swipeOf({ dx: -72, dy: 0, ms: 300 })).toBe("left");
    expect(swipeOf({ dx: -71, dy: 0, ms: 300 })).toBeNull();
  });
});
