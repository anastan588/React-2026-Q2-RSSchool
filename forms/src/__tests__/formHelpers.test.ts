import { describe, expect, it } from "vitest";

import {
  checkPasswordStrength,
  validateEmailWithoutRegex,
} from "@/utils/FormHelpers";

describe("Utility Functions", () => {
  describe("validateEmailWithoutRegex", () => {
    it("should return true for valid email formats", () => {
      expect(validateEmailWithoutRegex("user@domain.com")).toBe(true);
      expect(validateEmailWithoutRegex("test.name@sub.domain.org")).toBe(true);
    });

    it("should return false for missing @ or multiple @ symbols", () => {
      expect(validateEmailWithoutRegex("userdomain.com")).toBe(false);
      expect(validateEmailWithoutRegex("user@domain@test.com")).toBe(false);
    });

    it("should return false for empty local part or empty domain", () => {
      expect(validateEmailWithoutRegex("@domain.com")).toBe(false);
      expect(validateEmailWithoutRegex("user@")).toBe(false);
    });

    it("should return false if domain does not contain at least one dot", () => {
      expect(validateEmailWithoutRegex("user@domain")).toBe(false);
      expect(validateEmailWithoutRegex("user@domain.")).toBe(false);
    });
  });

  describe("checkPasswordStrength", () => {
    it("should evaluate structural parameters correctly", () => {
      const strong = checkPasswordStrength("A1b!");
      expect(strong.hasUpper).toBe(true);
      expect(strong.hasLower).toBe(true);
      expect(strong.hasNumber).toBe(true);
      expect(strong.hasSpecial).toBe(true);

      const weak = checkPasswordStrength("plain");
      expect(weak.hasUpper).toBe(false);
      expect(weak.hasSpecial).toBe(false);
    });
  });
});
