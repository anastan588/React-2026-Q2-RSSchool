import { describe, expect, it } from "vitest";

import { type FormValuesInput, profileSchema } from "@/utils/ValidationSchema";

describe("profileSchema validation", () => {
  const validData: FormValuesInput = {
    name: "John",
    age: 30,
    email: "john@example.com",
    gender: "male",
    acceptTerms: true,
    image: "data:image/png;base64,mock",
    password: "Password1!",
    confirmPassword: "Password1!",
    country: "Belarus",
  };

  it("should successfully validate a completely correct form data object", () => {
    const result = profileSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age).toBe(30);
    }
  });

  it("should correctly transform a valid empty string or valid number string for age", () => {
    const dataWithStrAge = { ...validData, age: "25" };
    const result = profileSchema.safeParse(dataWithStrAge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age).toBe(25);
    }
  });

  it("should fail validation if the first letter of the name is lowercase", () => {
    const invalidData = { ...validData, name: "john" };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "First letter must be uppercase",
      );
    }
  });

  it("should fail validation if the name is an empty string", () => {
    const invalidData = { ...validData, name: "" };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation if the age is negative", () => {
    const invalidData = { ...validData, age: -5 };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Age cannot be negative");
    }
  });

  it("should fail validation for incorrect age formats", () => {
    const invalidData = { ...validData, age: "not-a-number" };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation for a malformed email structure", () => {
    const invalidData = { ...validData, email: "invalid-email" };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email structure");
    }
  });

  it("should fail validation if a gender option is invalid or missing", () => {
    const invalidData = { ...validData, gender: "other" as unknown };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation if terms and conditions are not accepted", () => {
    const invalidData = { ...validData, acceptTerms: false };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("You must accept terms");
    }
  });

  it("should fail validation if profile image string is empty", () => {
    const invalidData = { ...validData, image: "" };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation if passwords do not match", () => {
    const invalidData = { ...validData, confirmPassword: "DifferentPassword!" };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords must match");
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("should fail validation if the country is not present in the stored countries list", () => {
    const invalidData = { ...validData, country: "InvalidCountryName" };
    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Country must exist in the list",
      );
    }
  });
});
