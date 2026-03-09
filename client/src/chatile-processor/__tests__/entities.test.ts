import { describe, it, expect } from "vitest";
import { extractEntities } from "../entities";

describe("entity extraction", () => {
  describe("medication_name", () => {
    it.each([
      ["refill my metformin", "metformin"],
      ["I need more lisinopril", "lisinopril"],
      ["atorvastatin renewal", "atorvastatin"],
      ["can you refill amlodipine", "amlodipine"],
      ["omeprazole refill please", "omeprazole"],
      ["renew levothyroxine", "levothyroxine"],
      ["reorder simvastatin", "simvastatin"],
      ["running low on losartan", "losartan"],
      ["almost out of gabapentin", "gabapentin"],
      ["I need more hydrochlorothiazide", "hydrochlorothiazide"],
    ])('extracts "%s" → %s', (input, expected) => {
      expect(extractEntities(input).medication_name).toBe(expected);
    });

    it("returns undefined when no medication mentioned", () => {
      expect(extractEntities("refill my prescription").medication_name).toBeUndefined();
    });
  });

  describe("doctor_name", () => {
    it.each([
      ["appointment with Dr. Chen", "chen"],
      ["message Dr. Torres", "torres"],
      ["see Dr. Rodriguez", "rodriguez"],
      ["contact Doctor Kim", "kim"],
      ["visit Dr. Nguyen", "nguyen"],
    ])('extracts "%s" → %s', (input, expected) => {
      expect(extractEntities(input).doctor_name).toBe(expected);
    });

    it("returns undefined when no doctor mentioned", () => {
      expect(extractEntities("book an appointment").doctor_name).toBeUndefined();
    });
  });

  describe("day", () => {
    it.each([
      ["appointment on monday", "monday"],
      ["schedule for tuesday", "tuesday"],
      ["book for tomorrow", "tomorrow"],
      ["available today", "today"],
      ["appointment on friday morning", "friday"],
    ])('extracts "%s" → %s', (input, expected) => {
      expect(extractEntities(input).day).toBe(expected);
    });

    it("returns undefined when no day mentioned", () => {
      expect(extractEntities("book an appointment").day).toBeUndefined();
    });
  });

  describe("specialty", () => {
    it.each([
      ["find a cardiologist", "cardiology"],
      ["I need a dermatologist", "dermatology"],
      ["look for a neurologist", "neurology"],
      ["find a pediatrician", "pediatrics"],
      ["orthopedic doctor", "orthopedics"],
      ["find a heart doctor", "cardiology"],
      ["skin doctor", "dermatology"],
      ["find a family doctor", "family medicine"],
      ["looking for a gp", "primary care"],
      ["I need a general practitioner", "primary care"],
      ["find an internist", "internal medicine"],
      ["gastroenterologist", "gastroenterology"],
      ["endocrinologist", "endocrinology"],
      ["pulmonologist", "pulmonology"],
      ["rheumatologist", "rheumatology"],
    ])('extracts "%s" → %s', (input, expected) => {
      expect(extractEntities(input).specialty).toBe(expected);
    });

    it("returns undefined when no specialty mentioned", () => {
      expect(extractEntities("find a doctor").specialty).toBeUndefined();
    });
  });

  describe("insurance", () => {
    it.each([
      ["doctors who accept aetna", "aetna"],
      ["physicians taking cigna", "cigna"],
      ["find a doctor accepting blue cross", "blue cross"],
      ["takes united", "united"],
      ["accepts medicare", "medicare"],
      ["medicaid providers", "medicaid"],
    ])('extracts "%s" → %s', (input, expected) => {
      expect(extractEntities(input).insurance).toBe(expected);
    });

    it("returns undefined when no insurance mentioned", () => {
      expect(extractEntities("find a cardiologist").insurance).toBeUndefined();
    });
  });

  describe("appointment_type", () => {
    it.each([
      ["book an annual physical", "annual physical"],
      ["schedule a follow up", "follow up"],
      ["I need a follow-up appointment", "follow up"],
      ["video visit with Dr. Chen", "video visit"],
      ["sick visit", "sick visit"],
      ["schedule a checkup", "annual physical"],
    ])('extracts "%s" → %s', (input, expected) => {
      expect(extractEntities(input).appointment_type).toBe(expected);
    });
  });

  describe("multiple entities", () => {
    it("extracts specialty + insurance together", () => {
      const result = extractEntities("find a cardiologist who takes aetna");
      expect(result.specialty).toBe("cardiology");
      expect(result.insurance).toBe("aetna");
    });

    it("extracts doctor + day together", () => {
      const result = extractEntities("appointment with Dr. Chen on monday");
      expect(result.doctor_name).toBe("chen");
      expect(result.day).toBe("monday");
    });

    it("extracts doctor + appointment_type together", () => {
      const result = extractEntities("follow up visit with Dr. Torres");
      expect(result.doctor_name).toBe("torres");
      expect(result.appointment_type).toBe("follow up");
    });
  });
});
