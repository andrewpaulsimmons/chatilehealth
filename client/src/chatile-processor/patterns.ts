import type { IntentPattern } from "./types";

export const INTENT_PATTERNS: IntentPattern[] = [
  // ─── 2.1 Medications ───────────────────────────────────────

  {
    action: "refill_medication",
    patterns: [
      /re?fill\s*(my\s*)?/i,
      /reorder\s*(my\s*)?/i,
      /renew\s*(my\s*)?/i,
      /need\s*more\s/i,
      /want\s*more\s/i,
      /get\s*me\s*(another|a)\s*refill/i,
      /can\s*(i|you)\s*(re?fill|reorder|renew)/i,
      /running\s*(low|out)\s*(of|on)/i,
      /almost\s*out\s*of/i,
      /i'?m\s*out\s*of/i,
      /prescription\s*refill/i,
      /medication\s*refill/i,
    ],
    intent: {
      action: "refill_medication",
      breadcrumb: "Medications → Refill",
      path: "/medications",
      filters: {},
    },
    requiredEntities: ["medication_name"],
    entityPrompt: "Which medication would you like to refill?",
  },

  {
    action: "view_medications",
    patterns: [
      /show\s*(my\s*)?medi?c(ation|ine)s?/i,
      /view\s*(my\s*)?prescript(ion|ions)/i,
      /see\s*(my\s*)?meds/i,
      /check\s*(my\s*)?medi?c(ation|ine)s?/i,
      /list\s*(my\s*)?prescript(ion|ions)/i,
      /open\s*(my\s*)?medi?c(ation|ine)s?/i,
      /what\s*medi?c(ation|ine)s?\s*(am\s*i|do\s*i)/i,
      /what\s*meds\s*(am\s*i|do\s*i)/i,
      /what\s*prescript(ion|ions)\s*(do\s*i|have)/i,
      /my\s*medication\s*list/i,
      /medication\s*history/i,
      /prescription\s*list/i,
    ],
    intent: {
      action: "view_medications",
      breadcrumb: "Medications → Current Prescriptions",
      path: "/medications",
      filters: {},
    },
  },

  // ─── 2.2 Appointments ──────────────────────────────────────

  {
    action: "book_appointment",
    patterns: [
      /book\s*(an?\s*)?appointment/i,
      /schedule\s*(a\s*)?visit/i,
      /make\s*(an?\s*)?appointment/i,
      /set\s*up\s*(a\s*)?(consultation|appointment|visit)/i,
      /i\s*(want|need|'?d\s*like)\s*to\s*(schedule|book|make|set\s*up|see\s+a\s+doctor)/i,
      /can\s*(i|you)\s*(schedule|book|make|set\s*up)\s*/i,
      /see\s+dr\.?\s/i,
      /visit\s+dr\.?\s/i,
      /appointment\s*with\s*(dr\.?|doctor)/i,
      /appointment.*monday/i,
      /appointment.*tuesday/i,
      /appointment.*wednesday/i,
      /appointment.*thursday/i,
      /appointment.*friday/i,
      /appointment.*saturday/i,
      /appointment.*sunday/i,
      /appointment.*tomorrow/i,
      /appointment.*morning/i,
      /appointment.*afternoon/i,
      /get\s*(an?\s*)?appointment/i,
    ],
    intent: {
      action: "book_appointment",
      breadcrumb: "Appointments → Book → Select Time",
      path: "/appointments",
      filters: { action: "book" },
      needsDisambiguation: true,
    },
  },

  {
    action: "view_appointments",
    patterns: [
      /show\s*(my\s*)?appointments/i,
      /view\s*(my\s*)?(upcoming\s*)?visits/i,
      /see\s*(my\s*)?(scheduled\s*)?appointments/i,
      /check\s*(my\s*)?appointments/i,
      /when\s*(is|are)\s*(my\s*)?(next\s*)?appointment/i,
      /what'?s\s*my\s*next\s*visit/i,
      /my\s*appointment\s*(schedule|calendar|list|history)/i,
      /appointment\s*(calendar|list|history)/i,
      /do\s*i\s*have\s*(any\s*)?(upcoming\s*)?appointments/i,
      /any\s*appointments\s*(coming\s*up)?/i,
      /next\s*appointment/i,
      /upcoming\s*appointment/i,
    ],
    intent: {
      action: "view_appointments",
      breadcrumb: "Appointments → Upcoming",
      path: "/appointments",
      filters: { view: "upcoming" },
    },
  },

  // ─── 2.3 Find a Doctor ─────────────────────────────────────

  {
    action: "find_gp_primary",
    patterns: [
      /appointment.*gp/i,
      /appointment.*primary\s*(care|clinic)/i,
      /gp.*primary\s*clinic/i,
      /gp.*(next|when|available)/i,
      /primary\s*care.*appointment/i,
      /need.*appointment.*gp/i,
      /see.*gp/i,
      /gp.*appointment/i,
      /general\s*pract.*appointment/i,
      /primary\s*clinic.*(next|when|available)/i,
    ],
    intent: {
      action: "find_gp_primary",
      breadcrumb: "Find a Doctor → GP → Primary Clinic → Next Available",
      path: "/find-doctor",
      filters: { specialty: "gp", location: "primary" },
    },
  },

  {
    action: "find_doctor",
    patterns: [
      /find\s*(a\s*)?(doctor|physician|specialist)/i,
      /search\s*(for\s*)?(a\s*)?(doctor|physician|specialist)/i,
      /look(ing)?\s*for\s*(a\s*)?(doctor|physician|specialist)/i,
      /i\s*(want|need|'?d\s*like)\s*(an?\s*)?(cardiologist|dermatologist|neurologist|pediatrician|orthopedist|orthopedic\s*doctor|psychiatrist|gynecologist|urologist|oncologist|gastroenterologist|endocrinologist|pulmonologist|rheumatologist)/i,
      /i\s*(want|need|'?d\s*like)\s*to\s*find\s*(a\s*)?(doctor|specialist)/i,
      /looking\s*for\s*(an?\s*)?(cardiologist|dermatologist|neurologist|pediatrician|orthopedist|psychiatrist)/i,
      /who\s*are\s*the\s*available\s*doctors/i,
      /doctors\s*who\s*accept/i,
      /physicians\s*taking/i,
      /find\s*(a\s*)?(doctor|specialist)\s*accept(ing)?/i,
      /can\s*you\s*find\s*(me\s*)?(a\s*)?(good\s*)?(doctor|specialist|cardiologist|dermatologist)/i,
      /recommend\s*(a\s*)?(doctor|specialist|cardiologist|dermatologist)/i,
      /find\s*(a\s*)?primary\s*care/i,
      /i\s*need\s*(a\s*)?family\s*doctor/i,
      /looking\s*for\s*(an?\s*)?internist/i,
      /cardiologist/i,
      /dermatologist/i,
      /neurologist/i,
      /heart\s*doctor/i,
      /skin\s*doctor/i,
    ],
    intent: {
      action: "find_doctor",
      breadcrumb: "Find a Doctor",
      path: "/find-doctor",
      filters: {},
    },
  },

  // ─── 2.4 Test Results ──────────────────────────────────────

  {
    action: "view_test_results",
    patterns: [
      /show\s*(my\s*)?(test|lab)\s*results?/i,
      /view\s*(my\s*)?(test|lab)\s*results?/i,
      /see\s*(my\s*)?(blood\s*work|lab\s*results?|test\s*results?)/i,
      /check\s*(my\s*)?(diagnostic|lab|test)\s*(report|results?)/i,
      /i\s*(want|'?d\s*like)\s*to\s*(see|check|view)\s*(my\s*)?(test|lab)\s*results?/i,
      /what\s*(are|were)\s*(my\s*)?(test|lab)\s*(results?|values?)/i,
      /are\s*(my\s*)?(lab|test)?\s*results?\s*(ready|in|back|available)/i,
      /did\s*(my\s*)?(test|blood)\s*(results?|work)\s*(come\s*(in|back))?/i,
      /lab\s*work/i,
      /blood\s*work/i,
      /test\s*results?/i,
      /lab\s*results?/i,
      /blood\s*test/i,
      /cbc/i,
      /metabolic\s*panel/i,
    ],
    intent: {
      action: "view_test_results",
      breadcrumb: "Test Results → All Results",
      path: "/test-results",
      filters: {},
    },
  },

  // ─── 2.5 Messages ─────────────────────────────────────────

  {
    action: "message_doctor_followup",
    patterns: [
      /tell\s*(my\s*)?doctor.*follow\s*-?\s*up/i,
      /tell\s*(my\s*)?doctor.*appointment/i,
      /tell\s*(my\s*)?doctor.*need/i,
      /ask\s*(my\s*)?doctor.*follow\s*-?\s*up/i,
      /follow\s*-?\s*up.*appointment.*doctor/i,
      /doctor.*follow\s*-?\s*up/i,
      /need\s*a?\s*follow\s*-?\s*up/i,
      /send.*follow\s*-?\s*up.*doctor/i,
      /follow\s*-?\s*up.*(message|note|request).*doctor/i,
      /follow\s*-?\s*up.*doctor/i,
      /send.*follow\s*-?\s*up/i,
      /follow\s*-?\s*up\s*(message|note|request)/i,
    ],
    intent: {
      action: "message_doctor_followup",
      breadcrumb: "Messages → Compose → Follow-up Request",
      path: "/messages",
      filters: { action: "compose_followup" },
      needsDisambiguation: true,
    },
  },

  {
    action: "message_doctor",
    patterns: [
      /i\s*(want|need|'?d\s*like)\s*to\s*(message|contact|email|write\s*to)\s*(my\s*)?(doctor|physician|dr\.?)/i,
      /message\s*(dr\.?|doctor)\s/i,
      /contact\s*(dr\.?|doctor)\s/i,
      /email\s*(my\s*)?(doctor|physician)/i,
      /write\s*to\s*(dr\.?|doctor|my\s*doctor)/i,
      /send\s*(a\s*)?message\s*to\s*(dr\.?|doctor|my\s*doctor)/i,
      /compose\s*(a\s*)?message\s*to/i,
      /can\s*(i|you)\s*(send|write)\s*(a\s*)?message/i,
      /reach\s*(out\s*to\s*)?(my\s*)?(care\s*team|doctor|dr\.?)/i,
    ],
    intent: {
      action: "message_doctor",
      breadcrumb: "Messages → New Message",
      path: "/messages",
      filters: { action: "compose" },
    },
  },

  {
    action: "view_messages",
    patterns: [
      /show\s*(my\s*)?messages/i,
      /view\s*(my\s*)?(inbox|messages)/i,
      /see\s*(my\s*)?(mail|messages)/i,
      /check\s*(my\s*)?messages/i,
      /read\s*(my\s*)?messages/i,
      /open\s*(my\s*)?inbox/i,
      /my\s*(messages|inbox)/i,
      /do\s*i\s*have\s*(any\s*)?(new\s*)?messages/i,
      /any\s*(new\s*)?messages/i,
      /unread\s*messages/i,
    ],
    intent: {
      action: "view_messages",
      breadcrumb: "Messages → Inbox",
      path: "/messages",
      filters: {},
    },
  },

  // ─── 2.6 Billing ───────────────────────────────────────────

  {
    action: "pay_bill",
    patterns: [
      /i\s*(want|need|'?d\s*like)\s*to\s*(pay|make\s*a\s*payment)/i,
      /i\s*need\s*to\s*pay\b/i,
      /can\s*(i|you)\s*pay\s*(my\s*)?(bill|balance)/i,
      /pay\s*(my\s*)?(bill|balance|charges)/i,
      /make\s*(a\s*)?payment/i,
      /submit\s*(a\s*)?payment/i,
      /set\s*up\s*autopay/i,
      /arrange\s*automatic\s*payments/i,
      /start\s*(a\s*)?payment\s*plan/i,
      /pay\s*off/i,
    ],
    intent: {
      action: "pay_bill",
      breadcrumb: "Billing → Pay Balance → Review",
      path: "/billing",
      filters: { action: "pay" },
    },
  },

  {
    action: "view_billing",
    patterns: [
      /show\s*(my\s*)?(bills?|charges|statements?)/i,
      /view\s*(my\s*)?(bills?|charges|statements?)/i,
      /see\s*(my\s*)?(bills?|charges|statements?)/i,
      /check\s*(my\s*)?(balance|bills?)/i,
      /what\s*(do\s*i\s*owe|is\s*my\s*balance|'?s\s*my\s*(amount\s*due|balance))/i,
      /how\s*much\s*(do\s*i\s*owe|is\s*my\s*(bill|balance))/i,
      /my\s*(bills?|balance)/i,
      /billing\s*(summary|history)/i,
      /do\s*i\s*have\s*(any\s*)?(outstanding\s*)?bills?/i,
      /any\s*charges/i,
    ],
    intent: {
      action: "view_billing",
      breadcrumb: "Billing → Current Balance",
      path: "/billing",
      filters: {},
    },
  },

  {
    action: "billing_estimates",
    patterns: [
      /how\s*much\s*will\s*(my\s*)?(visit|procedure)\s*cost/i,
      /cost\s*estimate/i,
      /price\s*for\s*(a\s*)?procedure/i,
      /what\s*will\s*i\s*pay/i,
    ],
    intent: {
      action: "billing_estimates",
      breadcrumb: "Billing → Cost Estimates",
      path: "/billing",
      filters: { view: "estimates" },
    },
  },

  {
    action: "billing_inquiries",
    patterns: [
      /dispute\s*(a\s*)?charge/i,
      /billing\s*question/i,
      /ask\s*about\s*(a\s*)?bill/i,
      /i\s*have\s*(a\s*)?billing\s*issue/i,
    ],
    intent: {
      action: "billing_inquiries",
      breadcrumb: "Billing → Inquiry",
      path: "/billing",
      filters: { view: "inquiry" },
    },
  },

  // ─── Find Care (new) ──────────────────────────────────────

  {
    action: "virtual_urgent_care",
    patterns: [
      /start\s*(a\s*)?video\s*visit/i,
      /virtual\s*urgent\s*care/i,
      /telehealth\s*visit/i,
      /i\s*need\s*to\s*see\s*(a\s*)?doctor\s*(now|right\s*now|immediately|asap)/i,
      /video\s*call\s*with\s*(a\s*)?doctor/i,
      /online\s*doctor\s*visit/i,
      /virtual\s*visit/i,
    ],
    intent: {
      action: "virtual_urgent_care",
      breadcrumb: "Virtual Care → Start Visit",
      path: "/virtual-care",
      filters: {},
    },
  },

  {
    action: "schedule_preventive_care",
    patterns: [
      /schedule\s*(a\s*)?screening/i,
      /book\s*(a\s*)?checkup/i,
      /wellness\s*visit/i,
      /schedule\s*preventive\s*care/i,
      /i\s*need\s*(a\s*)?physical/i,
    ],
    intent: {
      action: "schedule_preventive_care",
      breadcrumb: "Preventive Care → Schedule",
      path: "/preventive-care",
      filters: {},
    },
  },

  {
    action: "view_care_team",
    patterns: [
      /show\s*(my\s*)?care\s*team/i,
      /who\s*are\s*my\s*doctors/i,
      /my\s*providers/i,
      /care\s*team\s*contact/i,
      /who\s*is\s*my\s*doctor/i,
    ],
    intent: {
      action: "view_care_team",
      breadcrumb: "Care Team → My Providers",
      path: "/care-team",
      filters: {},
    },
  },

  {
    action: "emergency_care",
    patterns: [
      /find\s*(an?\s*)?er\b/i,
      /nearest\s*emergency\s*room/i,
      /urgent\s*care\s*near\s*me/i,
      /i\s*need\s*emergency\s*help/i,
      /where\s*is\s*the\s*closest\s*er/i,
      /emergency\s*room/i,
    ],
    intent: {
      action: "emergency_care",
      breadcrumb: "Emergency & Urgent Care",
      path: "/emergency-care",
      filters: {},
    },
  },

  // ─── Communication (new) ──────────────────────────────────

  {
    action: "view_letters",
    patterns: [
      /show\s*(my\s*)?letters/i,
      /view\s*(my\s*)?correspondence/i,
      /letters\s*from\s*(my\s*)?doctor/i,
    ],
    intent: {
      action: "view_letters",
      breadcrumb: "Letters → Correspondence",
      path: "/letters",
      filters: {},
    },
  },

  // ─── My Record (new) ──────────────────────────────────────

  {
    action: "health_summary",
    patterns: [
      /show\s*(my\s*)?health\s*summary/i,
      /my\s*conditions/i,
      /my\s*allergies/i,
      /my\s*immunizations/i,
      /health\s*overview/i,
      /what\s*conditions\s*do\s*i\s*have/i,
    ],
    intent: {
      action: "health_summary",
      breadcrumb: "Health Summary → Overview",
      path: "/health-summary",
      filters: {},
    },
  },

  {
    action: "view_radiology",
    patterns: [
      /show\s*(my\s*)?(x-?rays?|xrays?)/i,
      /view\s*(my\s*)?mri/i,
      /radiology\s*images/i,
      /my\s*ct\s*scan\s*results?/i,
      /imaging\s*results?/i,
    ],
    intent: {
      action: "view_radiology",
      breadcrumb: "Radiology → Images",
      path: "/radiology",
      filters: {},
    },
  },

  {
    action: "questionnaires",
    patterns: [
      /show\s*(my\s*)?questionnaires?/i,
      /pre-?visit\s*forms?/i,
      /intake\s*forms?/i,
      /complete\s*(my\s*)?questionnaire/i,
      /i\s*have\s*(a\s*)?form\s*to\s*fill/i,
    ],
    intent: {
      action: "questionnaires",
      breadcrumb: "Questionnaires → Pending",
      path: "/questionnaires",
      filters: {},
    },
  },

  {
    action: "medical_history",
    patterns: [
      /show\s*(my\s*)?medical\s*history/i,
      /view\s*(my\s*)?surgical\s*history/i,
      /family\s*health\s*history/i,
      /update\s*(my\s*)?medical\s*history/i,
    ],
    intent: {
      action: "medical_history",
      breadcrumb: "Medical History",
      path: "/medical-history",
      filters: {},
    },
  },

  {
    action: "track_health",
    patterns: [
      /log\s*(my\s*)?blood\s*pressure/i,
      /track\s*(my\s*)?weight/i,
      /record\s*(my\s*)?glucose/i,
      /enter\s*(my\s*)?vitals/i,
      /log\s*exercise/i,
      /my\s*health\s*metrics/i,
    ],
    intent: {
      action: "track_health",
      breadcrumb: "Track My Health → Metrics",
      path: "/track-health",
      filters: {},
    },
  },

  {
    action: "document_center",
    patterns: [
      /show\s*(my\s*)?documents/i,
      /upload\s*(a\s*)?document/i,
      /my\s*uploaded\s*files/i,
      /document\s*center/i,
    ],
    intent: {
      action: "document_center",
      breadcrumb: "Documents → My Files",
      path: "/documents",
      filters: {},
    },
  },

  {
    action: "advance_care_planning",
    patterns: [
      /advance\s*directives?/i,
      /my\s*healthcare\s*proxy/i,
      /living\s*will/i,
      /advance\s*care\s*planning/i,
      /who\s*is\s*my\s*healthcare\s*agent/i,
    ],
    intent: {
      action: "advance_care_planning",
      breadcrumb: "Advance Care Planning",
      path: "/advance-care",
      filters: {},
    },
  },

  {
    action: "covid_info",
    patterns: [
      /my\s*covid\s*vaccine\s*record/i,
      /covid\s*test\s*results?/i,
      /covid\s*vaccin/i,
      /vaccination\s*status/i,
      /am\s*i\s*up\s*to\s*date\s*on\s*covid/i,
      /\bcovid\b/i,
    ],
    intent: {
      action: "covid_info",
      breadcrumb: "COVID-19 → Records",
      path: "/covid",
      filters: {},
    },
  },

  {
    action: "view_todo",
    patterns: [
      /show\s*(my\s*)?to-?do\s*list/i,
      /what\s*do\s*i\s*need\s*to\s*do/i,
      /pending\s*tasks/i,
      /action\s*items/i,
      /things\s*needing\s*(my\s*)?attention/i,
      /my\s*to-?do/i,
    ],
    intent: {
      action: "view_todo",
      breadcrumb: "To Do → Pending Items",
      path: "/todo",
      filters: {},
    },
  },

  // ─── Insurance & Pharmacy ─────────────────────────────────

  {
    action: "insurance_summary",
    patterns: [
      /go\s*to\s*(my\s*)?insurance/i,
      /view\s*(my\s*)?insurance/i,
      /see\s*(my\s*)?coverage/i,
      /check\s*(my\s*)?(plan|insurance|coverage)/i,
      /my\s*insurance\s*(info|card|id)/i,
      /my\s*coverage/i,
      /what\s*is\s*my\s*insurance/i,
      /what\s*are\s*my\s*coverage\s*details/i,
      /insurance\s*card/i,
      /member\s*id/i,
    ],
    intent: {
      action: "insurance_summary",
      breadcrumb: "Insurance → My Plan",
      path: "/insurance",
      filters: {},
    },
  },

  {
    action: "manage_pharmacies",
    patterns: [
      /go\s*to\s*pharmacy/i,
      /view\s*(my\s*)?pharma(cy|cies)/i,
      /show\s*(my\s*)?pharma(cy|cies)/i,
      /find\s*(a\s*)?pharmacy/i,
      /where\s*is\s*the\s*nearest\s*pharmacy/i,
    ],
    intent: {
      action: "manage_pharmacies",
      breadcrumb: "Pharmacy → My Pharmacies",
      path: "/pharmacy",
      filters: {},
    },
  },

  // ─── Records Sharing ──────────────────────────────────────

  {
    action: "share_record",
    patterns: [
      /share\s*(my\s*)?records/i,
      /send\s*(my\s*)?records\s*to/i,
      /share\s*(my\s*)?medical\s*records/i,
    ],
    intent: {
      action: "share_record",
      breadcrumb: "Records → Share",
      path: "/records",
      filters: { view: "share" },
    },
  },

  {
    action: "link_accounts",
    patterns: [
      /link\s*(my\s*)?accounts/i,
      /connect\s*another\s*hospital/i,
      /merge\s*(my\s*)?(health\s*)?records/i,
    ],
    intent: {
      action: "link_accounts",
      breadcrumb: "Records → Link Accounts",
      path: "/records",
      filters: { view: "link" },
    },
  },

  {
    action: "request_medical_record",
    patterns: [
      /request\s*(my\s*)?medical\s*records?/i,
      /get\s*(a\s*)?copy\s*of\s*(my\s*)?records/i,
      /download\s*(my\s*)?health\s*records/i,
    ],
    intent: {
      action: "request_medical_record",
      breadcrumb: "Records → Request Copy",
      path: "/records",
      filters: { view: "request" },
    },
  },

  // ─── Resources ─────────────────────────────────────────────

  {
    action: "research_studies",
    patterns: [
      /clinical\s*trials?/i,
      /research\s*stud(y|ies)/i,
      /am\s*i\s*eligible\s*for\s*(a\s*)?study/i,
      /research\s*opportunities/i,
    ],
    intent: {
      action: "research_studies",
      breadcrumb: "Resources → Research Studies",
      path: "/resources",
      filters: { view: "research" },
    },
  },

  {
    action: "education",
    patterns: [
      /health\s*articles/i,
      /patient\s*education/i,
      /learn\s*about\s*/i,
      /health\s*resources/i,
    ],
    intent: {
      action: "education",
      breadcrumb: "Resources → Health Education",
      path: "/resources",
      filters: { view: "education" },
    },
  },

  {
    action: "care_instructions",
    patterns: [
      /after-?visit\s*instructions/i,
      /discharge\s*summary/i,
      /care\s*plan/i,
      /my\s*care\s*instructions/i,
    ],
    intent: {
      action: "care_instructions",
      breadcrumb: "Resources → Care Instructions",
      path: "/resources",
      filters: { view: "instructions" },
    },
  },

  {
    action: "organ_donation",
    patterns: [
      /organ\s*donation/i,
      /donor\s*registration/i,
      /am\s*i\s*(a\s*)?registered\s*donor/i,
    ],
    intent: {
      action: "organ_donation",
      breadcrumb: "Resources → Organ Donation",
      path: "/resources",
      filters: { view: "organ-donation" },
    },
  },

  // ─── Settings ──────────────────────────────────────────────

  {
    action: "personal_information",
    patterns: [
      /go\s*to\s*(my\s*)?(profile|account)/i,
      /view\s*(my\s*)?(profile|account)/i,
      /edit\s*(my\s*)?(account\s*info|profile)/i,
      /see\s*(my\s*)?account\s*details/i,
      /my\s*(profile|account\s*information)/i,
    ],
    intent: {
      action: "personal_information",
      breadcrumb: "Settings → Personal Information",
      path: "/settings",
      filters: { view: "personal" },
    },
  },

  {
    action: "security_settings",
    patterns: [
      /change\s*(my\s*)?password/i,
      /set\s*up\s*2fa/i,
      /two-?factor\s*authentication/i,
      /manage\s*(my\s*)?security/i,
      /active\s*sessions/i,
    ],
    intent: {
      action: "security_settings",
      breadcrumb: "Settings → Security",
      path: "/settings",
      filters: { view: "security" },
    },
  },

  {
    action: "notifications",
    patterns: [
      /manage\s*(my\s*)?notifications/i,
      /notification\s*settings/i,
      /turn\s*off\s*email\s*alerts/i,
      /text\s*message\s*preferences/i,
      /go\s*to\s*(my\s*)?(notifications|alerts)/i,
      /show\s*(my\s*)?notifications/i,
      /view\s*(my\s*)?alerts/i,
      /check\s*(my\s*)?notifications/i,
      /any\s*(new\s*)?(notifications|alerts)/i,
    ],
    intent: {
      action: "notifications",
      breadcrumb: "Settings → Notifications",
      path: "/settings",
      filters: { view: "notifications" },
    },
  },

  {
    action: "scheduling_preferences",
    patterns: [
      /scheduling\s*preferences/i,
      /preferred\s*appointment\s*times/i,
      /set\s*(my\s*)?availability/i,
    ],
    intent: {
      action: "scheduling_preferences",
      breadcrumb: "Settings → Scheduling Preferences",
      path: "/settings",
      filters: { view: "scheduling" },
    },
  },

  {
    action: "navigate_settings",
    patterns: [
      /go\s*to\s*settings/i,
      /go\s*to\s*preferences/i,
      /go\s*to\s*account\s*settings/i,
      /open\s*settings/i,
      /show\s*(my\s*)?preferences/i,
      /change\s*(my\s*)?settings/i,
      /update\s*(my\s*)?preferences/i,
      /edit\s*(my\s*)?account/i,
    ],
    intent: {
      action: "navigate_settings",
      breadcrumb: "Settings",
      path: "/settings",
      filters: {},
    },
  },

  // ─── Help ──────────────────────────────────────────────────

  {
    action: "help_desk",
    patterns: [
      /go\s*to\s*(help|support|faq)/i,
      /i\s*need\s*(help|support|assistance)/i,
      /contact\s*(support|customer\s*service|help\s*desk|us)/i,
      /billing\s*faq/i,
      /frequently\s*asked/i,
    ],
    intent: {
      action: "help_desk",
      breadcrumb: "Help & Support",
      path: "/help",
      filters: {},
    },
  },

  // ─── Navigation ────────────────────────────────────────────

  {
    action: "navigate_home",
    patterns: [
      /go\s*(to\s*)?(home|the\s*dashboard|main\s*page)/i,
      /take\s*me\s*(home|to\s*the\s*dashboard)/i,
      /^home$/i,
      /^dashboard$/i,
    ],
    intent: {
      action: "navigate_home",
      breadcrumb: "",
      path: "/",
      filters: {},
    },
  },
];
