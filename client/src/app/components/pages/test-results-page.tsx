import { useState, useEffect } from "react";
import {
  FlaskConical,
  Calendar,
  User,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChatNav } from "../chat-nav-context";

interface TestValue {
  name: string;
  value: string;
  unit: string;
  refRange: string;
  status: "normal" | "high" | "low";
}

interface TestResult {
  id: string;
  name: string;
  date: string;
  dateObj: Date;
  physician: string;
  category: "lab" | "imaging";
  status: "normal" | "attention";
  summary: string;
  values?: TestValue[];
}

const TEST_RESULTS: TestResult[] = [
  {
    id: "cbc-feb12",
    name: "Complete Blood Count (CBC)",
    date: "February 12, 2026",
    dateObj: new Date(2026, 1, 12),
    physician: "Dr. Sarah Chen, MD",
    category: "lab",
    status: "normal",
    summary: "All values within normal range",
    values: [
      { name: "White Blood Cells (WBC)", value: "6.2", unit: "x10\u00B3/\u00B5L", refRange: "4.5 - 11.0", status: "normal" },
      { name: "Red Blood Cells (RBC)", value: "4.8", unit: "x10\u2076/\u00B5L", refRange: "4.5 - 5.5", status: "normal" },
      { name: "Hemoglobin (Hgb)", value: "14.2", unit: "g/dL", refRange: "13.5 - 17.5", status: "normal" },
      { name: "Hematocrit (Hct)", value: "42.0", unit: "%", refRange: "38.0 - 50.0", status: "normal" },
      { name: "Platelets", value: "245", unit: "x10\u00B3/\u00B5L", refRange: "150 - 400", status: "normal" },
      { name: "Mean Corpuscular Volume (MCV)", value: "87.5", unit: "fL", refRange: "80.0 - 100.0", status: "normal" },
    ],
  },
  {
    id: "bmp-feb12",
    name: "Basic Metabolic Panel (BMP)",
    date: "February 12, 2026",
    dateObj: new Date(2026, 1, 12),
    physician: "Dr. Sarah Chen, MD",
    category: "lab",
    status: "attention",
    summary: "Glucose slightly elevated — discuss at next visit",
    values: [
      { name: "Glucose", value: "108", unit: "mg/dL", refRange: "70 - 100", status: "high" },
      { name: "Blood Urea Nitrogen (BUN)", value: "15", unit: "mg/dL", refRange: "7 - 20", status: "normal" },
      { name: "Creatinine", value: "1.0", unit: "mg/dL", refRange: "0.7 - 1.3", status: "normal" },
      { name: "Sodium", value: "140", unit: "mEq/L", refRange: "136 - 145", status: "normal" },
      { name: "Potassium", value: "4.2", unit: "mEq/L", refRange: "3.5 - 5.0", status: "normal" },
      { name: "CO2 (Bicarbonate)", value: "24", unit: "mEq/L", refRange: "23 - 29", status: "normal" },
      { name: "Calcium", value: "9.5", unit: "mg/dL", refRange: "8.5 - 10.5", status: "normal" },
    ],
  },
  {
    id: "lipid-jan15",
    name: "Lipid Panel",
    date: "January 15, 2026",
    dateObj: new Date(2026, 0, 15),
    physician: "Dr. Michael Torres, MD",
    category: "lab",
    status: "normal",
    summary: "Cholesterol levels within target range",
    values: [
      { name: "Total Cholesterol", value: "185", unit: "mg/dL", refRange: "< 200", status: "normal" },
      { name: "LDL Cholesterol", value: "110", unit: "mg/dL", refRange: "< 130", status: "normal" },
      { name: "HDL Cholesterol", value: "52", unit: "mg/dL", refRange: "> 40", status: "normal" },
      { name: "Triglycerides", value: "115", unit: "mg/dL", refRange: "< 150", status: "normal" },
    ],
  },
  {
    id: "xray-dec10",
    name: "Chest X-Ray (PA & Lateral)",
    date: "December 10, 2025",
    dateObj: new Date(2025, 11, 10),
    physician: "Dr. James Wilson, MD",
    category: "imaging",
    status: "normal",
    summary: "No acute cardiopulmonary findings. Heart size normal. Lungs clear.",
  },
];

type CategoryFilter = "all" | "lab" | "imaging";
type DateFilter = "all" | "last7days" | "last30days" | "last90days";

