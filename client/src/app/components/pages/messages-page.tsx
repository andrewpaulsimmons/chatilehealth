import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Paperclip,
  ChevronLeft,
  Plus,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChatNav } from "../chat-nav-context";

interface Message {
  id: string;
  from: string;
  avatar: string;
  avatarColor: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  thread: Array<{
    sender: string;
    text: string;
    time: string;
    isMe: boolean;
  }>;
}

const MESSAGES: Message[] = [
  {
    id: "m1",
    from: "Dr. Sarah Chen",
    avatar: "SC",
    avatarColor: "from-emerald-400 to-teal-500",
    subject: "Lab Results Discussion",
    preview:
      "Your recent lab results look good overall. I'd like to discuss your glucose levels at our upcoming appointment.",
    date: "Feb 16",
    unread: true,
    thread: [
      {
        sender: "Dr. Sarah Chen",
        text: "Hi Andrew, your recent lab results from February 12th are back. Overall, everything looks good! Your CBC is entirely within normal ranges.\n\nHowever, I noticed your fasting glucose came back at 108 mg/dL, which is slightly above the normal range of 70-100. This isn't alarming, but I'd like to discuss adjusting your Metformin dosage when we meet on February 24th.\n\nPlease continue taking your current medications as prescribed. Let me know if you have any questions before our appointment.",
        time: "Feb 16, 10:23 AM",
        isMe: false,
      },
      {
        sender: "Andrew",
        text: "Thank you Dr. Chen. I've been monitoring my blood sugar at home and the readings have been between 100-115 in the morning. Should I be concerned?",
        time: "Feb 16, 2:45 PM",
        isMe: true,
      },
      {
        sender: "Dr. Sarah Chen",
        text: "Those readings are consistent with what we're seeing in the lab work. Not concerning at this stage, but worth monitoring. We'll review the trends together at your visit. Keep up the great work with your diet and exercise routine!",
        time: "Feb 16, 4:12 PM",
        isMe: false,
      },
    ],
  },
  {
    id: "m2",
    from: "Dr. Michael Torres",
    avatar: "MT",
    avatarColor: "from-violet-400 to-purple-500",
    subject: "Annual Physical Reminder",
    preview:
      "Reminder: Please schedule your annual physical exam. It's been over a year since your last visit.",
    date: "Feb 13",
    unread: false,
    thread: [
      {
        sender: "Dr. Michael Torres",
        text: "Hi Andrew, this is a friendly reminder that it's been over 12 months since your last annual physical examination. Regular check-ups are important for maintaining good health.\n\nI have availability on March 15th if you'd like to schedule. You can book directly through the portal or reply to this message.",
        time: "Feb 13, 9:00 AM",
        isMe: false,
      },
      {
        sender: "Andrew",
        text: "Thanks Dr. Torres! March 15th works for me. I've booked the 9:00 AM slot through the portal.",
        time: "Feb 13, 11:30 AM",
        isMe: true,
      },
    ],
  },
  {
    id: "m3",
    from: "Chatile Health Pharmacy",
    avatar: "MH",
    avatarColor: "from-blue-400 to-indigo-500",
    subject: "Prescription Ready for Pickup",
    preview:
      "Your prescription for Lisinopril 10mg is ready for pickup at Chatile Health Pharmacy.",
    date: "Feb 1",
    unread: false,
    thread: [
      {
        sender: "Chatile Health Pharmacy",
        text: "Your prescription for Lisinopril 10mg (30-day supply) is ready for pickup at Chatile Health Pharmacy, 100 Health Blvd.\n\nPickup hours: Mon-Fri 8AM-8PM, Sat 9AM-5PM\nPlease bring a valid photo ID.\n\nRefills remaining: 5",
        time: "Feb 1, 8:00 AM",
        isMe: false,
      },
    ],
  },
];

