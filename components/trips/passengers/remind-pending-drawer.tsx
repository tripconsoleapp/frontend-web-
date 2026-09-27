"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Mail, MessageCircle, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useIsDesktop } from "@/lib/use-is-desktop";

type Channel = "whatsapp" | "email" | "sms";

export function RemindPendingDrawer({
  open,
  pendingCount,
  onClose,
  onSend,
}: {
  open: boolean;
  pendingCount: number;
  onClose: () => void;
  onSend: () => void;
}) {
  const isDesktop = useIsDesktop();
  const [channels, setChannels] = useState<Set<Channel>>(new Set(["whatsapp"]));
  const [sent, setSent] = useState(false);

  function toggle(c: Channel) {
    setChannels((cur) => {
      const next = new Set(cur);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  function handleSend() {
    onSend();
    setSent(true);
  }

  function handleClose() {
    setSent(false);
    onClose();
  }

  const panelMotion = isDesktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-stretch justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <button type="button" aria-label="Close" onClick={handleClose} className="absolute inset-0 bg-navy/50" />
          <motion.div {...panelMotion} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className={cn("relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-xl", isDesktop ? "h-full max-w-sm rounded-l-2xl" : "mt-auto max-h-[70vh] rounded-t-2xl")}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="font-heading text-xl font-semibold text-navy">Remind Pending</h2>
              <button type="button" onClick={handleClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-text-grey transition-colors hover:bg-navy/5 hover:text-navy">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
              {sent ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/50 text-navy">
                    <Check size={22} />
                  </span>
                  <p className="font-heading text-base font-semibold text-navy">Reminder sent to {pendingCount} traveler{pendingCount === 1 ? "" : "s"}</p>
                </div>
              ) : (
                <>
                  <p className="font-body text-sm text-text-grey">
                    {pendingCount} traveler{pendingCount === 1 ? "" : "s"} {pendingCount === 1 ? "hasn't" : "haven't"} completed registration yet.
                  </p>
                  <div>
                    <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Send via</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {[
                        { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
                        { id: "email" as const, label: "Email", icon: Mail },
                        { id: "sms" as const, label: "SMS", icon: Smartphone },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggle(c.id)}
                          className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors", channels.has(c.id) ? "border-orange bg-orange/5" : "border-navy/10 hover:border-navy/25")}
                        >
                          <c.icon size={16} className={channels.has(c.id) ? "text-orange" : "text-navy/50"} />
                          <span className="font-body text-sm font-medium text-navy">{c.label}</span>
                          {channels.has(c.id) && <Check size={14} className="ml-auto text-orange" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={channels.size === 0}
                    onClick={handleSend}
                    className="mt-2 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send Reminder
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