export function TestResultsPage() {
  const { currentIntent } = useChatNav();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);

  // Apply ChatNav filters
  useEffect(() => {
    if (currentIntent?.action === "view_test_results" && currentIntent.filters) {
      if (currentIntent.filters.category === "lab") {
        setCategoryFilter("lab");
      }
      if (currentIntent.filters.dateRange === "last7days") {
        setDateFilter("last7days");
      }
      // Highlight the matching results
      const filtered = getFilteredResults("lab", "last7days");
      setHighlightIds(filtered.map((r) => r.id));
      // Auto-expand the first result
      if (filtered.length > 0) {
        setExpandedId(filtered[0].id);
      }
      // Clear highlights after animation
      setTimeout(() => setHighlightIds([]), 3000);
    }
  }, [currentIntent]);

  function getFilteredResults(cat: CategoryFilter, date: DateFilter) {
    let results = TEST_RESULTS;

    if (cat !== "all") {
      results = results.filter((r) => r.category === cat);
    }

    if (date !== "all") {
      const now = new Date(2026, 1, 18); // Today's date
      let cutoff: Date;
      switch (date) {
        case "last7days":
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "last30days":
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last90days":
          cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      results = results.filter((r) => r.dateObj >= cutoff);
    }

    return results;
  }

  const filteredResults = getFilteredResults(categoryFilter, dateFilter);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-slate-800" style={{ fontSize: '24px', fontWeight: 600 }}>
              Test Results
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 ml-12">
          View your laboratory and imaging results
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-1.5 text-slate-500">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm" style={{ fontWeight: 500 }}>Filters:</span>
        </div>

        <div className="flex gap-2">
          {(
            [
              { value: "all", label: "All Types" },
              { value: "lab", label: "Lab Work" },
              { value: "imaging", label: "Imaging" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                categoryFilter === opt.value
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
              style={{ fontWeight: categoryFilter === opt.value ? 500 : 400 }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200 hidden sm:block" />

        <div className="flex gap-2">
          {(
            [
              { value: "all", label: "All Dates" },
              { value: "last7days", label: "Last 7 days" },
              { value: "last30days", label: "Last 30 days" },
              { value: "last90days", label: "Last 90 days" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                dateFilter === opt.value
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
              style={{ fontWeight: dateFilter === opt.value ? 500 : 400 }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Showing {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
      </div>

      {/* Results list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredResults.map((result, index) => {
            const isExpanded = expandedId === result.id;
            const isHighlighted = highlightIds.includes(result.id);
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-500 ${
                  isHighlighted
                    ? "border-blue-300 shadow-lg shadow-blue-100/60 ring-2 ring-blue-200/50"
                    : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                }`}
              >
                {/* Result header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : result.id)}
                  className="w-full p-4 flex items-start gap-4 text-left"
                >
                  {/* Status icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      result.category === "imaging"
                        ? "bg-slate-100"
                        : result.status === "attention"
                        ? "bg-amber-50"
                        : "bg-green-50"
                    }`}
                  >
                    {result.status === "attention" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          result.category === "imaging" ? "text-slate-400" : "text-green-500"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>
                          {result.name}
                        </h3>
                        <p className="text-slate-500 text-sm mt-0.5">{result.summary}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      </motion.div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {result.date}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        {result.physician}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                          result.category === "lab"
                            ? "bg-violet-50 text-violet-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        style={{ fontWeight: 500 }}
                      >
                        {result.category === "lab" ? "Lab Work" : "Imaging"}
                      </span>
                      {result.status === "attention" && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-600"
                          style={{ fontWeight: 500 }}
                        >
                          Needs attention
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded values */}
                <AnimatePresence>
                  {isExpanded && result.values && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="border-t border-slate-100 pt-4">
                          {/* Table header */}
                          <div className="grid grid-cols-12 gap-2 px-3 pb-2 text-[11px] text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                            <div className="col-span-5">Test</div>
                            <div className="col-span-2 text-right">Value</div>
                            <div className="col-span-1 text-center">Unit</div>
                            <div className="col-span-3 text-center">Ref. Range</div>
                            <div className="col-span-1 text-center">Status</div>
                          </div>

                          {/* Values */}
                          <div className="space-y-0">
                            {result.values.map((val, vi) => (
                              <motion.div
                                key={val.name}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: vi * 0.03 }}
                                className={`grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg text-sm ${
                                  val.status !== "normal"
                                    ? "bg-amber-50/60"
                                    : vi % 2 === 0
                                    ? "bg-slate-50/50"
                                    : ""
                                }`}
                              >
                                <div className="col-span-5 text-slate-700" style={{ fontWeight: val.status !== "normal" ? 500 : 400 }}>
                                  {val.name}
                                </div>
                                <div
                                  className={`col-span-2 text-right ${
                                    val.status === "high"
                                      ? "text-amber-700"
                                      : val.status === "low"
                                      ? "text-blue-700"
                                      : "text-slate-700"
                                  }`}
                                  style={{ fontWeight: 500 }}
                                >
                                  {val.value}
                                </div>
                                <div className="col-span-1 text-center text-slate-400 text-xs">
                                  {val.unit}
                                </div>
                                <div className="col-span-3 text-center text-slate-400">
                                  {val.refRange}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  {val.status === "normal" ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded imaging report */}
                <AnimatePresence>
                  {isExpanded && !result.values && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Impression
                            </span>
                            <p className="text-sm text-slate-600 mt-1">
                              No acute cardiopulmonary findings. Heart size and mediastinal
                              contours are within normal limits. Lungs are clear bilaterally. No
                              pleural effusion or pneumothorax. Osseous structures are
                              unremarkable.
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                              Radiologist
                            </span>
                            <p className="text-sm text-slate-600 mt-1">
                              Dr. James Wilson, MD — Department of Radiology
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No results match your current filters
            </p>
            <button
              onClick={() => {
                setCategoryFilter("all");
                setDateFilter("all");
              }}
              className="text-sm text-blue-600 mt-2 hover:text-blue-700"
              style={{ fontWeight: 500 }}
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}