import { describe, expect, it } from "vitest";
import { SCHOOL_GRADES, UNSET_FEE, SLIDESHOW_HOLD_MS } from "./school-rules";

describe("school rules", () => {
  it("fees cover Nursery to 10th separately", () => {
    expect(SCHOOL_GRADES).toEqual(["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]);
  });
  it("unknown fees never invent an amount", () => {
    expect(UNSET_FEE).toBe("To be updated");
  });
  it("slideshow holds for three seconds", () => {
    expect(SLIDESHOW_HOLD_MS).toBe(3000);
  });
});
