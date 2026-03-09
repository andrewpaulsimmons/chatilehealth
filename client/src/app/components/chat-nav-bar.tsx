import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Search, Mic, X, Sparkles, ArrowRight, ChevronRight, User, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChatNav, DisambiguationOption } from "./chat-nav-context";
import confetti from "canvas-confetti";

// Fires a celebratory confetti burst from the center of the viewport
function fireConfetti() {
  const duration = 2200;
  const end = Date.now() + duration;

  // Initial big burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.45 },
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"],
    startVelocity: 35,
    gravity: 1.2,
    ticks: 120,
    zIndex: 9999,
  });

  // Sustained smaller bursts
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x: 0.35 + Math.random() * 0.3, y: 0.4 + Math.random() * 0.15 },
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
      startVelocity: 20,
      gravity: 1.4,
      ticks: 80,
      zIndex: 9999,
    });
  }, 350);

  // Safety cleanup
  setTimeout(() => clearInterval(interval), duration + 500);
}

// ─── Demo cursor helpers ───────────────────────────────────
// These operate directly on #demo-cursor / #demo-cursor-ripple in the DOM
// for buttery-smooth animation without React re-render overhead.

const CURSOR_MOVE = 450; // ms — matches CSS transition on #demo-cursor

function moveCursorTo(selector: string) {
  const el = document.querySelector(selector) as HTMLElement | null;
  const cursor = document.getElementById("demo-cursor");
  if (!el || !cursor) return;
  const rect = el.getBoundingClientRect();
  // Point the cursor tip (top-left of SVG) at the centre of the element
  cursor.style.left = `${rect.left + rect.width / 2}px`;
  cursor.style.top = `${rect.top + rect.height / 2}px`;
}

function moveCursorToXY(x: number, y: number) {
  const cursor = document.getElementById("demo-cursor");
  if (!cursor) return;
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
}

function showCursor() {
  const cursor = document.getElementById("demo-cursor");
  if (cursor) cursor.style.opacity = "1";
}

function hideCursor() {
  const cursor = document.getElementById("demo-cursor");
  if (cursor) cursor.style.opacity = "0";
}

function cursorClickDown() {
  const cursor = document.getElementById("demo-cursor");
  const ripple = document.getElementById("demo-cursor-ripple");
  if (cursor) cursor.style.transform = "scale(0.82)";
  if (ripple) {
    ripple.style.transform = "scale(1)";
    ripple.style.opacity = "1";
  }
}

function cursorClickUp() {
  const cursor = document.getElementById("demo-cursor");
  const ripple = document.getElementById("demo-cursor-ripple");
  if (cursor) cursor.style.transform = "scale(1)";
  if (ripple) {
    ripple.style.transform = "scale(1.6)";
    ripple.style.opacity = "0";
    setTimeout(() => {
      if (ripple) ripple.style.transform = "scale(0)";
    }, 350);
  }
}

/** Position cursor instantly (no transition) — for initial placement. */
function teleportCursor(x: number, y: number) {
  const cursor = document.getElementById("demo-cursor");
  if (!cursor) return;
  const saved = cursor.style.transition;
  cursor.style.transition = "opacity 0.25s ease";
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  // Restore transition after a tick so subsequent moves animate
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cursor.style.transition = saved;
    });
  });
}

/**
 * Programmatically set a React-controlled <textarea>'s value and fire the
 * synthetic input event so React picks up the change.
 */
function setTextareaNativeValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;
  if (setter) {
    setter.call(textarea, value);
    // Reset React's internal value tracker so it detects the change
    const tracker = (textarea as any)._valueTracker;
    if (tracker) {
      tracker.setValue("");
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

/**
 * Measure the viewport-pixel coordinates of a caret position inside a <textarea>
 * by creating a hidden mirror <div> with identical text-layout styles.
 */
function getCaretCoords(
  ta: HTMLTextAreaElement,
  charIdx: number
): { x: number; y: number } {
  const mirror = document.createElement("div");
  const cs = getComputedStyle(ta);
  const layoutProps = [
    "fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing",
    "textTransform", "wordSpacing", "textIndent", "paddingTop", "paddingRight",
    "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth",
    "borderBottomWidth", "borderLeftWidth", "boxSizing", "lineHeight",
  ];
  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.overflow = "hidden";
  mirror.style.width = cs.width;
  for (const p of layoutProps) (mirror.style as any)[p] = (cs as any)[p];

  // Text up to the target index, then a marker span whose left edge = caret x
  mirror.textContent = ta.value.substring(0, charIdx);
  const marker = document.createElement("span");
  marker.textContent = ".";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const mr = marker.getBoundingClientRect();
  const mirrorR = mirror.getBoundingClientRect();
  const taR = ta.getBoundingClientRect();
  document.body.removeChild(mirror);

  return {
    x: taR.left + (mr.left - mirrorR.left),
    y: taR.top + (mr.top - mirrorR.top) - ta.scrollTop,
  };
}

/** Normal cursor transition (must match demo-cursor.tsx). */
const CURSOR_TRANSITION_NORMAL =
  "left 0.45s cubic-bezier(0.22, 1, 0.36, 1), top 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease, transform 0.15s ease";
/** Fast transition used during drag-to-select so the cursor tracks smoothly. */
const CURSOR_TRANSITION_DRAG =
  "left 0.06s linear, top 0.06s linear, opacity 0.25s ease, transform 0.15s ease";

function setCursorTransition(t: string) {
  const cursor = document.getElementById("demo-cursor");
  if (cursor) cursor.style.transition = t;
}

const DEMO_QUERIES = [
  "Show me my blood work from last week",
  "Refill my metformin",
  "Pay my bill",
  "Find a cardiologist who takes Aetna",
  "I need an appointment with a GP in my primary clinic, next available",
  "Can I get an appointment with my doctor on Monday morning?",
  "Tell my doctor I need a follow-up appointment",
];

const RECENT_DOCTORS: DisambiguationOption[] = [
  {
    id: "dr-chen",
    label: "Dr. Sarah Chen, MD",
    subtitle: "Internal Medicine \u00b7 Last message Feb 16",
    avatar: "SC",
    avatarColor: "from-emerald-400 to-teal-500",
  },
  {
    id: "dr-torres",
    label: "Dr. Michael Torres, MD",
    subtitle: "Family Medicine \u00b7 Last message Feb 13",
    avatar: "MT",
    avatarColor: "from-violet-400 to-purple-500",
  },
];

interface TimeSlotOption {
  id: string;
  day: string;
  date: string;
  time: string;
  doctor: string;
  location: string;
}

const AVAILABLE_TIMES: TimeSlotOption[] = [
  {
    id: "slot-1",
    day: "Monday",
    date: "Feb 23",
    time: "8:30 AM",
    doctor: "Dr. Sarah Chen, MD",
    location: "Chatile Health Internal Medicine",
  },
  {
    id: "slot-2",
    day: "Monday",
    date: "Feb 23",
    time: "10:15 AM",
    doctor: "Dr. Sarah Chen, MD",
    location: "Chatile Health Internal Medicine",
  },
  {
    id: "slot-3",
    day: "Tuesday",
    date: "Feb 24",
    time: "9:00 AM",
    doctor: "Dr. Sarah Chen, MD",
    location: "Chatile Health Internal Medicine",
  },
];

export function ChatNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isProcessing,
    breadcrumb,
    inputValue,
    currentIntent,
    disambiguationOptions,
    pendingIntent,
    showTypingDemo,
    setInputValue,
    resolveIntent,
    setCurrentIntent,
    setBreadcrumb,
    setIsProcessing,
    setDisambiguationOptions,
    setPendingIntent,
    setPendingMessage,
    setShowTypingDemo,
    clearNav,
  } = useChatNav();

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedSteps, setParsedSteps] = useState<string[]>([]);
  const [showParsed, setShowParsed] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [demoButtonPressed, setDemoButtonPressed] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const demoTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Derive which disambiguation type to show from the pending intent
  const disambiguationType = pendingIntent?.action === "book_appointment" ? "timeslot" : "doctor";

  const handleSubmit = (query: string) => {
    if (!query.trim()) return;

    setShowSuggestions(false);
    setDisambiguationOptions(null);
    setShowTimeSlots(false);
    setIsProcessing(true);
    setShowParsed(false);
    setParsedSteps([]);

    const intent = resolveIntent(query);

    if (intent) {
      if (intent.needsDisambiguation) {
        const isTimeSlot = intent.action === "book_appointment";
        const clarifyMsg = isTimeSlot
          ? "Checking available times..."
          : "Multiple doctors found \u2014 which one?";

        const steps = [
          "Parsing intent...",
          `Action: ${intent.action.replace(/_/g, " ")}`,
          clarifyMsg,
        ];

        setParsedSteps([steps[0]]);
        setShowParsed(true);

        setTimeout(() => {
          setParsedSteps([steps[0], steps[1]]);
        }, 400);

        setTimeout(() => {
          setParsedSteps([steps[0], steps[1], steps[2]]);
        }, 700);

        setTimeout(() => {
          setShowParsed(false);
          setIsProcessing(false);
          setPendingIntent(intent);
          setPendingMessage(query);
          if (isTimeSlot) {
            setShowTimeSlots(true);
          } else {
            setDisambiguationOptions(RECENT_DOCTORS);
          }
        }, 1100);
      } else {
        // Standard single-step flow
        const steps = [
          "Parsing intent...",
          `Action: ${intent.action.replace(/_/g, " ")}`,
          `Navigating to ${intent.path}`,
        ];

        setParsedSteps([steps[0]]);
        setShowParsed(true);

        setTimeout(() => {
          setParsedSteps([steps[0], steps[1]]);
        }, 400);

        setTimeout(() => {
          setParsedSteps([steps[0], steps[1], steps[2]]);
        }, 700);

        setTimeout(() => {
          setShowParsed(false);
          setIsProcessing(false);
          setCurrentIntent(intent);
          setBreadcrumb(intent.breadcrumb);
          navigate(intent.path);
        }, 1100);
      }
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        setParsedSteps(["Could not resolve intent. Try a different query."]);
        setShowParsed(true);
        setTimeout(() => setShowParsed(false), 2000);
      }, 800);
    }
  };

  const handleDoctorSelect = (doctor: DisambiguationOption) => {
    setDisambiguationOptions(null);

    setIsProcessing(true);
    setShowParsed(true);
    setParsedSteps([
      `Selected: ${doctor.label}`,
      "Composing follow-up request...",
    ]);

    setTimeout(() => {
      setParsedSteps([
        `Selected: ${doctor.label}`,
        "Composing follow-up request...",
        "Navigating to /messages",
      ]);
    }, 350);

    setTimeout(() => {
      setShowParsed(false);
      setIsProcessing(false);

      const finalIntent = {
        action: "message_doctor_followup",
        breadcrumb: `Messages \u2192 ${doctor.label.split(",")[0]} \u2192 Follow-up Request`,
        path: "/messages",
        filters: {
          action: "compose_followup",
          doctorId: doctor.id,
          doctorName: doctor.label,
        },
      };

      setCurrentIntent(finalIntent);
      setBreadcrumb(finalIntent.breadcrumb);
      setPendingIntent(null);
      setPendingMessage(null);
      navigate("/messages");
    }, 800);
  };

  const handleTimeSlotSelect = (slot: TimeSlotOption) => {
    setShowTimeSlots(false);

    setIsProcessing(true);
    setShowParsed(true);
    setParsedSteps([
      `Selected: ${slot.day}, ${slot.date} at ${slot.time}`,
      "Booking appointment...",
    ]);

    setTimeout(() => {
      setParsedSteps([
        `Selected: ${slot.day}, ${slot.date} at ${slot.time}`,
        "Booking appointment...",
        "Navigating to /appointments",
      ]);
    }, 350);

    setTimeout(() => {
      setShowParsed(false);
      setIsProcessing(false);

      const finalIntent = {
        action: "book_appointment",
        breadcrumb: `Appointments \u2192 ${slot.day} ${slot.date} \u2192 ${slot.time}`,
        path: "/appointments",
        filters: {
          action: "book_confirmed",
          slotId: slot.id,
          slotDay: slot.day,
          slotDate: slot.date,
          slotTime: slot.time,
          slotDoctor: slot.doctor,
          slotLocation: slot.location,
        },
      };

      setCurrentIntent(finalIntent);
      setBreadcrumb(finalIntent.breadcrumb);
      setPendingIntent(null);
      setPendingMessage(null);
      navigate("/appointments");
    }, 800);
  };

  const handleSearchMoreTimes = () => {
    setShowTimeSlots(false);

    setIsProcessing(true);
    setShowParsed(true);
    setParsedSteps(["Navigating to /appointments"]);

    setTimeout(() => {
      setShowParsed(false);
      setIsProcessing(false);

      const finalIntent = {
        action: "schedule_appointment",
        breadcrumb: "Appointments \u2192 Schedule New",
        path: "/appointments",
        filters: { view: "schedule" },
      };

      setCurrentIntent(finalIntent);
      setBreadcrumb(finalIntent.breadcrumb);
      setPendingIntent(null);
      setPendingMessage(null);
      navigate("/appointments");
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(inputValue);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setDisambiguationOptions(null);
      setShowTimeSlots(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    clearNav();
    setShowSuggestions(false);
    setShowParsed(false);
    setShowTimeSlots(false);
    setParsedSteps([]);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  useEffect(() => {
    if (breadcrumb && currentIntent && location.pathname !== currentIntent.path) {
      clearNav();
    }
    if (location.pathname === "/" && breadcrumb) {
      clearNav();
    }
  }, [location.pathname]);

  const hasDropdown = disambiguationOptions || showTimeSlots;

  // Demo mode: auto-type and press submit
  useEffect(() => {
    if (!showTypingDemo) return;

    const CHAR_DELAY = 55;
    const PRE_FOCUS_DELAY = 400;
    const POST_TYPE_PAUSE = 400;
    const BUTTON_HOLD_MS = 500;
    const INTENT_ANIM_DURATION = 1100;
    const SCROLL_SETTLE_DELAY = 400;
    const BLUR_SETTLE = 600;
    const SCROLL_DOWN_DURATION = 800;
    const LINGER_AT_BOTTOM = 2000;
    const SCROLL_UP_DURATION = 600;
    const BETWEEN_QUERIES_PAUSE = 1200;

    // Clean up any previous demo timers
    demoTimersRef.current.forEach(clearTimeout);
    demoTimersRef.current = [];

    const addTimer = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      demoTimersRef.current.push(t);
      return t;
    };

    // Reset to clean state
    setDemoActive(true);
    clearNav();
    setShowSuggestions(false);
    setShowParsed(false);
    setShowTimeSlots(false);
    setParsedSteps([]);

    // Navigate to home first if needed
    if (location.pathname !== "/") {
      navigate("/");
    }

    // Helper: schedule a full demo query sequence starting at `startAt` ms.
    // Returns the total end time (ms from effect start).
    // opts.isFirst: whether this is the first query (navigates home)
    // opts.autoConfirmRefill: whether to auto-tap the refill confirm modal
    interface DemoQueryOpts {
      isFirst?: boolean;
      autoConfirmRefill?: boolean;
      autoSelectDoctor?: boolean;
      autoPayBill?: boolean;
    }

    const scheduleDemoQuery = (text: string, startAt: number, opts: DemoQueryOpts = {}): number => {
      const { isFirst = false, autoConfirmRefill = false, autoSelectDoctor = false, autoPayBill = false } = opts;

      // ─── CURSOR: Teleport to input area (invisible), then show ───
      addTimer(() => {
        const input = document.querySelector("[data-demo-input]") as HTMLElement | null;
        if (input) {
          const r = input.getBoundingClientRect();
          teleportCursor(r.left + 40, r.top + r.height / 2);
        }
        showCursor();
      }, startAt);

      // Step A: Focus the input (and clear previous breadcrumb if chaining)
      addTimer(() => {
        if (!isFirst) {
          setInputValue("");
          setBreadcrumb(null);
          setCurrentIntent(null);
        }
        setDemoActive(true);
        setIsFocused(true);
        setShowSuggestions(false);
        inputRef.current?.focus();
      }, startAt);

      // Step B: Type characters one by one
      const typeStart = startAt + 200;
      for (let i = 0; i < text.length; i++) {
        addTimer(() => {
          setInputValue(text.slice(0, i + 1));
        }, typeStart + i * CHAR_DELAY);
      }

      const typingDone = typeStart + text.length * CHAR_DELAY;

      // ─── CURSOR: Move to submit button before pressing ───
      addTimer(() => {
        moveCursorTo("[data-demo-submit]");
      }, typingDone);

      // Step C: Pause, then press button down
      addTimer(() => {
        cursorClickDown();
        setDemoButtonPressed(true);
      }, typingDone + POST_TYPE_PAUSE);

      // Step D: After hold duration, release and submit
      const submitAt = typingDone + POST_TYPE_PAUSE + BUTTON_HOLD_MS;
      addTimer(() => {
        cursorClickUp();
        setDemoButtonPressed(false);
        handleSubmit(text);
        if (!autoSelectDoctor && !autoPayBill) {
          setDemoActive(false);
        }
      }, submitAt);

      // Compute blurAt — differs depending on whether we auto-confirm the refill modal
      let blurAt: number;

      if (autoConfirmRefill) {
        // The modal auto-opens 600ms after mount (from medications-page useEffect).
        // The page mounts after the 1100ms intent animation completes.
        const MODAL_OPEN_DELAY = 600; // from medications-page.tsx setTimeout
        const MODAL_SETTLE = 400; // let modal animate in
        const MODAL_VIEW_PAUSE = 800; // let viewer read the modal
        const CONFIRM_HOLD_MS = 500; // pressed state duration
        const MODAL_CLOSE_SETTLE = 500; // modal exit animation

        const modalVisibleAt = submitAt + INTENT_ANIM_DURATION + MODAL_OPEN_DELAY + MODAL_SETTLE;

        // ─── CURSOR: Hide during intent animation, then move to confirm button ───
        addTimer(() => { hideCursor(); }, submitAt + 100);
        addTimer(() => {
          moveCursorTo("[data-demo-confirm-refill]");
          showCursor();
        }, modalVisibleAt + MODAL_VIEW_PAUSE - CURSOR_MOVE);

        // Step D2: After viewer sees modal, apply pressed state to Confirm Refill button
        const btnPressAt = modalVisibleAt + MODAL_VIEW_PAUSE;
        addTimer(() => {
          cursorClickDown();
          const btn = document.querySelector("[data-demo-confirm-refill]") as HTMLButtonElement | null;
          if (btn) {
            btn.style.transform = "scale(0.93)";
            btn.style.backgroundColor = "#1d4ed8"; // blue-700
            btn.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)";
          }
        }, btnPressAt);

        // Step D3: After hold, release and click the button
        const btnReleaseAt = btnPressAt + CONFIRM_HOLD_MS;
        addTimer(() => {
          cursorClickUp();
          const btn = document.querySelector("[data-demo-confirm-refill]") as HTMLButtonElement | null;
          if (btn) {
            btn.style.transform = "";
            btn.style.backgroundColor = "";
            btn.style.boxShadow = "";
            btn.click();
          }
        }, btnReleaseAt);

        // Confetti on refill success
        addTimer(() => {
          fireConfetti();
        }, btnReleaseAt + 200);

        // ─── CURSOR: Hide after refill success ───
        addTimer(() => { hideCursor(); }, btnReleaseAt + 300);

        blurAt = btnReleaseAt + MODAL_CLOSE_SETTLE;
      } else if (autoSelectDoctor) {
        // The disambiguation dropdown appears after the intent animation completes
        const DROPDOWN_SETTLE = 400;
        const DOCTOR_VIEW_PAUSE = 700;
        const DOCTOR_HOLD_MS = 500;
        const DOCTOR_SELECT_PROCESS = 800; // handleDoctorSelect internal timer
        const COMPOSE_FILL_SETTLE = 800;  // compose form pre-fill + render
        const SEND_HOLD_MS = 500;
        const SEND_PROCESS = 800;         // handleSendMessage internal timer
        const SUCCESS_VIEW_PAUSE = 1000;  // let viewer see "Message sent!"

        // ─── Text-edit constants ───
        const EDIT_CHAR_DELAY = 55;
        const EDIT_TARGET = "your earliest availability";
        const EDIT_REPLACEMENT = "what days work this week";
        const INITIAL_VIEW_PAUSE = 800;   // let viewer read pre-filled compose
        const SELECT_SETTLE = 300;        // brief pause after selection appears
        const SELECT_VIEW_PAUSE = 700;    // viewer sees the highlighted text
        const DELETE_PAUSE = 200;         // beat after deleting selected text
        const POST_EDIT_PAUSE = 600;      // admire the edited message

        const dropdownVisibleAt = submitAt + INTENT_ANIM_DURATION + DROPDOWN_SETTLE;
        const doctorPressAt = dropdownVisibleAt + DOCTOR_VIEW_PAUSE;

        // ─── CURSOR: Move to first doctor option ───
        addTimer(() => {
          moveCursorTo("[data-demo-doctor-option]");
        }, doctorPressAt - CURSOR_MOVE);

        // Apply pressed visual to first doctor option
        addTimer(() => {
          cursorClickDown();
          const btn = document.querySelector("[data-demo-doctor-option]") as HTMLElement | null;
          if (btn) {
            btn.style.transform = "scale(0.97)";
            btn.style.backgroundColor = "#eff6ff";
            btn.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.08)";
          }
        }, doctorPressAt);

        const doctorReleaseAt = doctorPressAt + DOCTOR_HOLD_MS;

        // Release and select doctor
        addTimer(() => {
          cursorClickUp();
          const btn = document.querySelector("[data-demo-doctor-option]") as HTMLElement | null;
          if (btn) {
            btn.style.transform = "";
            btn.style.backgroundColor = "";
            btn.style.boxShadow = "";
          }
          handleDoctorSelect(RECENT_DOCTORS[0]);
          setDemoActive(false);
        }, doctorReleaseAt);

        // ─── CURSOR: Hide during navigation ───
        addTimer(() => { hideCursor(); }, doctorReleaseAt + 100);

        // After navigation + compose pre-fill renders
        const composeVisibleAt = doctorReleaseAt + DOCTOR_SELECT_PROCESS + COMPOSE_FILL_SETTLE;

        // ─── TEXT EDIT SEQUENCE ───────────────────────────────────

        // 1. Move cursor to textarea
        const editMoveAt = composeVisibleAt + INITIAL_VIEW_PAUSE;
        addTimer(() => {
          showCursor();
          moveCursorTo("[data-demo-compose-body]");
        }, editMoveAt);

        // 2. Click into textarea, position caret at start of target phrase
        const editClickAt = editMoveAt + CURSOR_MOVE + 100;
        addTimer(() => {
          cursorClickDown();
          const ta = document.querySelector("[data-demo-compose-body]") as HTMLTextAreaElement | null;
          if (ta) {
            ta.focus();
            const idx = ta.value.indexOf(EDIT_TARGET);
            if (idx !== -1) {
              ta.selectionStart = idx;
              ta.selectionEnd = idx;
            }
          }
        }, editClickAt);
        addTimer(() => { cursorClickUp(); }, editClickAt + 150);

        // 3. Teleport cursor to pixel position of target-start, then drag-select
        const DRAG_PREP = 350;
        const DRAG_STEPS = 14;
        const DRAG_STEP_MS = 35;
        const DRAG_TOTAL = DRAG_STEPS * DRAG_STEP_MS; // ~490ms

        const dragPrepAt = editClickAt + 300 + DRAG_PREP;

        // Teleport cursor to the pixel position of the first character of the target
        addTimer(() => {
          const ta = document.querySelector("[data-demo-compose-body]") as HTMLTextAreaElement | null;
          if (!ta) return;
          const idx = ta.value.indexOf(EDIT_TARGET);
          if (idx === -1) return;
          const pos = getCaretCoords(ta, idx);
          teleportCursor(pos.x, pos.y + 8);
        }, dragPrepAt - 60);

        // Mousedown — begin the drag
        const dragStartAt = dragPrepAt;
        addTimer(() => {
          cursorClickDown();
          // Switch to fast transition so cursor tracks the drag smoothly
          setCursorTransition(CURSOR_TRANSITION_DRAG);
          const ta = document.querySelector("[data-demo-compose-body]") as HTMLTextAreaElement | null;
          if (ta) {
            ta.focus();
            const idx = ta.value.indexOf(EDIT_TARGET);
            if (idx !== -1) {
              ta.selectionStart = idx;
              ta.selectionEnd = idx;
            }
          }
        }, dragStartAt);

        // Progressively expand selection while gliding cursor rightward
        for (let step = 1; step <= DRAG_STEPS; step++) {
          addTimer(() => {
            const ta = document.querySelector("[data-demo-compose-body]") as HTMLTextAreaElement | null;
            if (!ta) return;
            const idx = ta.value.indexOf(EDIT_TARGET);
            if (idx === -1) return;
            const charsSelected = Math.round((step / DRAG_STEPS) * EDIT_TARGET.length);
            ta.selectionStart = idx;
            ta.selectionEnd = idx + charsSelected;
            ta.focus();
            // Move cursor to the trailing edge of the growing selection
            const endPos = getCaretCoords(ta, idx + charsSelected);
            moveCursorToXY(endPos.x, endPos.y + 8);
          }, dragStartAt + step * DRAG_STEP_MS);
        }

        // Mouseup — finish the drag, restore normal cursor transition
        const dragEndAt = dragStartAt + DRAG_TOTAL + 60;
        addTimer(() => {
          cursorClickUp();
          setCursorTransition(CURSOR_TRANSITION_NORMAL);
        }, dragEndAt);

        // 4. Pause so viewer sees the blue highlight
        const editDeleteAt = dragEndAt + SELECT_VIEW_PAUSE;

        // 5. Delete the selected text, track the insertion position
        let editInsertPos = 0;
        addTimer(() => {
          const ta = document.querySelector("[data-demo-compose-body]") as HTMLTextAreaElement | null;
          if (ta) {
            const idx = ta.value.indexOf(EDIT_TARGET);
            if (idx !== -1) {
              const before = ta.value.substring(0, idx);
              const after = ta.value.substring(idx + EDIT_TARGET.length);
              setTextareaNativeValue(ta, before + after);
              ta.selectionStart = idx;
              ta.selectionEnd = idx;
              editInsertPos = idx;
            }
          }
        }, editDeleteAt);

        // 6. Type the replacement text char by char at the correct position
        const editTypeStart = editDeleteAt + DELETE_PAUSE;
        for (let i = 0; i < EDIT_REPLACEMENT.length; i++) {
          addTimer(() => {
            const ta = document.querySelector("[data-demo-compose-body]") as HTMLTextAreaElement | null;
            if (ta) {
              const insertPos = editInsertPos + i;
              const before = ta.value.substring(0, insertPos);
              const after = ta.value.substring(insertPos);
              setTextareaNativeValue(ta, before + EDIT_REPLACEMENT[i] + after);
              ta.selectionStart = insertPos + 1;
              ta.selectionEnd = insertPos + 1;
            }
          }, editTypeStart + i * EDIT_CHAR_DELAY);
        }

        const editTypingDone = editTypeStart + EDIT_REPLACEMENT.length * EDIT_CHAR_DELAY;

        // ─── END TEXT EDIT ────────────────────────────────────────

        // 7. Move cursor to Send button
        const sendMoveAt = editTypingDone + POST_EDIT_PAUSE;
        addTimer(() => {
          moveCursorTo("[data-demo-send-message]");
        }, sendMoveAt);

        const sendPressAt = sendMoveAt + CURSOR_MOVE + 100;

        addTimer(() => {
          cursorClickDown();
          const btn = document.querySelector("[data-demo-send-message]") as HTMLElement | null;
          if (btn) {
            btn.style.transform = "scale(0.93)";
            btn.style.backgroundColor = "#1d4ed8";
            btn.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)";
          }
        }, sendPressAt);

        const sendReleaseAt = sendPressAt + SEND_HOLD_MS;

        addTimer(() => {
          cursorClickUp();
          const btn = document.querySelector("[data-demo-send-message]") as HTMLElement | null;
          if (btn) {
            btn.style.transform = "";
            btn.style.backgroundColor = "";
            btn.style.boxShadow = "";
            btn.click();
          }
        }, sendReleaseAt);

        // ─── CURSOR: Hide after send ───
        addTimer(() => { hideCursor(); }, sendReleaseAt + 200);

        // Confetti on message-sent success
        addTimer(() => {
          fireConfetti();
        }, sendReleaseAt + SEND_PROCESS + 200);

        blurAt = sendReleaseAt + SEND_PROCESS + SUCCESS_VIEW_PAUSE;
      } else if (autoPayBill) {
        // The review modal auto-opens 600ms after billing page mounts (from billing-page useEffect).
        // The page mounts after the 1100ms intent animation completes.
        const MODAL_OPEN_DELAY = 600;  // from billing-page.tsx useEffect
        const MODAL_SETTLE = 400;       // let modal animate in
        const MODAL_VIEW_PAUSE = 1200;  // let viewer read the review modal
        const CONFIRM_HOLD_MS = 500;    // pressed state duration on Confirm & Pay
        const PROCESSING_DURATION = 1800; // from billing-page.tsx processing timer
        const PROCESSING_SETTLE = 400;  // let success screen animate in
        const SUCCESS_VIEW_PAUSE = 2000; // let viewer admire the success receipt
        const DONE_HOLD_MS = 500;       // pressed state on Done button
        const DONE_SETTLE = 400;        // modal exit animation

        const modalVisibleAt = submitAt + INTENT_ANIM_DURATION + MODAL_OPEN_DELAY + MODAL_SETTLE;

        // ─── CURSOR: Hide during intent animation, then move to confirm pay ───
        addTimer(() => { hideCursor(); }, submitAt + 100);

        // Press "Confirm & Pay"
        const confirmPressAt = modalVisibleAt + MODAL_VIEW_PAUSE;

        addTimer(() => {
          moveCursorTo("[data-demo-confirm-payment]");
          showCursor();
        }, confirmPressAt - CURSOR_MOVE);

        addTimer(() => {
          cursorClickDown();
          const btn = document.querySelector("[data-demo-confirm-payment]") as HTMLButtonElement | null;
          if (btn) {
            btn.style.transform = "scale(0.93)";
            btn.style.backgroundColor = "#1d4ed8";
            btn.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)";
          }
        }, confirmPressAt);

        // Release and click "Confirm & Pay"
        const confirmReleaseAt = confirmPressAt + CONFIRM_HOLD_MS;
        addTimer(() => {
          cursorClickUp();
          const btn = document.querySelector("[data-demo-confirm-payment]") as HTMLButtonElement | null;
          if (btn) {
            btn.style.transform = "";
            btn.style.backgroundColor = "";
            btn.style.boxShadow = "";
            btn.click();
          }
        }, confirmReleaseAt);

        // ─── CURSOR: Hide during processing spinner ───
        addTimer(() => { hideCursor(); }, confirmReleaseAt + 200);

        // Wait for processing → success, then press "Done"
        const successVisibleAt = confirmReleaseAt + PROCESSING_DURATION + PROCESSING_SETTLE;

        // Confetti on payment success
        addTimer(() => {
          fireConfetti();
        }, successVisibleAt + 300);

        const donePressAt = successVisibleAt + SUCCESS_VIEW_PAUSE;

        // ─── CURSOR: Show and move to Done button ───
        addTimer(() => {
          moveCursorTo("[data-demo-done-payment]");
          showCursor();
        }, donePressAt - CURSOR_MOVE);

        addTimer(() => {
          cursorClickDown();
          const btn = document.querySelector("[data-demo-done-payment]") as HTMLButtonElement | null;
          if (btn) {
            btn.style.transform = "scale(0.93)";
            btn.style.backgroundColor = "#0f172a";
            btn.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.3)";
          }
        }, donePressAt);

        const doneReleaseAt = donePressAt + DONE_HOLD_MS;
        addTimer(() => {
          cursorClickUp();
          const btn = document.querySelector("[data-demo-done-payment]") as HTMLButtonElement | null;
          if (btn) {
            btn.style.transform = "";
            btn.style.backgroundColor = "";
            btn.style.boxShadow = "";
            btn.click();
          }
          setDemoActive(false);
        }, doneReleaseAt);

        // ─── CURSOR: Hide after Done ───
        addTimer(() => { hideCursor(); }, doneReleaseAt + 200);

        blurAt = doneReleaseAt + DONE_SETTLE;
      } else {
        // ─── CURSOR: Hide after submit for simple navigation ───
        addTimer(() => { hideCursor(); }, submitAt + 200);

        blurAt = submitAt + INTENT_ANIM_DURATION + SCROLL_SETTLE_DELAY;
      }

      // Step E: Blur input to show breadcrumb
      addTimer(() => {
        inputRef.current?.blur();
        setIsFocused(false);
      }, blurAt);

      // Step F: After breadcrumb renders, scroll down to reveal results
      const scrollDownAt = blurAt + BLUR_SETTLE;
      addTimer(() => {
        const mainContent = document.querySelector("main");
        if (mainContent) {
          const mainBottom = mainContent.getBoundingClientRect().bottom;
          const viewportHeight = window.innerHeight;
          if (mainBottom > viewportHeight) {
            const scrollAmount = Math.min(mainBottom - viewportHeight + 120, 400);
            window.scrollTo({ top: scrollAmount, behavior: "smooth" });
          }
        }
      }, scrollDownAt);

      // Step G: After lingering on results, scroll back up
      const scrollUpAt = scrollDownAt + SCROLL_DOWN_DURATION + LINGER_AT_BOTTOM;
      addTimer(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, scrollUpAt);

      // Return the time when the scroll-to-top finishes
      return scrollUpAt + SCROLL_UP_DURATION;
    };

    // === Sequence 1: "Show me my blood work from last week" ===
    const seq1End = scheduleDemoQuery(
      "Show me my blood work from last week",
      PRE_FOCUS_DELAY,
      { isFirst: true }
    );

    // === Sequence 2: "Refill my metformin" (no return to home, auto-confirm refill modal) ===
    const seq2Start = seq1End + BETWEEN_QUERIES_PAUSE;
    const seq2End = scheduleDemoQuery(
      "Refill my metformin",
      seq2Start,
      { autoConfirmRefill: true }
    );

    // === Sequence 3: "Tell my doctor I need a follow-up appointment" (disambiguation + compose + send) ===
    const seq3Start = seq2End + BETWEEN_QUERIES_PAUSE;
    const seq3End = scheduleDemoQuery(
      "Tell my doctor I need a follow-up appointment",
      seq3Start,
      { autoSelectDoctor: true }
    );

    // === Sequence 4: "Pay my bill" (auto-confirm payment modal) ===
    const seq4Start = seq3End + BETWEEN_QUERIES_PAUSE;
    const seq4End = scheduleDemoQuery(
      "Pay my bill",
      seq4Start,
      { autoPayBill: true }
    );

    // === Sequence 5: Navigate Home via sidebar ===
    const NAV_HOME_PAUSE = 1200;   // pause after billing wraps up
    const NAV_HOME_HOLD_MS = 500;  // press duration on Home button
    const NAV_HOME_SETTLE = 600;   // let Home page render

    const homeStartAt = seq4End + NAV_HOME_PAUSE;

    // Clear billing breadcrumb so the bar resets
    addTimer(() => {
      setInputValue("");
      setBreadcrumb(null);
      setCurrentIntent(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, homeStartAt);

    // Show cursor and move to Home nav button
    addTimer(() => {
      showCursor();
      moveCursorTo('[data-demo-nav="home"]');
    }, homeStartAt + 400);

    const homePressAt = homeStartAt + 400 + CURSOR_MOVE + 100;

    // Press the Home button
    addTimer(() => {
      cursorClickDown();
      const btn = document.querySelector('[data-demo-nav="home"]') as HTMLElement | null;
      if (btn) {
        btn.style.transform = "scale(0.95)";
        btn.style.backgroundColor = "#eff6ff";
        btn.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.08)";
      }
    }, homePressAt);

    // Release and click Home
    const homeReleaseAt = homePressAt + NAV_HOME_HOLD_MS;
    addTimer(() => {
      cursorClickUp();
      const btn = document.querySelector('[data-demo-nav="home"]') as HTMLElement | null;
      if (btn) {
        btn.style.transform = "";
        btn.style.backgroundColor = "";
        btn.style.boxShadow = "";
        btn.click();
      }
    }, homeReleaseAt);

    // Hide cursor after navigation
    addTimer(() => { hideCursor(); }, homeReleaseAt + 300);

    const seq5End = homeReleaseAt + NAV_HOME_SETTLE;

    // Final cleanup after everything completes
    addTimer(() => {
      hideCursor();
      setShowTypingDemo(false);
    }, seq5End);

    return () => {
      demoTimersRef.current.forEach(clearTimeout);
      demoTimersRef.current = [];
      hideCursor();
    };
  }, [showTypingDemo]);

  return (
    <div className="relative w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Label */}
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs text-slate-400 tracking-wide" style={{ fontWeight: 500 }}>
          ChatNav — type a request in plain English
        </span>
      </div>

      {/* Main chat bar */}
      <div
        className={`relative flex items-center gap-3 rounded-2xl transition-all duration-300 ${
          isFocused || hasDropdown
            ? "bg-white shadow-xl shadow-blue-100/80 ring-2 ring-blue-400/40"
            : "bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/50"
        }`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center pl-5">
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-blue-500" />
            </motion.div>
          ) : (
            <Search className="w-6 h-6 text-slate-400" />
          )}
        </div>

        {breadcrumb && !isFocused ? (
          <button
            onClick={() => {
              setIsFocused(true);
              inputRef.current?.focus();
            }}
            className="flex-1 flex items-center gap-1.5 py-4.5 text-left cursor-text min-w-0"
          >
            <div className="flex items-center gap-1.5 text-[15px] text-blue-600 truncate">
              {breadcrumb.split(" \u2192 ").map((part, i, arr) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className={i === arr.length - 1 ? "text-blue-700" : "text-blue-500"} style={{ fontWeight: i === arr.length - 1 ? 500 : 400 }}>
                    {part}
                  </span>
                  {i < arr.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </span>
              ))}
            </div>
          </button>
        ) : (
          <input
            ref={inputRef}
            data-demo-input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length === 0 && isFocused);
              if (hasDropdown) {
                setDisambiguationOptions(null);
                setShowTimeSlots(false);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              if (!inputValue && !hasDropdown) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                if (!demoActive) {
                  setIsFocused(false);
                  setShowSuggestions(false);
                }
              }, 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder='Try "Can I get an appointment with my doctor on Monday morning?"'
            className="flex-1 bg-transparent py-4.5 text-green-600 placeholder:text-slate-400 focus:outline-none text-[17px]"
          />
        )}

        <div className="flex items-center gap-1.5 pr-4">
          {(inputValue || breadcrumb || hasDropdown) && (
            <button
              onClick={handleClear}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
          {inputValue && !hasDropdown && (
            <button
              data-demo-submit
              onClick={() => handleSubmit(inputValue)}
              className={`p-2.5 rounded-xl transition-all duration-150 ${
                demoButtonPressed
                  ? "bg-blue-700 scale-90 shadow-inner"
                  : "bg-blue-500 hover:bg-blue-600 scale-100"
              }`}
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          )}
          {!inputValue && !breadcrumb && !hasDropdown && (
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <Mic className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Parsing animation overlay */}
      <AnimatePresence>
        {showParsed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden z-50"
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-blue-600 tracking-wide uppercase">
                  Intent Resolution
                </span>
              </div>
              <div className="space-y-1.5">
                {parsedSteps.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        i === parsedSteps.length - 1
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {i < parsedSteps.length - 1 ? "\u2713" : "\u2192"}
                    </span>
                    <span className="text-slate-600">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time slot picker dropdown */}
      <AnimatePresence>
        {showTimeSlots && !showParsed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl shadow-blue-100/60 border border-blue-100 overflow-hidden z-50"
          >
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-blue-600 tracking-wide uppercase" style={{ fontWeight: 600 }}>
                  Next available times
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dr. Sarah Chen, MD &middot; Internal Medicine
              </p>
            </div>
            <div className="px-2 pb-1">
              {AVAILABLE_TIMES.map((slot, i) => (
                <motion.button
                  key={slot.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.08 }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleTimeSlotSelect(slot);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="w-11 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex flex-col items-center justify-center shrink-0 transition-colors">
                    <span className="text-blue-500 text-[9px] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                      {slot.day.slice(0, 3)}
                    </span>
                    <span className="text-blue-700 text-sm" style={{ fontWeight: 700, lineHeight: 1.1 }}>
                      {slot.date.split(" ")[1]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                      {slot.day}, {slot.date} at {slot.time}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.location}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>
            {/* Search for more times */}
            <div className="border-t border-slate-100 px-2 py-2">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.3 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSearchMoreTimes();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all text-left group"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors" style={{ fontWeight: 500 }}>
                  Search for more times
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor disambiguation dropdown */}
      <AnimatePresence>
        {disambiguationOptions && !showParsed && !showTimeSlots && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl shadow-blue-100/60 border border-blue-100 overflow-hidden z-50"
          >
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-blue-600 tracking-wide uppercase" style={{ fontWeight: 600 }}>
                  Which doctor?
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                You have recent conversations with 2 doctors
              </p>
            </div>
            <div className="px-2 pb-2">
              {disambiguationOptions.map((doctor, i) => (
                <motion.button
                  key={doctor.id}
                  data-demo-doctor-option={doctor.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.08 }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleDoctorSelect(doctor);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 transition-all text-left group"
                >
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${doctor.avatarColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <span className="text-white text-[11px]" style={{ fontWeight: 600 }}>
                      {doctor.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                      {doctor.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {doctor.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && !breadcrumb && !hasDropdown && !demoActive && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden z-50"
          >
            <div className="px-4 pt-3 pb-2">
              <span className="text-xs text-slate-400 tracking-wide uppercase">
                Try saying...
              </span>
            </div>
            {DEMO_QUERIES.map((query, i) => (
              <button
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setInputValue(query);
                  setShowSuggestions(false);
                  handleSubmit(query);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[15px] text-slate-700">{query}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}