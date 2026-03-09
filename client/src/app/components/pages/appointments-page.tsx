import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useChatNav } from "../chat-nav-context";

interface Appointment {
  id: string;
  title: string;
  doctor: string;
  date: string;
  time: string;
  location: string;
  type: "in-person" | "video";
  status: "upcoming" | "past";
  isNew?: boolean;
}

const BASE_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    title: "Follow-up: Diabetes Management",
    doctor: "Dr. Sarah Chen, MD",
    date: "February 24, 2026",
    time: "10:30 AM",
    location: "Chatile Health Internal Medicine, 300 Oak St",
    type: "in-person",
    status: "upcoming",
  },
  {
    id: "a2",
    title: "Annual Physical Exam",
    doctor: "Dr. Michael Torres, MD",
    date: "March 15, 2026",
    time: "9:00 AM",
    location: "Chatile Family Health, 150 Main St",
    type: "in-person",
    status: "upcoming",
  },
  {
    id: "a3",
    title: "Telehealth: Medication Review",
    doctor: "Dr. Sarah Chen, MD",
    date: "March 28, 2026",
    time: "2:00 PM",
    location: "Video Visit",
    type: "video",
    status: "upcoming",
  },
  {
    id: "a4",
    title: "Lab Work: Quarterly Blood Panel",
    doctor: "Dr. Sarah Chen, MD",
    date: "February 12, 2026",
    time: "8:00 AM",
    location: "Chatile Health Lab, 100 Health Blvd",
    type: "in-person",
    status: "past",
  },
  {
    id: "a5",
    title: "Lipid Panel Follow-up",
    doctor: "Dr. Michael Torres, MD",
    date: "January 15, 2026",
    time: "11:00 AM",
    location: "Chatile Family Health, 150 Main St",
    type: "in-person",
    status: "past",
  },
];

export function AppointmentsPage() {
  const { currentIntent } = useChatNav();

  const isBookConfirmed = currentIntent?.filters?.action === "book_confirmed";

  // Build appointments list — if we just booked, inject the new one at the top
  let appointments = [...BASE_APPOINTMENTS];
  if (isBookConfirmed && currentIntent?.filters) {
    const f = currentIntent.filters;
    const newApt: Appointment = {
      id: "a-new",
      title: "Office Visit",
      doctor: f.slotDoctor || "Dr. Sarah Chen, MD",
      date: `${f.slotDate ? f.slotDate.replace("Feb", "February").replace("Mar", "March") : "February 23"}, 2026`,
      time: f.slotTime || "8:30 AM",
      location: f.slotLocation ? `${f.slotLocation}, 300 Oak St` : "Chatile Health Internal Medicine, 300 Oak St",
      type: "in-person",
      status: "upcoming",
      isNew: true,
    };
    appointments = [newApt, ...BASE_APPOINTMENTS];
  }

  const upcoming = appointments.filter((a) => a.status === "upcoming");
  const past = appointments.filter((a) => a.status === "past");

  return (
    <div className="space-y-6">
      {/* Booking confirmation banner */}
      {isBookConfirmed && currentIntent?.filters && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-emerald-800 text-sm" style={{ fontWeight: 600 }}>
                  Appointment Booked!
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] text-emerald-600" style={{ fontWeight: 500 }}>
                    via ChatNav
                  </span>
                </span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">
                {currentIntent.filters.slotDay}, {currentIntent.filters.slotDate} at {currentIntent.filters.slotTime} with {currentIntent.filters.slotDoctor}
              </p>
              <p className="text-xs text-emerald-500 mt-0.5">
                {currentIntent.filters.slotLocation} &middot; Confirmation sent to your email
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-slate-800" style={{ fontSize: '24px', fontWeight: 600 }}>
              Appointments
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 ml-12">
          Manage your upcoming and past appointments
        </p>
      </motion.div>

      {/* Schedule button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <button
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200"
          style={{ fontWeight: 500 }}
        >
          + Schedule New Appointment
        </button>
      </motion.div>

      {/* Upcoming */}
      <div>
        <h2 className="text-slate-700 mb-3" style={{ fontSize: '15px', fontWeight: 500 }}>
          Upcoming ({upcoming.length})
        </h2>
        <div className="space-y-3">
          {upcoming.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all ${
                apt.isNew
                  ? "border-emerald-200 ring-1 ring-emerald-100"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                  apt.isNew ? "bg-emerald-50" : "bg-blue-50"
                }`}>
                  <span className={`text-[10px] uppercase tracking-wide ${
                    apt.isNew ? "text-emerald-600" : "text-blue-600"
                  }`} style={{ fontWeight: 600 }}>
                    {apt.date.split(" ")[0].slice(0, 3)}
                  </span>
                  <span className={`text-lg ${
                    apt.isNew ? "text-emerald-700" : "text-blue-700"
                  }`} style={{ fontWeight: 700, lineHeight: 1 }}>
                    {apt.date.split(" ")[1].replace(",", "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>
                      {apt.title}
                    </h3>
                    {apt.type === "video" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px]" style={{ fontWeight: 500 }}>
                        <Video className="w-3 h-3" />
                        Video
                      </span>
                    )}
                    {apt.isNew && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px]" style={{ fontWeight: 500 }}>
                        <CheckCircle2 className="w-3 h-3" />
                        Just booked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{apt.doctor}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.time}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {apt.location}
                    </span>
                  </div>
                </div>
                <button className="shrink-0 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Past */}
      <div>
        <h2 className="text-slate-600 mb-3" style={{ fontSize: '15px', fontWeight: 500 }}>
          Past
        </h2>
        <div className="space-y-3">
          {past.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (upcoming.length + index) * 0.05 }}
              className="bg-white/60 rounded-2xl border border-slate-100 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-14 rounded-xl bg-slate-50 flex flex-col items-center justify-center shrink-0">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                    {apt.date.split(" ")[0].slice(0, 3)}
                  </span>
                  <span className="text-slate-500 text-lg" style={{ fontWeight: 700, lineHeight: 1 }}>
                    {apt.date.split(" ")[1].replace(",", "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-600 text-sm" style={{ fontWeight: 500 }}>
                    {apt.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">{apt.doctor}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    {apt.time} &middot; {apt.location}
                  </span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  Completed
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}