const DOCTOR_PREFILLS: Record<string, { toLabel: string; toValue: string; body: string }> = {
  "dr-chen": {
    toLabel: "Dr. Sarah Chen, MD",
    toValue: "dr-chen",
    body: "Hi Dr. Chen,\n\nI would like to schedule a follow-up appointment to discuss my recent lab results and ongoing diabetes management. Please let me know your earliest availability.\n\nThank you,\nAndrew",
  },
  "dr-torres": {
    toLabel: "Dr. Michael Torres, MD",
    toValue: "dr-torres",
    body: "Hi Dr. Torres,\n\nI would like to schedule a follow-up appointment at your earliest convenience. Please let me know what times work best.\n\nThank you,\nAndrew",
  },
};

export function MessagesPage() {
  const { currentIntent } = useChatNav();
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  // Compose states
  const [composeTo, setComposeTo] = useState("dr-chen");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [showPrefillBadge, setShowPrefillBadge] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Detect ChatNav compose intents
  const isFollowupCompose = currentIntent?.filters?.action === "compose_followup";
  const isGenericCompose = currentIntent?.filters?.action === "compose";
  const shouldCompose = isFollowupCompose || isGenericCompose;

  // Pre-fill the compose form when arriving via ChatNav followup flow
  useEffect(() => {
    if (isFollowupCompose && currentIntent?.filters?.doctorId) {
      const doctorId = currentIntent.filters.doctorId;
      const prefill = DOCTOR_PREFILLS[doctorId];
      if (prefill) {
        setComposeTo(prefill.toValue);
        setComposeSubject("Follow-up Appointment Request");
        setComposeBody(prefill.body);
        setShowPrefillBadge(true);
        // Focus the body textarea after a short delay
        setTimeout(() => {
          bodyRef.current?.focus();
          // Place cursor at end
          if (bodyRef.current) {
            bodyRef.current.selectionStart = prefill.body.length;
            bodyRef.current.selectionEnd = prefill.body.length;
          }
        }, 400);
      }
    }
  }, [isFollowupCompose, currentIntent?.filters?.doctorId]);

  const selected = MESSAGES.find((m) => m.id === selectedMessage);

  const handleOpenCompose = () => {
    setShowCompose(true);
    setSelectedMessage(null);
    // Reset compose fields for manual compose
    setComposeTo("dr-chen");
    setComposeSubject("");
    setComposeBody("");
    setShowPrefillBadge(false);
    setMessageSent(false);
    setSendingMessage(false);
  };

  const handleSendMessage = () => {
    if (!composeBody.trim() && !composeSubject.trim()) return;
    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      setMessageSent(true);
    }, 800);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    setTimeout(() => {
      setSendingReply(false);
      setReplySent(true);
      setReplyText("");
      setTimeout(() => setReplySent(false), 2500);
    }, 600);
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
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-slate-800" style={{ fontSize: '24px', fontWeight: 600 }}>
              Messages
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2 ml-12">
          Communicate with your care team
        </p>
      </motion.div>

      {/* New message button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <button
          onClick={handleOpenCompose}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200 inline-flex items-center gap-2"
          style={{ fontWeight: 500 }}
        >
          <Plus className="w-4 h-4" />
          New Message
        </button>
      </motion.div>

      <div className="flex gap-4 min-h-[500px]">
        {/* Message list */}
        <div
          className={`${
            selected || showCompose || shouldCompose ? "hidden sm:block" : ""
          } w-full sm:w-80 shrink-0 space-y-2`}
        >
          {MESSAGES.map((msg, index) => (
            <motion.button
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => {
                setSelectedMessage(msg.id);
                setShowCompose(false);
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedMessage === msg.id
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${msg.avatarColor} flex items-center justify-center shrink-0`}
                >
                  <span className="text-white text-[10px]" style={{ fontWeight: 600 }}>
                    {msg.avatar}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm truncate ${
                        msg.unread ? "text-slate-800" : "text-slate-600"
                      }`}
                      style={{ fontWeight: msg.unread ? 600 : 400 }}
                    >
                      {msg.from}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">{msg.date}</span>
                  </div>
                  <p
                    className="text-xs text-slate-500 mt-0.5 truncate"
                    style={{ fontWeight: msg.unread ? 500 : 400 }}
                  >
                    {msg.subject}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{msg.preview}</p>
                </div>
                {msg.unread && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Message detail or compose */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {selected && !showCompose && !shouldCompose ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full"
              >
                {/* Thread header */}
                <div className="p-4 border-b border-slate-100">
                  <button
                    className="sm:hidden flex items-center gap-1 text-sm text-blue-600 mb-2"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <h3 className="text-slate-800" style={{ fontSize: '15px', fontWeight: 500 }}>
                    {selected.subject}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    with {selected.from}
                  </p>
                </div>

                {/* Thread messages */}
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {selected.thread.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 ${
                          msg.isMe
                            ? "bg-blue-500 text-white"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                        <p
                          className={`text-[11px] mt-2 ${
                            msg.isMe ? "text-blue-200" : "text-slate-400"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply input */}
                <div className="p-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <Paperclip className="w-4 h-4 text-slate-400" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a reply..."
                      className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button
                      className="p-2.5 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
                      onClick={handleSendReply}
                      disabled={sendingReply}
                    >
                      {sendingReply ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  {replySent && (
                    <p className="text-sm text-blue-500 mt-2">Message sent!</p>
                  )}
                </div>
              </motion.div>
            ) : showCompose || shouldCompose ? (
              <motion.div
                key="compose"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full"
              >
                <div className="p-4 border-b border-slate-100">
                  <button
                    className="sm:hidden flex items-center gap-1 text-sm text-blue-600 mb-2"
                    onClick={() => setShowCompose(false)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-800" style={{ fontSize: '15px', fontWeight: 500 }}>
                      {isFollowupCompose ? "Follow-up Appointment Request" : "New Message"}
                    </h3>
                    {showPrefillBadge && isFollowupCompose && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full"
                      >
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span className="text-[11px] text-blue-600" style={{ fontWeight: 500 }}>
                          Pre-filled by ChatNav
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {messageSent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16"
                    >
                      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-7 h-7 text-green-500" />
                      </div>
                      <h4 className="text-slate-800" style={{ fontSize: '16px', fontWeight: 600 }}>
                        Message sent!
                      </h4>
                      <p className="text-sm text-slate-500 mt-1 text-center max-w-xs">
                        Your message has been sent to {DOCTOR_PREFILLS[composeTo]?.toLabel || "your provider"}. You will be notified when they reply.
                      </p>
                      <button
                        onClick={() => {
                          setMessageSent(false);
                          setSendingMessage(false);
                          setComposeSubject("");
                          setComposeBody("");
                          setShowPrefillBadge(false);
                        }}
                        className="mt-6 px-5 py-2 text-sm text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        Back to compose
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                          To
                        </label>
                        <select
                          value={composeTo}
                          onChange={(e) => setComposeTo(e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 border-0 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="dr-chen">Dr. Sarah Chen, MD</option>
                          <option value="dr-torres">Dr. Michael Torres, MD</option>
                          <option value="dr-wilson">Dr. James Wilson, MD</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                          Subject
                        </label>
                        <input
                          type="text"
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="Enter subject..."
                          className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                          Message
                        </label>
                        <textarea
                          ref={bodyRef}
                          rows={8}
                          value={composeBody}
                          onChange={(e) => setComposeBody(e.target.value)}
                          placeholder="Type your message..."
                          data-demo-compose-body
                          className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setShowCompose(false);
                            setComposeSubject("");
                            setComposeBody("");
                            setShowPrefillBadge(false);
                          }}
                          className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          Cancel
                        </button>
                        <button
                          className={`px-5 py-2 text-sm text-white rounded-xl transition-all inline-flex items-center gap-2 ${
                            sendingMessage
                              ? "bg-blue-400 scale-95"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                          style={{ fontWeight: 500 }}
                          onClick={handleSendMessage}
                          disabled={sendingMessage}
                          data-demo-send-message
                        >
                          {sendingMessage ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            >
                              <Send className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {sendingMessage ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden sm:flex h-full items-center justify-center"
              >
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    Select a message to read
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}