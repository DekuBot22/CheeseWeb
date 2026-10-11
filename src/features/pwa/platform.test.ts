import { describe, expect, it } from "vitest";
import { detectPlatform } from "./platform";

const UA = {
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  ipadOs:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

describe("detectPlatform", () => {
  it("iPhone", () => {
    expect(detectPlatform(UA.iphone, 5)).toBe("ios");
  });

  it("iPad con iPadOS (se anuncia como Mac pero es táctil)", () => {
    expect(detectPlatform(UA.ipadOs, 5)).toBe("ios");
  });

  it("Mac de escritorio sin pantalla táctil no es iOS", () => {
    expect(detectPlatform(UA.ipadOs, 0)).toBe("other");
  });

  it("Android con Chrome", () => {
    expect(detectPlatform(UA.androidChrome, 5)).toBe("android");
  });

  it("escritorio", () => {
    expect(detectPlatform(UA.windows, 0)).toBe("other");
  });
});
