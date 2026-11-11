import { z } from "zod";

const phone = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const admissionSchema = z.object({
  student_name: z.string().trim().min(1, "Student name is required").max(100),
  father_name: z.string().trim().min(1, "Father's name is required").max(100),
  mother_name: z.string().trim().min(1, "Mother's name is required").max(100),
  mobile: phone,
  alt_mobile: z.union([phone, z.literal("")]).optional(),
  email: z.union([z.string().trim().email("Enter a valid email").max(255), z.literal("")]).optional(),
  class_applying: z.string().trim().min(1, "Choose a class").max(50),
  source: z.enum(["quick", "full"]),
  website: z.string().max(200).optional(), // honeypot
});

export type AdmissionInput = z.infer<typeof admissionSchema>;
