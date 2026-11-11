import { describe, expect, it } from "vitest";
import { admissionSchema } from "./admission-schema";

const valid = {
  student_name: "Ananya",
  father_name: "Ramesh",
  mother_name: "Latha",
  mobile: "7396802002",
  alt_mobile: "",
  email: "",
  class_applying: "Class 1",
  source: "quick" as const,
  website: "",
};

describe("admissionSchema", () => {
  it("accepts a complete valid enquiry", () => {
    expect(admissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a mobile number that is not 10 digits starting 6-9", () => {
    expect(admissionSchema.safeParse({ ...valid, mobile: "12345" }).success).toBe(false);
    expect(admissionSchema.safeParse({ ...valid, mobile: "1234567890" }).success).toBe(false);
  });

  it("requires father, mother and class", () => {
    expect(admissionSchema.safeParse({ ...valid, father_name: "" }).success).toBe(false);
    expect(admissionSchema.safeParse({ ...valid, mother_name: "" }).success).toBe(false);
    expect(admissionSchema.safeParse({ ...valid, class_applying: "" }).success).toBe(false);
  });

  it("rejects an invalid email but allows an empty one", () => {
    expect(admissionSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(admissionSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
  });
});
