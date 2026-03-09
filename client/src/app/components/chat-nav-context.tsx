import React, { createContext, useContext, useState, useCallback } from "react";

export interface ChatNavIntent {
  action: string;
  breadcrumb: string;
  path: string;
  filters?: Record<string, string>;
  highlight?: string;
  needsDisambiguation?: boolean;
}

export interface DisambiguationOption {
  id: string;
  label: string;
  subtitle: string;
  avatar: string;
  avatarColor: string;
}

interface ChatNavState {
  isProcessing: boolean;
  currentIntent: ChatNavIntent | null;
  breadcrumb: string | null;
  inputValue: string;
  showTypingDemo: boolean;
  disambiguationOptions: DisambiguationOption[] | null;
  pendingIntent: ChatNavIntent | null;
  pendingMessage: string | null;
  setInputValue: (v: string) => void;
  resolveIntent: (query: string) => ChatNavIntent | null;
  setCurrentIntent: (intent: ChatNavIntent | null) => void;
  setBreadcrumb: (b: string | null) => void;
  setIsProcessing: (b: boolean) => void;
  setShowTypingDemo: (b: boolean) => void;
  setDisambiguationOptions: (opts: DisambiguationOption[] | null) => void;
  setPendingIntent: (intent: ChatNavIntent | null) => void;
  setPendingMessage: (msg: string | null) => void;
  clearNav: () => void;
}

const ChatNavContext = createContext<ChatNavState | null>(null);

export function useChatNav() {
  const ctx = useContext(ChatNavContext);
  if (!ctx) throw new Error("useChatNav must be used within ChatNavProvider");
  return ctx;
}

const INTENT_MAP: Array<{
  patterns: RegExp[];
  intent: ChatNavIntent;
}> = [
  {
    patterns: [
      /blood\s*work/i,
      /lab\s*(results?|work)/i,
      /cbc/i,
      /blood\s*test/i,
      /metabolic\s*panel/i,
    ],
    intent: {
      action: "view_test_results",
      breadcrumb: "Test Results \u2192 Lab Work \u2192 Last 7 days",
      path: "/test-results",
      filters: { category: "lab", dateRange: "last7days" },
    },
  },
  {
    patterns: [
      /test\s*results?/i,
      /my\s*results?/i,
    ],
    intent: {
      action: "view_test_results",
      breadcrumb: "Test Results \u2192 All Results",
      path: "/test-results",
      filters: {},
    },
  },
  {
    patterns: [
      /medication/i,
      /prescription/i,
      /my\s*meds/i,
    ],
    intent: {
      action: "view_medications",
      breadcrumb: "Medications \u2192 Current Prescriptions",
      path: "/medications",
      filters: {},
    },
  },
  {
    patterns: [
      /cardiologist.*aetna/i,
      /aetna.*cardiologist/i,
      /find.*cardiologist/i,
      /heart\s*doctor/i,
    ],
    intent: {
      action: "find_doctor",
      breadcrumb: "Find a Doctor \u2192 Cardiology \u2192 Aetna",
      path: "/find-doctor",
      filters: { specialty: "cardiology", insurance: "aetna" },
    },
  },
  {
    patterns: [
      /appointment.*gp/i,
      /appointment.*primary\s*(care|clinic)/i,
      /gp.*primary\s*clinic/i,
      /gp.*(next|when|available)/i,
      /primary\s*care.*appointment/i,
      /need.*appointment.*gp/i,
      /see.*gp/i,
      /gp.*appointment/i,
      /appointment.*general\s*pract/i,
      /general\s*pract.*appointment/i,
      /primary\s*clinic.*(next|when|available)/i,
    ],
    intent: {
      action: "find_gp_primary",
      breadcrumb: "Find a Doctor \u2192 GP \u2192 Primary Clinic \u2192 Next Available",
      path: "/find-doctor",
      filters: { specialty: "gp", location: "primary" },
    },
  },
  {
    patterns: [
      /find.*doctor/i,
      /search.*doctor/i,
      /find.*specialist/i,
    ],
    intent: {
      action: "find_doctor",
      breadcrumb: "Find a Doctor",
      path: "/find-doctor",
      filters: {},
    },
  },
  {
    patterns: [
      /appointment.*monday/i,
      /appointment.*doctor.*morning/i,
      /can\s*i\s*(get|have|book|make|schedule)\s*(an?\s*)?appointment/i,
      /get\s*(an?\s*)?appointment.*doctor/i,
      /see\s*(my\s*)?doctor.*(monday|tuesday|wednesday|thursday|friday|this\s*week|next\s*week|morning|afternoon)/i,
    ],
    intent: {
      action: "book_appointment",
      breadcrumb: "Appointments \u2192 Book \u2192 Select Time",
      path: "/appointments",
      filters: { action: "book" },
      needsDisambiguation: true,
    },
  },
  {
    patterns: [
      /next\s*appointment/i,
      /upcoming\s*appointment/i,
      /when.*appointment/i,
      /my\s*appointment/i,
    ],
    intent: {
      action: "view_appointments",
      breadcrumb: "Appointments \u2192 Upcoming",
      path: "/appointments",
      filters: { view: "upcoming" },
    },
  },
  {
    patterns: [
      /schedule.*appointment/i,
      /book.*appointment/i,
    ],
    intent: {
      action: "schedule_appointment",
      breadcrumb: "Appointments \u2192 Schedule New",
      path: "/appointments",
      filters: { view: "schedule" },
    },
  },
  {
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
    patterns: [
      /message.*doctor/i,
      /write.*doctor/i,
      /contact.*doctor/i,
      /ask.*doctor/i,
    ],
    intent: {
      action: "message_doctor",
      breadcrumb: "Messages \u2192 New Message",
      path: "/messages",
      filters: { action: "compose" },
    },
  },
  {
    patterns: [
      /message/i,
      /inbox/i,
    ],
    intent: {
      action: "view_messages",
      breadcrumb: "Messages \u2192 Inbox",
      path: "/messages",
      filters: {},
    },
  },
  {
    patterns: [
      /pay\s*(my\s*)?(bill|balance|outstanding)/i,
      /make\s*a?\s*payment/i,
      /pay\s*(the\s*)?(bill|balance)/i,
      /pay\s+off/i,
    ],
    intent: {
      action: "pay_bill",
      breadcrumb: "Billing \u2192 Pay Balance \u2192 Review",
      path: "/billing",
      filters: { action: "pay" },
    },
  },
  {
    patterns: [
      /bill/i,
      /payment/i,
      /balance/i,
    ],
    intent: {
      action: "view_billing",
      breadcrumb: "Billing \u2192 Current Balance",
      path: "/billing",
      filters: {},
    },
  },
];

