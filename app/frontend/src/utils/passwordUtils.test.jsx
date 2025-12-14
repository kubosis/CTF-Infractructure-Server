// src/utils/passwordUtils.test.jsx
import { describe, it, expect } from "vitest";
import { evaluatePassword, hashPassword } from "./passwordUtils";

describe("Password Utilities", () => {
  describe("evaluatePassword", () => {
    it("returns Weak for short or simple passwords", () => {
      const result = evaluatePassword("abc");
      expect(result.message).toBe("Weak");
      expect(result.isValid).toBe(false);
    });

    it("returns Moderate for medium-strength passwords", () => {
      const result = evaluatePassword("Abcdefghijk1");
      expect(result.message).toBe("Moderate");
      expect(result.isValid).toBe(false);
    });

    it("returns Strong for passwords meeting all rules", () => {
      const result = evaluatePassword("Abcdefgh1!23");
      expect(result.message).toBe("Strong");
      expect(result.isValid).toBe(true);
    });
  });

  describe("hashPassword", () => {
    it("produces deterministic SHA-256 hashes", async () => {
      const password = "MySecret123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash length
    });

    it("produces different hashes for different passwords", async () => {
      const hash1 = await hashPassword("Password1!");
      const hash2 = await hashPassword("Password2!");
      expect(hash1).not.toBe(hash2);
    });
  });
});
