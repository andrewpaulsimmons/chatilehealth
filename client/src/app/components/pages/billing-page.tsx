import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Shield,
  Receipt,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChatNav } from "../chat-nav-context";

interface BillingItem {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "due";
  provider: string;
}

const INITIAL_BILLING_ITEMS: BillingItem[] = [
  {
    id: "b1",
    description: "Lab Work — Blood Panel",
    date: "February 12, 2026",
    amount: 45.0,
    status: "due",
    provider: "Chatile Health Lab",
  },
  {
    id: "b2",
    description: "Office Visit — Internal Medicine",
    date: "January 20, 2026",
    amount: 30.0,
    status: "due",
    provider: "Dr. Sarah Chen, MD",
  },
  {
    id: "b3",
    description: "Prescription — Lisinopril 10mg",
    date: "February 1, 2026",
    amount: 12.0,
    status: "paid",
    provider: "Chatile Health Pharmacy",
  },
  {
    id: "b4",
    description: "Chest X-Ray (PA & Lateral)",
    date: "December 10, 2025",
    amount: 85.0,
    status: "paid",
    provider: "Chatile Radiology",
  },
  {
    id: "b5",
    description: "Office Visit — Family Medicine",
    date: "November 5, 2025",
    amount: 30.0,
    status: "paid",
    provider: "Dr. Michael Torres, MD",
  },
];

const CONFIRMATION_NUMBER = "CHT-20260220-7849";

type PaymentStep = null | "review" | "processing" | "success";

