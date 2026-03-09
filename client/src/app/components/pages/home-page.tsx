import { useNavigate } from "react-router";
import {
  Calendar,
  MessageSquare,
  FlaskConical,
  Pill,
  CreditCard,
  UserSearch,
  Video,
  ClipboardList,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";

const QUICK_ACTIONS = [
  { label: "Appointments", icon: Calendar, path: "/appointments", color: "bg-blue-50 text-blue-600" },
  { label: "Messages", icon: MessageSquare, path: "/messages", color: "bg-emerald-50 text-emerald-600" },
  { label: "Test Results", icon: FlaskConical, path: "/test-results", color: "bg-violet-50 text-violet-600" },
  { label: "Medications", icon: Pill, path: "/medications", color: "bg-amber-50 text-amber-600" },
  { label: "Billing", icon: CreditCard, path: "/billing", color: "bg-rose-50 text-rose-600" },
  { label: "Find a Doctor", icon: UserSearch, path: "/find-doctor", color: "bg-cyan-50 text-cyan-600" },
  { label: "Video Visit", icon: Video, path: "/appointments", color: "bg-indigo-50 text-indigo-600" },
  { label: "Visit Summary", icon: ClipboardList, path: "/test-results", color: "bg-teal-50 text-teal-600" },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Hint about ChatNav */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-5 text-white"
      >
        <p style={{ fontWeight: 600, fontSize: '15px' }}>
          Try ChatNav
        </p>
        <p className="text-blue-100 mt-1 text-sm">
          Instead of clicking through menus, try typing a request in the search bar above. For
          example: &ldquo;Tell my doctor I need a follow-up appointment&rdquo;
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Show me my blood work",
            "Refill my metformin",
            "Get an appointment on Monday",
          ].map((q) => (
            <span
              key={q}
              className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs border border-white/20"
            >
              {q}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
      >
        <h1 className="text-slate-800" style={{ fontSize: '28px', fontWeight: 600 }}>
          Welcome, Andrew
        </h1>
        <p className="text-slate-500 mt-1" style={{ fontSize: '15px' }}>
          Here&apos;s an overview of your health portal
        </p>
      </motion.div>

      {/* Upcoming appointment */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-50">
          <h2 className="text-slate-700" style={{ fontSize: '15px', fontWeight: 500 }}>
            Upcoming Appointment
          </h2>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
              <span className="text-blue-600 text-[10px] uppercase tracking-wide" style={{ fontWeight: 600 }}>Feb</span>
              <span className="text-blue-700 text-lg" style={{ fontWeight: 700, lineHeight: 1 }}>24</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>
                Follow-up: Diabetes Management
              </p>
              <p className="text-slate-500 text-sm mt-0.5">Dr. Sarah Chen, MD</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 text-sm">10:30 AM &middot; Chatile Health Internal Medicine</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/appointments")}
              className="shrink-0 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              style={{ fontWeight: 500 }}
            >
              Details
            </button>
          </div>
        </div>
      </motion.div>

      {/* Alert banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
        className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-amber-800 text-sm" style={{ fontWeight: 500 }}>
            New lab results available
          </p>
          <p className="text-amber-600 text-sm mt-0.5">
            Your Complete Blood Count and Basic Metabolic Panel results from Feb 12 are ready to
            view.
          </p>
          <button
            onClick={() => navigate("/test-results")}
            className="inline-flex items-center gap-1 text-sm text-amber-700 mt-2 hover:text-amber-800 transition-colors"
            style={{ fontWeight: 500 }}
          >
            View results <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Quick actions grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
      >
        <h2 className="text-slate-700 mb-3" style={{ fontSize: '15px', fontWeight: 500 }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-800" style={{ fontWeight: 500 }}>
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent messages */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-slate-700" style={{ fontSize: '15px', fontWeight: 500 }}>
            Recent Messages
          </h2>
          <button
            onClick={() => navigate("/messages")}
            className="text-sm text-blue-600 hover:text-blue-700"
            style={{ fontWeight: 500 }}
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          <button
            onClick={() => navigate("/messages")}
            className="w-full p-4 flex items-start gap-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-emerald-600 text-xs" style={{ fontWeight: 600 }}>SC</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                Dr. Sarah Chen
              </p>
              <p className="text-sm text-slate-500 truncate">
                Your recent lab results look good overall. I&apos;d like to discuss your glucose
                levels at our...
              </p>
            </div>
            <span className="text-xs text-slate-400 shrink-0 mt-0.5">2d ago</span>
          </button>
          <button
            onClick={() => navigate("/messages")}
            className="w-full p-4 flex items-start gap-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <span className="text-violet-600 text-xs" style={{ fontWeight: 600 }}>MT</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                Dr. Michael Torres
              </p>
              <p className="text-sm text-slate-500 truncate">
                Reminder: Please schedule your annual physical exam. It&apos;s been over a year
                since...
              </p>
            </div>
            <span className="text-xs text-slate-400 shrink-0 mt-0.5">5d ago</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}