import { describe, expect, it } from "vitest";
import { cx } from "./cx";

describe("cx", () => {
  it("une clases e ignora valores falsy", () => {
    expect(cx("a", false, null, undefined, "b")).toBe("a b");
  });
});
