import { z } from "zod";

import { COUNTRIES } from "@/types/types";
import { validateEmailWithoutRegex } from "@/utils/FormHelpers";

const GENDER_VALUES = ["male", "female"] as const;

export const profileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .refine((val) => {
        if (val.length === 0) return false;
        const firstChar = val.charAt(0);
        return (
          firstChar === firstChar.toUpperCase() &&
          firstChar !== firstChar.toLowerCase()
        );
      }, "First letter must be uppercase"),
    age: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" ? undefined : Number(val)))
      .pipe(
        z
          .number({ message: "Age must be a number" })
          .nonnegative("Age cannot be negative"),
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .refine(
        (val): boolean => validateEmailWithoutRegex(val),
        "Invalid email structure",
      ),
    gender: z.enum(GENDER_VALUES, {
      message: "Please select your gender",
    }),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "You must accept terms"),
    image: z.string().min(1, "Profile image is required"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    country: z
      .string()
      .refine(
        (val) => (COUNTRIES as readonly string[]).includes(val),
        "Country must exist in the list",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type FormValuesInput = z.input<typeof profileSchema>;
export type FormValuesOutput = z.output<typeof profileSchema>;
export type FormValues = FormValuesOutput;
