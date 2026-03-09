import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  UserSearch,
  MapPin,
  Star,
  Phone,
  Calendar,
  Filter,
  ChevronDown,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChatNav } from "../chat-nav-context";

interface AppointmentSlot {
  id: string;
  day: string;
  date: string;
  time: string;
  label: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  specialtyKey: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  insurance: string[];
  nextAvailable: string;
  nextAvailableDate: Date;
  avatar: string;
  avatarGradient: string;
  phone: string;
  isGP?: boolean;
  isPrimaryClinic?: boolean;
  slots: AppointmentSlot[];
}

const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Amelia Rodriguez, MD, FACC",
    specialty: "Cardiology",
    specialtyKey: "cardiology",
    location: "Chatile Heart Center, 220 Park Ave",
    distance: "2.1 mi",
    rating: 4.9,
    reviewCount: 187,
    insurance: ["Aetna", "Blue Cross", "UnitedHealth", "Cigna"],
    nextAvailable: "Feb 21, 2026",
    nextAvailableDate: new Date(2026, 1, 21),
    avatar: "AR",
    avatarGradient: "from-rose-400 to-pink-500",
    phone: "(555) 234-5678",
    slots: [
      { id: "d1-s1", day: "Sat", date: "Feb 21", time: "9:00 AM", label: "Sat, Feb 21 at 9:00 AM" },
      { id: "d1-s2", day: "Mon", date: "Feb 23", time: "2:00 PM", label: "Mon, Feb 23 at 2:00 PM" },
      { id: "d1-s3", day: "Wed", date: "Feb 25", time: "11:00 AM", label: "Wed, Feb 25 at 11:00 AM" },
    ],
  },
  {
    id: "d2",
    name: "Dr. Robert Kim, MD, FACC",
    specialty: "Cardiology",
    specialtyKey: "cardiology",
    location: "Chatile Main Campus, 100 Health Blvd",
    distance: "4.3 mi",
    rating: 4.7,
    reviewCount: 142,
    insurance: ["Aetna", "Medicare", "Cigna"],
    nextAvailable: "Feb 24, 2026",
    nextAvailableDate: new Date(2026, 1, 24),
    avatar: "RK",
    avatarGradient: "from-blue-400 to-indigo-500",
    phone: "(555) 345-6789",
    slots: [
      { id: "d2-s1", day: "Tue", date: "Feb 24", time: "10:00 AM", label: "Tue, Feb 24 at 10:00 AM" },
      { id: "d2-s2", day: "Thu", date: "Feb 26", time: "3:30 PM", label: "Thu, Feb 26 at 3:30 PM" },
      { id: "d2-s3", day: "Fri", date: "Feb 27", time: "8:30 AM", label: "Fri, Feb 27 at 8:30 AM" },
    ],
  },
  {
    id: "d3",
    name: "Dr. Sarah Chen, MD",
    specialty: "Internal Medicine",
    specialtyKey: "internal-medicine",
    location: "Chatile Primary Care, 300 Oak St",
    distance: "1.5 mi",
    rating: 4.8,
    reviewCount: 213,
    insurance: ["Aetna", "Blue Cross", "UnitedHealth", "Medicare", "Cigna"],
    nextAvailable: "Feb 20, 2026",
    nextAvailableDate: new Date(2026, 1, 20),
    avatar: "SC",
    avatarGradient: "from-emerald-400 to-teal-500",
    phone: "(555) 123-4567",
    isGP: true,
    isPrimaryClinic: true,
    slots: [
      { id: "d3-s1", day: "Fri", date: "Feb 20", time: "11:00 AM", label: "Fri, Feb 20 at 11:00 AM" },
      { id: "d3-s2", day: "Mon", date: "Feb 23", time: "9:15 AM", label: "Mon, Feb 23 at 9:15 AM" },
      { id: "d3-s3", day: "Wed", date: "Feb 25", time: "2:30 PM", label: "Wed, Feb 25 at 2:30 PM" },
      { id: "d3-s4", day: "Fri", date: "Feb 27", time: "10:00 AM", label: "Fri, Feb 27 at 10:00 AM" },
    ],
  },
  {
    id: "d4",
    name: "Dr. Lisa Nguyen, MD",
    specialty: "Dermatology",
    specialtyKey: "dermatology",
    location: "Chatile Dermatology, 500 Elm St",
    distance: "3.2 mi",
    rating: 4.6,
    reviewCount: 98,
    insurance: ["Blue Cross", "UnitedHealth", "Cigna"],
    nextAvailable: "Mar 3, 2026",
    nextAvailableDate: new Date(2026, 2, 3),
    avatar: "LN",
    avatarGradient: "from-amber-400 to-orange-500",
    phone: "(555) 456-7890",
    slots: [
      { id: "d4-s1", day: "Tue", date: "Mar 3", time: "1:00 PM", label: "Tue, Mar 3 at 1:00 PM" },
      { id: "d4-s2", day: "Thu", date: "Mar 5", time: "10:30 AM", label: "Thu, Mar 5 at 10:30 AM" },
    ],
  },
  {
    id: "d5",
    name: "Dr. Michael Torres, MD",
    specialty: "Family Medicine",
    specialtyKey: "family-medicine",
    location: "Chatile Primary Care, 150 Main St",
    distance: "0.8 mi",
    rating: 4.9,
    reviewCount: 276,
    insurance: ["Aetna", "Blue Cross", "UnitedHealth", "Medicare", "Medicaid", "Cigna"],
    nextAvailable: "Feb 19, 2026",
    nextAvailableDate: new Date(2026, 1, 19),
    avatar: "MT",
    avatarGradient: "from-blue-500 to-blue-600",
    phone: "(555) 567-8901",
    isGP: true,
    isPrimaryClinic: true,
    slots: [
      { id: "d5-s1", day: "Thu", date: "Feb 19", time: "8:30 AM", label: "Thu, Feb 19 at 8:30 AM" },
      { id: "d5-s2", day: "Thu", date: "Feb 19", time: "2:00 PM", label: "Thu, Feb 19 at 2:00 PM" },
      { id: "d5-s3", day: "Fri", date: "Feb 20", time: "10:45 AM", label: "Fri, Feb 20 at 10:45 AM" },
      { id: "d5-s4", day: "Mon", date: "Feb 23", time: "8:30 AM", label: "Mon, Feb 23 at 8:30 AM" },
    ],
  },
  {
    id: "d6",
    name: "Dr. Priya Patel, MD",
    specialty: "Family Medicine",
    specialtyKey: "family-medicine",
    location: "Chatile Primary Care, 150 Main St",
    distance: "0.8 mi",
    rating: 4.7,
    reviewCount: 164,
    insurance: ["Aetna", "Blue Cross", "UnitedHealth", "Cigna"],
    nextAvailable: "Feb 21, 2026",
    nextAvailableDate: new Date(2026, 1, 21),
    avatar: "PP",
    avatarGradient: "from-violet-400 to-purple-500",
    phone: "(555) 678-9012",
    isGP: true,
    isPrimaryClinic: true,
    slots: [
      { id: "d6-s1", day: "Sat", date: "Feb 21", time: "9:00 AM", label: "Sat, Feb 21 at 9:00 AM" },
      { id: "d6-s2", day: "Mon", date: "Feb 23", time: "11:30 AM", label: "Mon, Feb 23 at 11:30 AM" },
      { id: "d6-s3", day: "Tue", date: "Feb 24", time: "3:00 PM", label: "Tue, Feb 24 at 3:00 PM" },
    ],
  },
  {
    id: "d7",
    name: "Dr. James Wright, MD",
    specialty: "Internal Medicine",
    specialtyKey: "internal-medicine",
    location: "Chatile Primary Care, 300 Oak St",
    distance: "1.5 mi",
    rating: 4.5,
    reviewCount: 131,
    insurance: ["Blue Cross", "Medicare", "Cigna"],
    nextAvailable: "Feb 24, 2026",
    nextAvailableDate: new Date(2026, 1, 24),
    avatar: "JW",
    avatarGradient: "from-slate-400 to-slate-500",
    phone: "(555) 789-0123",
    isGP: true,
    isPrimaryClinic: true,
    slots: [
      { id: "d7-s1", day: "Tue", date: "Feb 24", time: "8:00 AM", label: "Tue, Feb 24 at 8:00 AM" },
      { id: "d7-s2", day: "Wed", date: "Feb 25", time: "1:15 PM", label: "Wed, Feb 25 at 1:15 PM" },
      { id: "d7-s3", day: "Thu", date: "Feb 26", time: "9:30 AM", label: "Thu, Feb 26 at 9:30 AM" },
    ],
  },
];

