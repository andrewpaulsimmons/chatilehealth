import type { EntityExtractionResult } from "./types";

export const KNOWN_MEDICATIONS = [
  "metformin", "lisinopril", "atorvastatin", "amlodipine", "omeprazole",
  "levothyroxine", "simvastatin", "losartan", "gabapentin", "hydrochlorothiazide",
] as const;

export const MEDICATION_DISPLAY: Record<string, string> = {
  metformin: "Metformin 500mg",
  lisinopril: "Lisinopril 10mg",
  atorvastatin: "Atorvastatin 20mg",
  amlodipine: "Amlodipine 5mg",
  omeprazole: "Omeprazole 20mg",
  levothyroxine: "Levothyroxine 50mcg",
  simvastatin: "Simvastatin 20mg",
  losartan: "Losartan 50mg",
  gabapentin: "Gabapentin 300mg",
  hydrochlorothiazide: "HCTZ 25mg",
};

export const SPECIALTIES: Record<string, string> = {
  cardiology: "Cardiology",
  dermatology: "Dermatology",
  neurology: "Neurology",
  pediatrics: "Pediatrics",
  orthopedics: "Orthopedics",
  psychiatry: "Psychiatry",
  gynecology: "Gynecology",
  urology: "Urology",
  oncology: "Oncology",
  "primary care": "Primary Care",
  "family medicine": "Family Medicine",
  "internal medicine": "Internal Medicine",
  gastroenterology: "Gastroenterology",
  endocrinology: "Endocrinology",
  pulmonology: "Pulmonology",
  rheumatology: "Rheumatology",
};

const SPECIALTY_ALIASES: Record<string, string> = {
  cardiologist: "cardiology",
  "heart doctor": "cardiology",
  dermatologist: "dermatology",
  "skin doctor": "dermatology",
  neurologist: "neurology",
  pediatrician: "pediatrics",
  orthopedist: "orthopedics",
  "orthopedic doctor": "orthopedics",
  "bone doctor": "orthopedics",
  psychiatrist: "psychiatry",
  gynecologist: "gynecology",
  urologist: "urology",
  oncologist: "oncology",
  "family doctor": "family medicine",
  "family physician": "family medicine",
  gp: "primary care",
  "general practitioner": "primary care",
  internist: "internal medicine",
  gastroenterologist: "gastroenterology",
  endocrinologist: "endocrinology",
  pulmonologist: "pulmonology",
  rheumatologist: "rheumatology",
};

export const INSURANCE_NAMES: Record<string, string> = {
  aetna: "Aetna",
  cigna: "Cigna",
  united: "UnitedHealth",
  unitedhealth: "UnitedHealth",
  "blue cross": "Blue Cross",
  bcbs: "Blue Cross",
  humana: "Humana",
  kaiser: "Kaiser",
  medicare: "Medicare",
  medicaid: "Medicaid",
};

const DAY_NAMES = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "today", "tomorrow",
] as const;

const APPOINTMENT_TYPES: Record<string, string> = {
  "annual physical": "annual physical",
  physical: "annual physical",
  checkup: "annual physical",
  "check up": "annual physical",
  "follow up": "follow up",
  "follow-up": "follow up",
  followup: "follow up",
  "video visit": "video visit",
  telehealth: "video visit",
  "video call": "video visit",
  "sick visit": "sick visit",
  "sick appointment": "sick visit",
};

export function extractEntities(input: string): EntityExtractionResult {
  const lower = input.toLowerCase().trim();
  const result: EntityExtractionResult = {};

  const medMatch = extractMedication(lower);
  if (medMatch) result.medication_name = medMatch;

  const doctorMatch = extractDoctor(lower);
  if (doctorMatch) result.doctor_name = doctorMatch;

  const dayMatch = extractDay(lower);
  if (dayMatch) result.day = dayMatch;

  const specialtyMatch = extractSpecialty(lower);
  if (specialtyMatch) result.specialty = specialtyMatch;

  const insuranceMatch = extractInsurance(lower);
  if (insuranceMatch) result.insurance = insuranceMatch;

  const aptTypeMatch = extractAppointmentType(lower);
  if (aptTypeMatch) result.appointment_type = aptTypeMatch;

  return result;
}

function extractMedication(input: string): string | undefined {
  for (const med of KNOWN_MEDICATIONS) {
    if (input.includes(med)) return med;
  }
  return undefined;
}

function extractDoctor(input: string): string | undefined {
  const patterns = [
    /(?:dr\.?|doctor)\s+([a-z]+)\b/i,
    /with\s+(?:dr\.?|doctor)\s+([a-z]+)\b/i,
    /see\s+(?:dr\.?|doctor)\s+([a-z]+)\b/i,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1].trim();
  }
  return undefined;
}

function extractDay(input: string): string | undefined {
  for (const day of DAY_NAMES) {
    if (input.includes(day)) return day;
  }
  const dayPatterns = [/\bon\s+(mon|tue|wed|thu|fri|sat|sun)/i];
  for (const pattern of dayPatterns) {
    const match = input.match(pattern);
    if (match) {
      const abbrev = match[1].toLowerCase();
      const map: Record<string, string> = {
        mon: "monday", tue: "tuesday", wed: "wednesday",
        thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday",
      };
      return map[abbrev];
    }
  }
  return undefined;
}

function extractSpecialty(input: string): string | undefined {
  for (const [alias, key] of Object.entries(SPECIALTY_ALIASES)) {
    if (input.includes(alias)) return key;
  }
  for (const key of Object.keys(SPECIALTIES)) {
    if (input.includes(key)) return key;
  }
  return undefined;
}

function extractInsurance(input: string): string | undefined {
  for (const key of Object.keys(INSURANCE_NAMES)) {
    if (input.includes(key)) return key;
  }
  return undefined;
}

function extractAppointmentType(input: string): string | undefined {
  for (const [phrase, type] of Object.entries(APPOINTMENT_TYPES)) {
    if (input.includes(phrase)) return type;
  }
  return undefined;
}
