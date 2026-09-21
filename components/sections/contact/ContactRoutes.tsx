"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Button } from "@/components/primitives/Button";
import { duration, ease } from "@/lib/motion";
import { submitEnquiryAction, submitWalkthroughAction } from "@/app/actions/public-forms";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function ContactRoutes() {
  const [active, setActive] = useState<string | null>("find");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [consent, setConsent] = useState(true);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent, category: "find_home" | "list_property" | "community") => {
    e.preventDefault();
    setError(null);
    setSubmittedRef(null);

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill in all required fields (Name, Email, Phone)");
      return;
    }

    startTransition(async () => {
      if (category === "community") {
        const res = await submitWalkthroughAction({
          name,
          phone,
          email,
          communityName: communityName || "Local Community",
        });
        if (res.success) {
          setSubmittedRef(res.reference || "W-CONFIRMED");
        } else {
          setError(res.error || "Failed to submit request");
        }
      } else {
        const res = await submitEnquiryAction({
          name,
          email,
          phone,
          category,
          message: message.trim() || `General inquiry regarding ${category.replace("_", " ")}`,
          consent: true,
          source: "/contact",
        });
        if (res.success) {
          setSubmittedRef(res.reference || "Q-CONFIRMED");
        } else {
          setError(res.error || "Failed to submit inquiry");
        }
      }
    });
  };

  return (
    <Section>
      <Container className="max-w-2xl">
        {submittedRef && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <h3 className="mt-2 text-title-md font-bold text-green-900">Thank you! Request Received</h3>
            <p className="mt-1 font-mono text-body-sm text-green-800">
              Reference: <strong>{submittedRef}</strong>
            </p>
            <p className="mt-2 text-body-sm text-green-700">
              Our Hyderabad team has received your details and will get in touch shortly.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-body-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Option 1: Find a home */}
          <div className="rounded-xl border border-border-subtle bg-surface-raised overflow-hidden">
            <button
              type="button"
              onClick={() => setActive(active === "find" ? null : "find")}
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <div>
                <span className="block text-title-lg font-semibold text-text-primary">Looking for a flat</span>
                <span className="mt-1 block text-body-sm text-text-tertiary">Find a home in an HTC-managed society</span>
              </div>
            </button>
            <AnimatePresence>
              {active === "find" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: duration.base, ease: ease.inOut }}
                  className="px-6 pb-6"
                >
                  <form onSubmit={(e) => handleSubmit(e, "find_home")} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-body-xs font-medium text-text-tertiary mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Srikanth Rao"
                          className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-body-xs font-medium text-text-tertiary mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="srikanth@example.com"
                          className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-body-xs font-medium text-text-tertiary mb-1">Phone Number (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-body-xs font-medium text-text-tertiary mb-1">Preferred Locality & Requirements</label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Looking for a 3 BHK in Gachibowli or Kondapur around ₹40,000..."
                        className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                      />
                    </div>
                    {/* Honeypot */}
                    <input type="text" name="website_hp" className="hidden" tabIndex={-1} autoComplete="off" />
                    <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={isPending}>
                      {isPending ? "Submitting..." : "Send Request"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Option 2: Committee Walkthrough */}
          <div className="rounded-xl border border-border-subtle bg-surface-raised overflow-hidden">
            <button
              type="button"
              onClick={() => setActive(active === "community" ? null : "community")}
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <div>
                <span className="block text-title-lg font-semibold text-text-primary">On a Society Committee / RWA</span>
                <span className="mt-1 block text-body-sm text-text-tertiary">Request a 30-minute walkthrough presentation</span>
              </div>
            </button>
            <AnimatePresence>
              {active === "community" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: duration.base, ease: ease.inOut }}
                  className="px-6 pb-6"
                >
                  <form onSubmit={(e) => handleSubmit(e, "community")} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-body-xs font-medium text-text-tertiary mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="P. Venkat"
                          className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-body-xs font-medium text-text-tertiary mb-1">Society Name *</label>
                        <input
                          type="text"
                          required
                          value={communityName}
                          onChange={(e) => setCommunityName(e.target.value)}
                          placeholder="e.g. My Home Vihanga"
                          className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-body-xs font-medium text-text-tertiary mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-body-xs font-medium text-text-tertiary mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="committee@society.com"
                          className="w-full rounded-lg border border-border-strong bg-surface-base px-3.5 py-2.5 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                    {/* Honeypot */}
                    <input type="text" name="website_hp" className="hidden" tabIndex={-1} autoComplete="off" />
                    <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={isPending}>
                      {isPending ? "Requesting..." : "Schedule Walkthrough"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Section>
  );
}