const SPECIALTIES = [
  "All Specialties",
  "Cardiology",
  "Internal Medicine",
  "Family Medicine",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
];

const INSURANCE_OPTIONS = [
  "All Insurance",
  "Aetna",
  "Blue Cross",
  "UnitedHealth",
  "Cigna",
  "Medicare",
  "Medicaid",
];

export function FindDoctorPage() {
  const navigate = useNavigate();
  const { currentIntent, setCurrentIntent, setBreadcrumb } = useChatNav();
  const [specialty, setSpecialty] = useState("All Specialties");
  const [insurance, setInsurance] = useState("All Insurance");
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);
  const [gpMode, setGpMode] = useState(false);
  const [nextAvailableId, setNextAvailableId] = useState<string | null>(null);
  const [bookedSlotId, setBookedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (currentIntent?.action === "find_gp_primary") {
      setGpMode(true);
      setSpecialty("All Specialties");
      setInsurance("All Insurance");

      const gpDoctors = DOCTORS.filter((d) => d.isGP && d.isPrimaryClinic)
        .sort((a, b) => a.nextAvailableDate.getTime() - b.nextAvailableDate.getTime());

      if (gpDoctors.length > 0) {
        const soonestId = gpDoctors[0].id;
        setNextAvailableId(soonestId);
        setHighlightIds([soonestId]);
        setIsPulsing(true);

        const timer = setTimeout(() => {
          setIsPulsing(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    } else if (currentIntent?.action === "find_doctor" && currentIntent.filters) {
      setGpMode(false);
      setNextAvailableId(null);
      if (currentIntent.filters.specialty === "cardiology") {
        setSpecialty("Cardiology");
      }
      if (currentIntent.filters.insurance === "aetna") {
        setInsurance("Aetna");
      }
      setTimeout(() => {
        const matching = DOCTORS.filter(
          (d) =>
            d.specialtyKey === "cardiology" && d.insurance.includes("Aetna")
        ).map((d) => d.id);
        setHighlightIds(matching);
        setTimeout(() => setHighlightIds([]), 3000);
      }, 100);
    } else {
      setGpMode(false);
      setNextAvailableId(null);
    }
  }, [currentIntent]);

  const displayDoctors = useMemo(() => {
    if (gpMode) {
      return DOCTORS.filter((d) => d.isGP && d.isPrimaryClinic)
        .sort((a, b) => a.nextAvailableDate.getTime() - b.nextAvailableDate.getTime());
    }
    return DOCTORS.filter((d) => {
      if (specialty !== "All Specialties" && d.specialty !== specialty) return false;
      if (insurance !== "All Insurance" && !d.insurance.includes(insurance)) return false;
      return true;
    });
  }, [gpMode, specialty, insurance]);

  const handleBookSlot = (doctor: Doctor, slot: AppointmentSlot) => {
    setBookedSlotId(slot.id);

    setTimeout(() => {
      const finalIntent = {
        action: "book_appointment",
        breadcrumb: `Appointments → ${doctor.name.split(",")[0]} → ${slot.label}`,
        path: "/appointments",
        filters: {
          action: "book_confirmed",
          slotId: slot.id,
          slotDay: slot.day,
          slotDate: slot.date,
          slotTime: slot.time,
          slotDoctor: doctor.name,
          slotLocation: doctor.location,
        },
      };

      setCurrentIntent(finalIntent);
      setBreadcrumb(finalIntent.breadcrumb);
      navigate("/appointments");
    }, 600);
  };

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes pulseRingDoctor {
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
          <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
            <UserSearch className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-slate-800" style={{ fontSize: '24px', fontWeight: 600 }}>
              {gpMode ? "GP Doctors — Primary Clinic" : "Find a Doctor"}
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 ml-12">
          {gpMode
            ? "Showing available GPs at your primary clinic, sorted by next availability"
            : "Search by specialty, insurance, and location"}
        </p>
      </motion.div>

      {/* GP mode banner */}
      <AnimatePresence>
        {gpMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-700" style={{ fontWeight: 500 }}>
                ChatNav filtered to GPs at your primary clinic
              </p>
              <p className="text-xs text-blue-500 mt-0.5">
                Pick a time slot below to book instantly
              </p>
            </div>
            <button
              onClick={() => {
                setGpMode(false);
                setHighlightIds([]);
                setNextAvailableId(null);
                setIsPulsing(false);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
              style={{ fontWeight: 500 }}
            >
              Show all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters (hidden in GP mode) */}
      {!gpMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="flex flex-wrap gap-3"
        >
          <div className="relative">
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              {SPECIALTIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              {INSURANCE_OPTIONS.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(specialty !== "All Specialties" || insurance !== "All Insurance") && (
            <button
              onClick={() => {
                setSpecialty("All Specialties");
                setInsurance("All Insurance");
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
              style={{ fontWeight: 500 }}
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-400">
        {displayDoctors.length} doctor{displayDoctors.length !== 1 ? "s" : ""} found
        {gpMode && " at your primary clinic"}
      </div>

      {/* Doctor cards */}
      <div className="space-y-4">
        {displayDoctors.map((doctor, index) => {
          const isHighlighted = highlightIds.includes(doctor.id);
          const isNextAvailable = nextAvailableId === doctor.id;
          const isFirst = index === 0 && gpMode;

          return (
            <motion.div
              key={doctor.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <div
                className={`bg-white rounded-2xl overflow-hidden transition-all ${
                  isHighlighted
                    ? "border-2 border-blue-500 shadow-lg"
                    : "border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                }`}
                style={
                  isHighlighted && isPulsing
                    ? {
                        animation: "pulseRingDoctor 1.5s ease-in-out infinite",
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
                {/* Soonest badge for highlighted card */}
                {isNextAvailable && gpMode && (
                  <div className="bg-blue-50 px-4 py-2 flex items-center gap-2 border-b border-blue-100">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-blue-600" style={{ fontWeight: 500 }}>
                      Next available — {doctor.nextAvailable}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[11px]" style={{ fontWeight: 600 }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Soonest
                    </span>
                  </div>
                )}

                {/* Doctor info */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doctor.avatarGradient} flex items-center justify-center shrink-0`}>
                      <span className="text-white text-sm" style={{ fontWeight: 600 }}>
                        {doctor.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-800" style={{ fontSize: '15px', fontWeight: 500 }}>
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-blue-600 mt-0.5">{doctor.specialty}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {doctor.distance}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {doctor.rating} ({doctor.reviewCount})
                        </span>
                        {!gpMode && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            Next: {doctor.nextAvailable}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {doctor.insurance.map((ins) => (
                          <span
                            key={ins}
                            className={`px-2 py-0.5 rounded-full text-[11px] ${
                              insurance === ins
                                ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                                : "bg-slate-50 text-slate-500"
                            }`}
                            style={{ fontWeight: 500 }}
                          >
                            {ins}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Book button only in non-GP mode */}
                    {!gpMode && (
                      <button
                        className="shrink-0 px-4 py-2 text-sm text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200"
                        style={{ fontWeight: 500 }}
                      >
                        Book
                      </button>
                    )}
                  </div>
                </div>

                {/* Appointment slots — shown in GP mode */}
                {gpMode && (
                  <div className="border-t border-slate-100 px-4 pt-3 pb-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                        Available appointments
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctor.slots.map((slot, slotIdx) => {
                        const isFirstSlot = slotIdx === 0;
                        const isBooked = bookedSlotId === slot.id;

                        if (isBooked) {
                          return (
                            <motion.div
                              key={slot.id}
                              initial={{ scale: 1 }}
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 0.3 }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200"
                              style={{ fontWeight: 500 }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Booked!
                            </motion.div>
                          );
                        }

                        return (
                          <button
                            key={slot.id}
                            onClick={() => handleBookSlot(doctor, slot)}
                            className={`group relative inline-flex flex-col items-center px-3 py-2 rounded-xl text-left transition-all duration-200 ${
                              isFirstSlot
                                ? "bg-blue-50 border-2 border-blue-300 hover:bg-blue-100 hover:border-blue-400 shadow-sm shadow-blue-100/60"
                                : "bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                            }`}
                          >
                            {isFirstSlot && (
                              <span className="absolute -top-2 left-2 px-1.5 py-0 bg-blue-500 text-white text-[9px] rounded-full" style={{ fontWeight: 600 }}>
                                NEXT
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                                isFirstSlot
                                  ? "bg-blue-100"
                                  : "bg-slate-100 group-hover:bg-blue-100"
                              }`}>
                                <span className={`text-[9px] uppercase tracking-wide ${
                                  isFirstSlot ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500"
                                }`} style={{ fontWeight: 600, lineHeight: 1 }}>
                                  {slot.day}
                                </span>
                                <span className={`text-xs ${
                                  isFirstSlot ? "text-blue-700" : "text-slate-600 group-hover:text-blue-700"
                                }`} style={{ fontWeight: 700, lineHeight: 1.1 }}>
                                  {slot.date.split(" ")[1]}
                                </span>
                              </div>
                              <div>
                                <p className={`text-sm ${
                                  isFirstSlot ? "text-blue-700" : "text-slate-700 group-hover:text-blue-700"
                                }`} style={{ fontWeight: 500 }}>
                                  {slot.time}
                                </p>
                                <p className={`text-[11px] ${
                                  isFirstSlot ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500"
                                }`}>
                                  {slot.date}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {displayDoctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No doctors match your filters</p>
            <button
              onClick={() => {
                setSpecialty("All Specialties");
                setInsurance("All Insurance");
                setGpMode(false);
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