const KNOWN_MEDICATIONS: Array<{ id: string; name: string; label: string }> = [
  { id: "metformin", name: "metformin", label: "Metformin 500mg" },
  { id: "lisinopril", name: "lisinopril", label: "Lisinopril 10mg" },
  { id: "atorvastatin", name: "atorvastatin", label: "Atorvastatin 20mg" },
];

export function ChatNavProvider({ children }: { children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<ChatNavIntent | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showTypingDemo, setShowTypingDemo] = useState(false);
  const [disambiguationOptions, setDisambiguationOptions] = useState<DisambiguationOption[] | null>(null);
  const [pendingIntent, setPendingIntent] = useState<ChatNavIntent | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const resolveIntent = useCallback((query: string): ChatNavIntent | null => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return null;

    // Dynamic medication refill check — runs before the static map
    // so "refill my lisinopril" doesn't fall through to generic /medication/
    const isRefillQuery = /r[e]?fill/i.test(trimmed);
    if (isRefillQuery) {
      for (const med of KNOWN_MEDICATIONS) {
        if (trimmed.includes(med.name)) {
          return {
            action: "refill_medication",
            breadcrumb: `Medications \u2192 ${med.label} \u2192 Refill`,
            path: "/medications",
            filters: {},
            highlight: med.id,
          };
        }
      }
    }
    // Also check if a medication name is mentioned with the word "refill" in either order
    for (const med of KNOWN_MEDICATIONS) {
      if (trimmed.includes(med.name) && /r[e]?fill/i.test(trimmed)) {
        return {
          action: "refill_medication",
          breadcrumb: `Medications \u2192 ${med.label} \u2192 Refill`,
          path: "/medications",
          filters: {},
          highlight: med.id,
        };
      }
    }

    for (const mapping of INTENT_MAP) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(trimmed)) {
          return mapping.intent;
        }
      }
    }
    return null;
  }, []);

  const clearNav = useCallback(() => {
    setCurrentIntent(null);
    setBreadcrumb(null);
    setInputValue("");
    setIsProcessing(false);
    setDisambiguationOptions(null);
    setPendingIntent(null);
    setPendingMessage(null);
  }, []);

  return (
    <ChatNavContext.Provider
      value={{
        isProcessing,
        currentIntent,
        breadcrumb,
        inputValue,
        showTypingDemo,
        disambiguationOptions,
        pendingIntent,
        pendingMessage,
        setInputValue,
        resolveIntent,
        setCurrentIntent,
        setBreadcrumb,
        setIsProcessing,
        setShowTypingDemo,
        setDisambiguationOptions,
        setPendingIntent,
        setPendingMessage,
        clearNav,
      }}
    >
      {children}
    </ChatNavContext.Provider>
  );
}