export function BillingPage() {
  const [items, setItems] = useState<BillingItem[]>(INITIAL_BILLING_ITEMS);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>(null);
  const [copiedConfirmation, setCopiedConfirmation] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  const { currentIntent } = useChatNav();

  const dueItems = items.filter((b) => b.status === "due");
  const totalDue = dueItems.reduce((sum, b) => sum + b.amount, 0);
  const outstandingCount = dueItems.length;

  // Auto-open review modal when navigated via "pay my bill" intent
  useEffect(() => {
    if (currentIntent?.action === "pay_bill" && dueItems.length > 0 && paymentStep === null) {
      const t = setTimeout(() => {
        setPaymentStep("review");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentIntent?.action]);

  const handlePayBalance = () => {
    if (dueItems.length === 0) return;
    setPaymentStep("review");
  };

  const handleConfirmPayment = () => {
    setPaidAmount(totalDue);
    setPaidCount(dueItems.length);
    setPaymentStep("processing");
  };

  // Processing timer
  useEffect(() => {
    if (paymentStep !== "processing") return;
    const t = setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.status === "due" ? { ...item, status: "pending" as const } : item
        )
      );
      setPaymentStep("success");
    }, 1800);
    return () => clearTimeout(t);
  }, [paymentStep]);

  const handleCloseModal = () => {
    setPaymentStep(null);
    setCopiedConfirmation(false);
  };

  const handleCopyConfirmation = () => {
    navigator.clipboard.writeText(CONFIRMATION_NUMBER).catch(() => {});
    setCopiedConfirmation(true);
    setTimeout(() => setCopiedConfirmation(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-slate-800" style={{ fontSize: "24px", fontWeight: 600 }}>
              Billing
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 ml-12">
          View and pay your medical bills
        </p>
      </motion.div>

      {/* Balance summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Current Balance</p>
            <p className="text-slate-800 mt-1" style={{ fontSize: "32px", fontWeight: 600 }}>
              ${totalDue.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {outstandingCount > 0
                ? `${outstandingCount} outstanding item${outstandingCount !== 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          <button
            onClick={handlePayBalance}
            disabled={outstandingCount === 0}
            className={`px-6 py-3 text-sm rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5 ${
              outstandingCount === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200"
            }`}
            style={{ fontWeight: 500 }}
          >
            <DollarSign className="w-4 h-4" />
            {outstandingCount === 0 ? "Nothing Due" : "Pay Balance"}
          </button>
        </div>
      </motion.div>

      {/* Billing items */}
      <div>
        <h2 className="text-slate-700 mb-3" style={{ fontSize: "15px", fontWeight: 500 }}>
          Billing History
        </h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                    {item.description}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.date} &middot; {item.provider}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                    ${item.amount.toFixed(2)}
                  </p>
                  <div className="mt-1">
                    <AnimatePresence mode="wait">
                      {item.status === "paid" ? (
                        <motion.span
                          key="paid"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full"
                          style={{ fontWeight: 500 }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </motion.span>
                      ) : item.status === "due" ? (
                        <motion.span
                          key="due"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="inline-flex items-center gap-1 text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full"
                          style={{ fontWeight: 500 }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          Due
                        </motion.span>
                      ) : (
                        <motion.span
                          key="pending"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
                          style={{ fontWeight: 500 }}
                        >
                          <Clock className="w-3 h-3" />
                          Pending
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Download statement */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="flex justify-center"
      >
        <button
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          style={{ fontWeight: 500 }}
        >
          <Download className="w-4 h-4" />
          Download Full Statement
        </button>
      </motion.div>

      {/* ===== Payment Modal Overlay ===== */}
      <AnimatePresence>
        {paymentStep !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(4px)" }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-900/40"
              onClick={paymentStep === "processing" ? undefined : handleCloseModal}
            />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative bg-white rounded-3xl shadow-2xl shadow-slate-300/40 w-full max-w-md overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {/* ---- STEP 1: Review ---- */}
                {paymentStep === "review" && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-slate-800" style={{ fontSize: "17px", fontWeight: 600 }}>
                            Review Payment
                          </h2>
                          <p className="text-xs text-slate-400">Confirm details before paying</p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    {/* Saved payment method */}
                    <div className="mx-6 mt-2 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-5">
                          <span className="text-[11px] text-slate-300 tracking-widest uppercase" style={{ fontWeight: 500 }}>
                            Payment Method
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-red-500/90" />
                            <div className="w-6 h-6 rounded-full bg-amber-400/80 -ml-3" />
                          </div>
                        </div>
                        <p className="text-[15px] tracking-widest" style={{ fontWeight: 500 }}>
                          &bull;&bull;&bull;&bull;  &bull;&bull;&bull;&bull;  &bull;&bull;&bull;&bull;  4242
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Cardholder</p>
                            <p className="text-xs text-slate-200 mt-0.5" style={{ fontWeight: 500 }}>Andrew M. Johnson</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Expires</p>
                            <p className="text-xs text-slate-200 mt-0.5" style={{ fontWeight: 500 }}>09/28</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Itemized breakdown */}
                    <div className="px-6 mt-5">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2.5" style={{ fontWeight: 600 }}>
                        Items being paid
                      </p>
                      <div className="space-y-0 divide-y divide-slate-100">
                        {dueItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-3">
                            <div className="min-w-0">
                              <p className="text-sm text-slate-700 truncate" style={{ fontWeight: 500 }}>
                                {item.description}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.provider}</p>
                            </div>
                            <p className="text-sm text-slate-800 shrink-0 ml-4" style={{ fontWeight: 600 }}>
                              ${item.amount.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-slate-200">
                        <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>Total</p>
                        <p className="text-slate-800" style={{ fontSize: "20px", fontWeight: 700 }}>
                          ${totalDue.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Security note + confirm */}
                    <div className="px-6 pt-5 pb-6">
                      <button
                        onClick={handleConfirmPayment}
                        data-demo-confirm-payment
                        className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-all shadow-sm shadow-blue-200 inline-flex items-center justify-center gap-2"
                        style={{ fontWeight: 600 }}
                      >
                        <Shield className="w-4 h-4" />
                        Confirm &amp; Pay ${totalDue.toFixed(2)}
                      </button>
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        <Shield className="w-3 h-3 text-slate-300" />
                        <span className="text-[11px] text-slate-400">256-bit SSL encrypted &middot; HIPAA compliant</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ---- STEP 2: Processing ---- */}
                {paymentStep === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 py-16 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="w-14 h-14 rounded-full border-[3px] border-slate-100 border-t-blue-500 mb-5"
                    />
                    <p className="text-slate-800" style={{ fontSize: "17px", fontWeight: 600 }}>
                      Processing payment...
                    </p>
                    <p className="text-sm text-slate-400 mt-1.5">
                      Please do not close this window
                    </p>
                  </motion.div>
                )}

                {/* ---- STEP 3: Success ---- */}
                {paymentStep === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Green header band */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 pt-8 pb-10 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 -translate-x-16" />
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-10 translate-x-8" />
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
                        className="relative"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-9 h-9 text-white" />
                        </div>
                        <h2 className="text-white" style={{ fontSize: "20px", fontWeight: 700 }}>
                          Payment Successful
                        </h2>
                        <p className="text-green-100 text-sm mt-1">
                          Your payment has been submitted
                        </p>
                      </motion.div>
                    </div>

                    {/* Receipt body */}
                    <div className="px-6 -mt-4">
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-5">
                        {/* Amount */}
                        <div className="text-center pb-4 border-b border-dashed border-slate-200">
                          <p className="text-xs text-slate-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>Amount Paid</p>
                          <p className="text-slate-800 mt-1" style={{ fontSize: "28px", fontWeight: 700 }}>
                            ${paidAmount.toFixed(2)}
                          </p>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-4">
                          <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>Date</p>
                            <p className="text-sm text-slate-700 mt-0.5" style={{ fontWeight: 500 }}>Feb 20, 2026</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>Status</p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-0.5" style={{ fontWeight: 500 }}>
                              <CheckCircle2 className="w-3 h-3" />
                              Payment sent
                            </span>
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>Method</p>
                            <p className="text-sm text-slate-700 mt-0.5 inline-flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              Mastercard &bull;&bull;4242
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>Items</p>
                            <p className="text-sm text-slate-700 mt-0.5" style={{ fontWeight: 500 }}>
                              {paidCount} charge{paidCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Confirmation number */}
                        <div className="bg-slate-50 rounded-xl p-3 mt-1 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>
                              Confirmation #
                            </p>
                            <p className="text-sm text-slate-800 mt-0.5 font-mono" style={{ fontWeight: 600 }}>
                              {CONFIRMATION_NUMBER}
                            </p>
                          </div>
                          <button
                            onClick={handleCopyConfirmation}
                            className="p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
                            title="Copy confirmation number"
                          >
                            {copiedConfirmation ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Saved card reminder */}
                    <div className="px-6 mt-4">
                      <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Receipt className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-700" style={{ fontWeight: 500 }}>
                            A receipt has been sent to your email on file.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Close button */}
                    <div className="px-6 pt-5 pb-6">
                      <button
                        onClick={handleCloseModal}
                        data-demo-done-payment
                        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm rounded-xl transition-all inline-flex items-center justify-center"
                        style={{ fontWeight: 500 }}
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}