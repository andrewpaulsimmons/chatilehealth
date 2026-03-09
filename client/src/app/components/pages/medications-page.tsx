import { useState, useEffect, useMemo } from "react";
import {
  Pill,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChatNav } from "../chat-nav-context";

interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  lastFilled: string;
  refillsRemaining: number;
  nextRefillDate: string;
  instructions: string;
  purpose: string;
}

const MEDICATIONS: Medication[] = [
  {
    id: "metformin",
    name: "Metformin HCl",
    genericName: "Metformin Hydrochloride",
    dosage: "500 mg",
    frequency: "Twice daily",
    prescriber: "Dr. Sarah Chen, MD",
    lastFilled: "January 20, 2026",
    refillsRemaining: 3,
    nextRefillDate: "February 20, 2026",
    instructions: "Take with meals. Morning and evening doses.",
    purpose: "Type 2 Diabetes Management",
  },
  {
    id: "lisinopril",
    name: "Lisinopril",
    genericName: "Lisinopril",
    dosage: "10 mg",
    frequency: "Once daily",
    prescriber: "Dr. Sarah Chen, MD",
    lastFilled: "February 1, 2026",
    refillsRemaining: 5,
    nextRefillDate: "March 1, 2026",
    instructions: "Take in the morning. Monitor blood pressure regularly.",
    purpose: "Blood Pressure Control",
  },
  {
    id: "atorvastatin",
    name: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    dosage: "20 mg",
    frequency: "Once daily at bedtime",
    prescriber: "Dr. Michael Torres, MD",
    lastFilled: "January 25, 2026",
    refillsRemaining: 2,
    nextRefillDate: "February 25, 2026",
    instructions: "Take at bedtime for best effectiveness.",
    purpose: "Cholesterol Management",
  },
];

export function MedicationsPage() {
  const { currentIntent } = useChatNav();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refillSuccess, setRefillSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentIntent?.highlight) {
      const medId = currentIntent.highlight;
      setHighlightId(medId);
      setExpandedId(medId);
      setIsPulsing(true);

      // If the intent is a refill action, auto-open the confirm modal
      if (currentIntent.action === "refill_medication") {
        // Small delay so the page renders and the user sees the card before the modal appears
        const modalTimer = setTimeout(() => {
          setShowRefillModal(medId);
        }, 600);

        const pulseTimer = setTimeout(() => {
          setIsPulsing(false);
        }, 5000);

        return () => {
          clearTimeout(modalTimer);
          clearTimeout(pulseTimer);
        };
      }

      // Stop pulsing after 5 seconds
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentIntent]);

  // Sort medications so highlighted one is on top
  const sortedMedications = useMemo(() => {
    if (!highlightId) return MEDICATIONS;
    const highlighted = MEDICATIONS.filter((m) => m.id === highlightId);
    const rest = MEDICATIONS.filter((m) => m.id !== highlightId);
    return [...highlighted, ...rest];
  }, [highlightId]);

  const handleRefill = (id: string) => {
    setShowRefillModal(null);
    setRefillSuccess(id);
  };

  return (
    <div className="space-y-5">
      {/* Pulsing keyframes */}
      <style>{`
        @keyframes pulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
            border-color: rgba(59, 130, 246, 0.8);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
            border-color: rgba(59, 130, 246, 0.3);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
            border-color: rgba(59, 130, 246, 0.8);
          }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Pill className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-slate-800" style={{ fontSize: '24px', fontWeight: 600 }}>
              Medications
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 ml-12">
          Your current prescriptions and refill status
        </p>
      </motion.div>

      {/* Medication cards */}
      <div className="space-y-3">
        {sortedMedications.map((med, index) => {
          const isHighlighted = highlightId === med.id;
          const isExpanded = expandedId === med.id;
          const isRefillSuccess = refillSuccess === med.id;

          return (
            <motion.div
              key={med.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                className={`bg-white rounded-2xl overflow-hidden transition-all ${
                  isHighlighted
                    ? "border-2 border-blue-500 shadow-lg"
                    : "border border-slate-100 shadow-sm hover:shadow-md"
                }`}
                style={
                  isHighlighted && isPulsing
                    ? {
                        animation: "pulseRing 1.5s ease-in-out infinite",
                        borderWidth: "2px",
                        borderStyle: "solid",
                      }
                    : isHighlighted
                    ? {
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderColor: "rgba(59, 130, 246, 0.5)",
                      }
                    : undefined
                }
              >
                {/* ChatNav badge for highlighted card */}
                {isHighlighted && (
                  <div className="bg-blue-50 px-4 py-2 flex items-center gap-2 border-b border-blue-100">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-blue-600" style={{ fontWeight: 500 }}>
                      Navigated here by ChatNav — Ready to refill
                    </span>
                  </div>
                )}

                {/* Card header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-slate-800" style={{ fontSize: '15px', fontWeight: 500 }}>
                          {med.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{med.purpose}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {med.frequency}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <RefreshCw className="w-3.5 h-3.5" />
                          {med.refillsRemaining} refills remaining
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isRefillSuccess ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm"
                          style={{ fontWeight: 500 }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Refill requested
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setShowRefillModal(med.id)}
                          className={`px-4 py-2 text-white text-sm rounded-xl transition-colors shadow-sm ${
                            isHighlighted
                              ? "bg-blue-600 hover:bg-blue-700 shadow-blue-300"
                              : "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          Request Refill
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : med.id)}
                        className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
                      >
                        Details
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </motion.div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Prescribed by
                            </span>
                            <p className="text-sm text-slate-700 mt-1">{med.prescriber}</p>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Last Filled
                            </span>
                            <p className="text-sm text-slate-700 mt-1">{med.lastFilled}</p>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Next Refill Date
                            </span>
                            <p className="text-sm text-slate-700 mt-1">{med.nextRefillDate}</p>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Instructions
                            </span>
                            <p className="text-sm text-slate-700 mt-1">{med.instructions}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Refill confirmation modal */}
      <AnimatePresence>
        {showRefillModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRefillModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <h3 className="text-slate-800" style={{ fontSize: '18px', fontWeight: 600 }}>
                Confirm Refill Request
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Request a refill for{" "}
                <span style={{ fontWeight: 500 }}>
                  {MEDICATIONS.find((m) => m.id === showRefillModal)?.name}
                </span>{" "}
                {MEDICATIONS.find((m) => m.id === showRefillModal)?.dosage}?
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Your pharmacy will be notified and the prescription will be ready for pickup
                within 24-48 hours.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowRefillModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRefill(showRefillModal)}
                  data-demo-confirm-refill
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-all"
                  style={{ fontWeight: 500 }}
                >
                  Confirm Refill
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}