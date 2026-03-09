import { describe, it, expect } from "vitest";
import { resolveInput } from "../resolver";

describe("chatile-processor resolver", () => {
  // ─── 2.1 Medications ─────────────────────────────────────

  describe("refill_medication", () => {
    it.each([
      "refill my metformin",
      "reorder my lisinopril",
      "renew my atorvastatin",
      "I need more metformin",
      "I want more lisinopril",
      "get me another refill of atorvastatin",
      "can I refill my metformin",
      "can you reorder my lisinopril",
      "I'm out of metformin",
      "I'm running low on lisinopril",
      "running out of atorvastatin",
      "almost out of my metformin",
      "metformin refill",
      "lisinopril renewal",
    ])('"%s" → refill_medication (exact)', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("refill_medication");
      expect(result.intent?.path).toBe("/medications");
      expect(result.entities.medication_name).toBeDefined();
    });

    it.each([
      "I need a refill",
      "prescription refill",
      "refill my prescription",
      "refill my medication",
      "I need to refill a medication",
      "medication refill",
      "can I get a refill",
      "can you refill my prescription",
    ])('"%s" → refill_medication (entity_needed)', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("entity_needed");
      expect(result.intent?.action).toBe("refill_medication");
      expect(result.prompt).toContain("medication");
    });

    it("extracts the correct medication name", () => {
      expect(resolveInput("refill my metformin").entities.medication_name).toBe("metformin");
      expect(resolveInput("reorder my lisinopril").entities.medication_name).toBe("lisinopril");
      expect(resolveInput("renew atorvastatin").entities.medication_name).toBe("atorvastatin");
    });

    it("sets highlight to the medication id", () => {
      const result = resolveInput("refill my metformin");
      expect(result.intent?.highlight).toBe("metformin");
    });

    it("builds correct breadcrumb with medication display name", () => {
      const result = resolveInput("refill my metformin");
      expect(result.intent?.breadcrumb).toContain("Metformin 500mg");
    });
  });

  describe("view_medications", () => {
    it.each([
      "show my medications",
      "view my prescriptions",
      "see my meds",
      "check my medications",
      "list my prescriptions",
      "open my medications",
      "what medications am I on",
      "what meds am I taking",
      "what prescriptions do I have",
      "my medication list",
      "medication history",
      "prescription list",
    ])('"%s" → view_medications', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_medications");
      expect(result.intent?.path).toBe("/medications");
    });
  });

  // ─── 2.2 Appointments ────────────────────────────────────

  describe("book_appointment", () => {
    it.each([
      "book an appointment",
      "schedule a visit",
      "make an appointment",
      "set up a consultation",
      "I want to schedule an appointment",
      "I need to book a visit",
      "I'd like to see a doctor",
      "can I schedule an appointment",
      "can you book me a visit",
      "appointment with Dr. Chen on Monday",
      "get an appointment",
    ])('"%s" → book_appointment (disambiguate)', (input) => {
      const result = resolveInput(input);
      expect(result.intent?.action).toBe("book_appointment");
      expect(result.intent?.path).toBe("/appointments");
    });

    it("extracts doctor name", () => {
      const result = resolveInput("book an appointment with Dr. Chen");
      expect(result.entities.doctor_name).toBe("chen");
    });

    it("extracts day", () => {
      const result = resolveInput("appointment with Dr. Chen on Monday");
      expect(result.entities.day).toBe("monday");
    });
  });

  describe("view_appointments", () => {
    it.each([
      "show my appointments",
      "view my upcoming visits",
      "see my scheduled appointments",
      "check my appointments",
      "when is my next appointment",
      "when are my appointments",
      "what's my next visit",
      "my appointment schedule",
      "appointment calendar",
      "do I have any upcoming appointments",
      "any appointments coming up",
      "next appointment",
      "upcoming appointment",
    ])('"%s" → view_appointments', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_appointments");
      expect(result.intent?.path).toBe("/appointments");
    });
  });

  // ─── 2.3 Find a Doctor ───────────────────────────────────

  describe("find_doctor", () => {
    it.each([
      "find a cardiologist",
      "search for a dermatologist",
      "look for a neurologist",
      "looking for a pediatrician",
      "I want a cardiologist",
      "I need an orthopedic doctor",
      "who are the available doctors",
      "find a doctor",
      "doctors who accept Aetna",
      "can you find me a good cardiologist",
      "recommend a dermatologist",
      "find a primary care doctor",
      "I need a family doctor",
      "looking for an internist",
    ])('"%s" → find_doctor', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("find_doctor");
      expect(result.intent?.path).toBe("/find-doctor");
    });

    it("extracts specialty", () => {
      const result = resolveInput("find a cardiologist");
      expect(result.entities.specialty).toBe("cardiology");
    });

    it("extracts insurance", () => {
      const result = resolveInput("doctors who accept Aetna");
      expect(result.entities.insurance).toBe("aetna");
    });

    it("extracts both specialty and insurance", () => {
      const result = resolveInput("find a cardiologist who takes aetna");
      expect(result.entities.specialty).toBe("cardiology");
      expect(result.entities.insurance).toBe("aetna");
    });

    it("builds breadcrumb with specialty and insurance", () => {
      const result = resolveInput("find a cardiologist who takes aetna");
      expect(result.intent?.breadcrumb).toContain("Cardiology");
      expect(result.intent?.breadcrumb).toContain("Aetna");
    });
  });

  describe("find_gp_primary", () => {
    it.each([
      "I need an appointment with a GP in my primary clinic, next available",
      "appointment with a gp at primary care",
      "see a gp next available",
      "gp appointment at primary clinic",
    ])('"%s" → find_gp_primary', (input) => {
      const result = resolveInput(input);
      expect(result.intent?.action).toBe("find_gp_primary");
      expect(result.intent?.path).toBe("/find-doctor");
    });
  });

  // ─── 2.4 Test Results ────────────────────────────────────

  describe("view_test_results", () => {
    it.each([
      "show my test results",
      "view my lab results",
      "see my blood work",
      "check my diagnostic report",
      "I want to see my test results",
      "what are my test results",
      "what were my lab values",
      "are my lab results ready",
      "are my test results in",
      "are my results back",
      "did my test results come in",
      "did my blood work come back",
      "lab work",
      "blood work",
      "test results",
      "lab results",
    ])('"%s" → view_test_results', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_test_results");
      expect(result.intent?.path).toBe("/test-results");
    });
  });

  // ─── 2.5 Messages ────────────────────────────────────────

  describe("message_doctor_followup", () => {
    it.each([
      "tell my doctor I need a follow-up appointment",
      "tell my doctor I need a follow up",
      "ask my doctor about a follow-up",
      "I need a follow-up",
      "send a follow-up message",
      "follow-up request",
    ])('"%s" → message_doctor_followup', (input) => {
      const result = resolveInput(input);
      expect(result.intent?.action).toBe("message_doctor_followup");
      expect(result.intent?.path).toBe("/messages");
    });
  });

  describe("message_doctor", () => {
    it.each([
      "I want to message my doctor",
      "I need to contact Dr. Chen",
      "message Dr. Chen",
      "contact Dr. Torres",
      "email my doctor",
      "write to Dr. Rodriguez",
      "send a message to Dr. Chen",
      "can you send a message to Dr. Chen",
      "reach out to my care team",
    ])('"%s" → message_doctor', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("message_doctor");
      expect(result.intent?.path).toBe("/messages");
    });
  });

  describe("view_messages", () => {
    it.each([
      "show my messages",
      "view my inbox",
      "see my mail",
      "check my messages",
      "read my messages",
      "open my inbox",
      "my messages",
      "my inbox",
      "do I have any messages",
      "do I have any new messages",
      "any new messages",
      "unread messages",
    ])('"%s" → view_messages', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_messages");
      expect(result.intent?.path).toBe("/messages");
    });
  });

  // ─── 2.6 Billing ─────────────────────────────────────────

  describe("pay_bill", () => {
    it.each([
      "I want to pay my bill",
      "I need to pay",
      "can I pay my bill",
      "pay my bill",
      "pay my balance",
      "make a payment",
      "submit a payment",
      "set up autopay",
      "pay off",
    ])('"%s" → pay_bill', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("pay_bill");
      expect(result.intent?.path).toBe("/billing");
    });
  });

  describe("view_billing", () => {
    it.each([
      "show my bills",
      "view my charges",
      "see my statements",
      "check my balance",
      "what do I owe",
      "what is my balance",
      "how much do I owe",
      "how much is my bill",
      "my bills",
      "my balance",
      "billing summary",
      "billing history",
      "do I have any outstanding bills",
      "any charges",
    ])('"%s" → view_billing', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_billing");
      expect(result.intent?.path).toBe("/billing");
    });
  });

  describe("billing_estimates", () => {
    it.each([
      "how much will my visit cost",
      "cost estimate",
      "price for a procedure",
      "what will I pay",
    ])('"%s" → billing_estimates', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("billing_estimates");
    });
  });

  describe("billing_inquiries", () => {
    it.each([
      "dispute a charge",
      "billing question",
      "ask about a bill",
      "I have a billing issue",
    ])('"%s" → billing_inquiries', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("billing_inquiries");
    });
  });

  // ─── Find Care (new pages) ───────────────────────────────

  describe("virtual_urgent_care", () => {
    it.each([
      "start a video visit",
      "virtual urgent care",
      "telehealth visit",
      "I need to see a doctor now",
      "video call with a doctor",
      "online doctor visit",
    ])('"%s" → virtual_urgent_care', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("virtual_urgent_care");
      expect(result.intent?.path).toBe("/virtual-care");
    });
  });

  describe("schedule_preventive_care", () => {
    it.each([
      "schedule a screening",
      "book a checkup",
      "wellness visit",
      "schedule preventive care",
      "I need a physical",
    ])('"%s" → schedule_preventive_care', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("schedule_preventive_care");
      expect(result.intent?.path).toBe("/preventive-care");
    });
  });

  describe("view_care_team", () => {
    it.each([
      "show my care team",
      "who are my doctors",
      "my providers",
      "care team contact info",
      "who is my doctor",
    ])('"%s" → view_care_team', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_care_team");
      expect(result.intent?.path).toBe("/care-team");
    });
  });

  describe("emergency_care", () => {
    it.each([
      "find an ER",
      "nearest emergency room",
      "urgent care near me",
      "I need emergency help",
      "where is the closest ER",
    ])('"%s" → emergency_care', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("emergency_care");
      expect(result.intent?.path).toBe("/emergency-care");
    });
  });

  // ─── Communication (new) ─────────────────────────────────

  describe("view_letters", () => {
    it.each([
      "show my letters",
      "view my correspondence",
      "letters from my doctor",
    ])('"%s" → view_letters', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_letters");
      expect(result.intent?.path).toBe("/letters");
    });
  });

  // ─── My Record (new) ─────────────────────────────────────

  describe("health_summary", () => {
    it.each([
      "show my health summary",
      "my conditions",
      "my allergies",
      "my immunizations",
      "health overview",
      "what conditions do I have",
    ])('"%s" → health_summary', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("health_summary");
      expect(result.intent?.path).toBe("/health-summary");
    });
  });

  describe("view_radiology", () => {
    it.each([
      "show my X-rays",
      "view my MRI",
      "radiology images",
      "my CT scan results",
      "imaging results",
    ])('"%s" → view_radiology', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_radiology");
      expect(result.intent?.path).toBe("/radiology");
    });
  });

  describe("questionnaires", () => {
    it.each([
      "show my questionnaires",
      "pre-visit forms",
      "intake forms",
      "complete my questionnaire",
      "I have a form to fill out",
    ])('"%s" → questionnaires', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("questionnaires");
      expect(result.intent?.path).toBe("/questionnaires");
    });
  });

  describe("medical_history", () => {
    it.each([
      "show my medical history",
      "view my surgical history",
      "family health history",
      "update my medical history",
    ])('"%s" → medical_history', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("medical_history");
      expect(result.intent?.path).toBe("/medical-history");
    });
  });

  describe("track_health", () => {
    it.each([
      "log my blood pressure",
      "track my weight",
      "record my glucose",
      "enter my vitals",
      "log exercise",
      "my health metrics",
    ])('"%s" → track_health', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("track_health");
      expect(result.intent?.path).toBe("/track-health");
    });
  });

  describe("document_center", () => {
    it.each([
      "show my documents",
      "upload a document",
      "my uploaded files",
      "document center",
    ])('"%s" → document_center', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("document_center");
      expect(result.intent?.path).toBe("/documents");
    });
  });

  describe("advance_care_planning", () => {
    it.each([
      "advance directives",
      "my healthcare proxy",
      "living will",
      "advance care planning",
      "who is my healthcare agent",
    ])('"%s" → advance_care_planning', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("advance_care_planning");
      expect(result.intent?.path).toBe("/advance-care");
    });
  });

  describe("covid_info", () => {
    it.each([
      "my COVID vaccine record",
      "COVID test results",
      "vaccination status",
      "am I up to date on COVID",
    ])('"%s" → covid_info', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("covid_info");
      expect(result.intent?.path).toBe("/covid");
    });
  });

  describe("view_todo", () => {
    it.each([
      "show my to-do list",
      "what do I need to do",
      "pending tasks",
      "action items",
      "things needing my attention",
    ])('"%s" → view_todo', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("view_todo");
      expect(result.intent?.path).toBe("/todo");
    });
  });

  // ─── Insurance & Pharmacy ────────────────────────────────

  describe("insurance_summary", () => {
    it.each([
      "view my insurance",
      "see my coverage details",
      "check my plan",
      "my insurance info",
      "insurance card",
      "my coverage",
      "what is my insurance",
      "member id",
    ])('"%s" → insurance_summary', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("insurance_summary");
      expect(result.intent?.path).toBe("/insurance");
    });
  });

  describe("manage_pharmacies", () => {
    it.each([
      "go to pharmacy",
      "view my pharmacy",
      "show my pharmacies",
      "find a pharmacy",
      "where is the nearest pharmacy",
    ])('"%s" → manage_pharmacies', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("manage_pharmacies");
      expect(result.intent?.path).toBe("/pharmacy");
    });
  });

  // ─── Records Sharing ─────────────────────────────────────

  describe("share_record", () => {
    it.each([
      "share my records",
      "send my records to another doctor",
      "share my medical records",
    ])('"%s" → share_record', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("share_record");
      expect(result.intent?.path).toBe("/records");
    });
  });

  describe("link_accounts", () => {
    it.each([
      "link my accounts",
      "connect another hospital",
      "merge my health records",
    ])('"%s" → link_accounts', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("link_accounts");
    });
  });

  describe("request_medical_record", () => {
    it.each([
      "request my medical records",
      "get a copy of my records",
      "download my health records",
    ])('"%s" → request_medical_record', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("request_medical_record");
    });
  });

  // ─── Resources ───────────────────────────────────────────

  describe("research_studies", () => {
    it.each([
      "clinical trials",
      "research studies",
      "am I eligible for a study",
      "research opportunities",
    ])('"%s" → research_studies', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("research_studies");
    });
  });

  describe("education", () => {
    it.each([
      "health articles",
      "patient education",
      "learn about diabetes",
      "health resources",
    ])('"%s" → education', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("education");
    });
  });

  describe("care_instructions", () => {
    it.each([
      "after-visit instructions",
      "discharge summary",
      "care plan",
      "my care instructions",
    ])('"%s" → care_instructions', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("care_instructions");
    });
  });

  // ─── Settings ─────────────────────────────────────────────

  describe("security_settings", () => {
    it.each([
      "change my password",
      "set up 2FA",
      "two-factor authentication",
      "manage my security",
      "active sessions",
    ])('"%s" → security_settings', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("security_settings");
      expect(result.intent?.path).toBe("/settings");
    });
  });

  describe("notifications", () => {
    it.each([
      "manage my notifications",
      "notification settings",
      "turn off email alerts",
      "show my notifications",
      "any new notifications",
    ])('"%s" → notifications', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("notifications");
      expect(result.intent?.path).toBe("/settings");
    });
  });

  describe("navigate_settings", () => {
    it.each([
      "go to settings",
      "open settings",
      "change my settings",
      "update my preferences",
    ])('"%s" → navigate_settings', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("navigate_settings");
      expect(result.intent?.path).toBe("/settings");
    });
  });

  // ─── Help ─────────────────────────────────────────────────

  describe("help_desk", () => {
    it.each([
      "go to help",
      "I need help",
      "I need support",
      "contact support",
      "contact customer service",
      "billing faq",
    ])('"%s" → help_desk', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("help_desk");
      expect(result.intent?.path).toBe("/help");
    });
  });

  // ─── Navigation ───────────────────────────────────────────

  describe("navigate_home", () => {
    it.each([
      "go to home",
      "go to the dashboard",
      "take me home",
      "home",
      "dashboard",
    ])('"%s" → navigate_home', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("exact");
      expect(result.intent?.action).toBe("navigate_home");
      expect(result.intent?.path).toBe("/");
    });
  });

  // ─── No Match ─────────────────────────────────────────────

  describe("no_match", () => {
    it.each([
      "what's the weather",
      "tell me a joke",
      "order a pizza",
      "",
      "   ",
    ])('"%s" → no_match', (input) => {
      const result = resolveInput(input);
      expect(result.type).toBe("no_match");
      expect(result.intent).toBeNull();
    });
  });

  // ─── Match Result Types ──────────────────────────────────

  describe("match result types", () => {
    it("returns exact for fully resolved intent", () => {
      const result = resolveInput("show my medications");
      expect(result.type).toBe("exact");
    });

    it("returns disambiguate when multiple options needed", () => {
      const result = resolveInput("tell my doctor I need a follow-up");
      expect(result.type).toBe("disambiguate");
      expect(result.options).toBeDefined();
      expect(result.options!.length).toBeGreaterThan(0);
    });

    it("returns entity_needed when medication missing from refill", () => {
      const result = resolveInput("refill my prescription");
      expect(result.type).toBe("entity_needed");
      expect(result.prompt).toBeDefined();
    });

    it("returns no_match for unrecognized input", () => {
      const result = resolveInput("fly me to the moon");
      expect(result.type).toBe("no_match");
    });
  });
});
