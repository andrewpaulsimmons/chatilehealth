import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Home,
  Calendar,
  MessageSquare,
  FlaskConical,
  Pill,
  CreditCard,
  UserSearch,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatNavBar } from "./chat-nav-bar";
import { DemoCursor } from "./demo-cursor";
import { ChatNavProvider, useChatNav } from "./chat-nav-context";
import { FEATURE_FLAGS } from "../feature-flags";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Appointments", path: "/appointments", icon: Calendar },
  { label: "Messages", path: "/messages", icon: MessageSquare },
  { label: "Test Results", path: "/test-results", icon: FlaskConical },
  { label: "Medications", path: "/medications", icon: Pill },
  { label: "Billing", path: "/billing", icon: CreditCard },
  { label: "Find a Doctor", path: "/find-doctor", icon: UserSearch },
];

export function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ChatNavProvider>
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-600" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <button onClick={() => navigate("/")} className="flex items-center gap-2.5" data-demo-nav="home">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm" style={{ fontWeight: 700 }}>C</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-slate-800" style={{ fontWeight: 600, fontSize: '16px' }}>
                    Chatile
                  </span>
                  <span className="text-blue-500 ml-1" style={{ fontWeight: 400, fontSize: '16px' }}>
                    Health
                  </span>
                </div>
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs" style={{ fontWeight: 600 }}>AJ</span>
                </div>
                <span className="hidden md:block text-sm text-slate-700" style={{ fontWeight: 500 }}>
                  Andrew
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ChatNav Bar - prominent strip below header */}
      <div className="sticky top-14 z-30 bg-gradient-to-b from-white via-white to-transparent">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <ChatNavBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-0">
        {/* Desktop sidebar nav */}
        <aside className="hidden lg:block w-56 shrink-0 pt-6 pr-6">
          <nav className="sticky top-36 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span className="text-sm" style={{ fontWeight: isActive ? 500 : 400 }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-100 z-30 lg:hidden shadow-xl"
              >
                <nav className="p-4 space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Icon
                          className={`w-[18px] h-[18px] ${
                            isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm" style={{ fontWeight: isActive ? 500 : 400 }}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 py-6">
          <Outlet />
        </main>
      </div>

      {/* ChatNav label badge */}
      <DemoBadge />
      <DemoCursor />
    </div>
    </ChatNavProvider>
  );
}

function DemoBadge() {
  const { showTypingDemo, setShowTypingDemo } = useChatNav();

  // Support both the static flag and a ?autoDemo=true URL param
  const isAutoDemo =
    FEATURE_FLAGS.AUTO_DEMO ||
    new URLSearchParams(window.location.search).get("autoDemo") === "true";

  // Auto-start the demo 5 seconds after mount when the flag is on
  useEffect(() => {
    if (!isAutoDemo) return;
    const t = setTimeout(() => {
      setShowTypingDemo(true);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  // When auto-demo is active, hide the badge entirely
  if (isAutoDemo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          if (!showTypingDemo) setShowTypingDemo(true);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg shadow-slate-200/60 border transition-all duration-200 cursor-pointer ${
          showTypingDemo
            ? "bg-blue-50 border-blue-200 shadow-blue-100/60"
            : "bg-white/90 backdrop-blur-sm border-slate-100 hover:border-blue-200 hover:bg-blue-50 hover:shadow-blue-100/40"
        }`}
      >
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          showTypingDemo ? "bg-blue-400" : "bg-green-400"
        }`} />
        <span className={`text-[11px] tracking-wide ${
          showTypingDemo ? "text-blue-600" : "text-slate-500"
        }`} style={{ fontWeight: 500 }}>
          {showTypingDemo ? "Playing..." : "Run Demo"}
        </span>
      </button>
    </div>
  );
}