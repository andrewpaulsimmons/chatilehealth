import type { MatchResult, ResolvedIntent, DisambiguationOption } from "./types";
import { INTENT_PATTERNS } from "./patterns";
import { extractEntities, MEDICATION_DISPLAY, SPECIALTIES, INSURANCE_NAMES } from "./entities";

export function resolveInput(input: string): MatchResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: "no_match", intent: null, entities: {} };
  }

  const lower = trimmed.toLowerCase();
  const entities = extractEntities(lower);

  // Dynamic medication refill — check before generic patterns so
  // "refill my lisinopril" doesn't fall through to view_medications
  if (isRefillQuery(lower)) {
    if (entities.medication_name) {
      const display = MEDICATION_DISPLAY[entities.medication_name] ?? entities.medication_name;
      return {
        type: "exact",
        intent: {
          action: "refill_medication",
          breadcrumb: `Medications → ${display} → Refill`,
          path: "/medications",
          filters: {},
          highlight: entities.medication_name,
        },
        entities,
      };
    }
    return {
      type: "entity_needed",
      intent: {
        action: "refill_medication",
        breadcrumb: "Medications → Refill",
        path: "/medications",
        filters: {},
      },
      entities,
      prompt: "Which medication would you like to refill?",
    };
  }

  // Urgent care check — "I need to see a doctor now" should go to virtual care, not book_appointment
  if (/doctor\s*(now|right\s*now|immediately|asap)/i.test(lower)) {
    const urgentPattern = INTENT_PATTERNS.find((p) => p.action === "virtual_urgent_care");
    if (urgentPattern) {
      return { type: "exact", intent: urgentPattern.intent, entities };
    }
  }

  // COVID check before general test results to avoid "COVID test results" matching view_test_results
  if (/\bcovid\b|vaccination\s*status/i.test(lower)) {
    const covidPattern = INTENT_PATTERNS.find((p) => p.action === "covid_info");
    if (covidPattern) {
      return { type: "exact", intent: covidPattern.intent, entities };
    }
  }

  for (const pattern of INTENT_PATTERNS) {
    if (pattern.action === "refill_medication" || pattern.action === "covid_info") continue;

    for (const regex of pattern.patterns) {
      if (regex.test(lower)) {
        const intent = buildIntent(pattern.intent, entities);

        if (pattern.requiredEntities?.length) {
          const missing = pattern.requiredEntities.filter((e) => !entities[e]);
          if (missing.length > 0) {
            return {
              type: "entity_needed",
              intent,
              entities,
              prompt: pattern.entityPrompt ?? `Please provide: ${missing.join(", ")}`,
            };
          }
        }

        if (intent.needsDisambiguation) {
          return {
            type: "disambiguate",
            intent,
            entities,
            options: getDisambiguationOptions(intent.action),
          };
        }

        return { type: "exact", intent, entities };
      }
    }
  }

  return { type: "no_match", intent: null, entities: {} };
}

function isRefillQuery(input: string): boolean {
  return /re?fill|reorder|renew|need\s*more|want\s*more|running\s*(low|out)|almost\s*out|i'?m\s*out\s*of/i.test(input);
}

function buildIntent(base: ResolvedIntent, entities: ReturnType<typeof extractEntities>): ResolvedIntent {
  const intent = { ...base, filters: { ...base.filters } };

  if (entities.specialty && intent.action === "find_doctor") {
    const label = SPECIALTIES[entities.specialty] ?? entities.specialty;
    intent.breadcrumb = `Find a Doctor → ${label}`;
    intent.filters!.specialty = entities.specialty;
  }

  if (entities.insurance && intent.action === "find_doctor") {
    const label = INSURANCE_NAMES[entities.insurance] ?? entities.insurance;
    intent.breadcrumb += ` → ${label}`;
    intent.filters!.insurance = entities.insurance;
  }

  if (entities.doctor_name && (intent.action === "book_appointment" || intent.action === "message_doctor")) {
    intent.filters!.doctorName = entities.doctor_name;
  }

  if (entities.day && intent.action === "book_appointment") {
    intent.filters!.day = entities.day;
  }

  if (entities.appointment_type) {
    intent.filters!.appointmentType = entities.appointment_type;
  }

  if (intent.action === "view_test_results" && /blood\s*work|lab\s*(results?|work)/i.test(JSON.stringify(entities))) {
    intent.filters!.category = "lab";
  }

  return intent;
}

function getDisambiguationOptions(action: string): DisambiguationOption[] {
  if (action === "message_doctor_followup" || action === "message_doctor") {
    return [
      {
        id: "dr-chen",
        label: "Dr. Sarah Chen, MD",
        subtitle: "Internal Medicine · Last message Feb 16",
        action: "message_doctor_followup",
        path: "/messages",
      },
      {
        id: "dr-torres",
        label: "Dr. Michael Torres, MD",
        subtitle: "Family Medicine · Last message Feb 13",
        action: "message_doctor_followup",
        path: "/messages",
      },
    ];
  }

  if (action === "book_appointment") {
    return [
      {
        id: "slot-1",
        label: "Monday, Feb 23 at 8:30 AM",
        subtitle: "Dr. Sarah Chen · Chatile Health Internal Medicine",
        action: "book_appointment",
        path: "/appointments",
      },
      {
        id: "slot-2",
        label: "Monday, Feb 23 at 10:15 AM",
        subtitle: "Dr. Sarah Chen · Chatile Health Internal Medicine",
        action: "book_appointment",
        path: "/appointments",
      },
      {
        id: "slot-3",
        label: "Tuesday, Feb 24 at 9:00 AM",
        subtitle: "Dr. Sarah Chen · Chatile Health Internal Medicine",
        action: "book_appointment",
        path: "/appointments",
      },
    ];
  }

  return [];
}

export { extractEntities } from "./entities";
