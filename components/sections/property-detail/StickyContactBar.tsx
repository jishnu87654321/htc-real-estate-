"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/primitives/Button";
import { Modal } from "@/components/ui/Modal";
import { duration, ease } from "@/lib/motion";
import { submitApplicationAction, toggleSaveListingAction } from "@/app/actions/applications";
import { submitEnquiryAction } from "@/app/actions/public-forms";
import { Bookmark, CheckCircle2, Phone, AlertCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function StickyContactBar({
  listingId = "834db41c-8e01-4475-bd7f-94d7bb8ea611",
  listingTitle = "3 BHK for rent in Sarvani Heights, Gachibowli",
  price = 42000,
}: {
  listingId?: string;
  listingTitle?: string;
  price?: number;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [moveInDate, setMoveInDate] = useState("2026-10-01");
  const [budget, setBudget] = useState(price);
  const [occupants, setOccupants] = useState(2);
  const [message, setMessage] = useState("");
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmittedRef(null);

    startTransition(async () => {
      // First try submitting as formal logged-in application
      const appRes = await submitApplicationAction({
        listingId,
        intent: "rent",
        moveInDate,
        budget,
        occupants,
        contactPhone: phone || "9876543210",
        message,
      });

      if (appRes.success) {
        setSubmittedRef(appRes.reference || "APP-CONFIRMED");
      } else if (appRes.requiresAuth) {
        // Fallback for public visitors: create verified inquiry/lead with listing reference
        const enqRes = await submitEnquiryAction({
          name: name || "Prospective Tenant",
          email: email || "inquiry@htc.example",
          phone: phone || "9876543210",
          category: "find_home",
          message: `Application interest for ${listingTitle}. Move-in: ${moveInDate}, Budget: ₹${budget}, Occupants: ${occupants}. Note: ${message}`,
          consent: true,
          source: `/properties/${listingId}`,
          listingId,
        });

        if (enqRes.success) {
          setSubmittedRef(enqRes.reference || "Q-CONFIRMED");
        } else {
          setError(enqRes.error || "Failed to submit application");
        }
      } else {
        setError(appRes.error || "Failed to submit application");
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await toggleSaveListingAction(listingId);
      if (res.success) {
        setSaved(Boolean(res.saved));
      } else if (res.requiresAuth) {
        router.push(`/login?returnTo=/properties`);
      }
    });
  };

  return (
    <>
      <motion.div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-surface-raised p-4 shadow-lg lg:sticky lg:top-24 lg:rounded-2xl lg:border"
        initial={false}
        animate={{ y: visible ? 0 : 100 }}
        transition={{ duration: duration.base, ease: ease.out }}
      >
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1 justify-center"
            onClick={() => setApplyModalOpen(true)}
          >
            Apply to rent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 justify-center"
            onClick={() => setApplyModalOpen(true)}
          >
            Schedule a visit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className={`flex-1 justify-center ${saved ? "text-red-600 font-bold" : ""}`}
            onClick={handleSave}
            disabled={isPending}
          >
            <Bookmark className={`mr-1.5 h-4 w-4 ${saved ? "fill-red-600" : ""}`} />
            {saved ? "Saved to Account" : "Save Flat"}
          </Button>
        </div>
        <p className="mt-3 text-center text-body-xs text-text-tertiary lg:text-left">
          Verified on site by HTC team · Zero brokerage.
        </p>
      </motion.div>

      {/* Apply / Schedule Modal */}
      <Modal
        open={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSubmittedRef(null);
        }}
        title="Apply for this Home"
      >
        {submittedRef ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="text-title-md font-bold text-green-900 font-serif">Application Submitted</h3>
            <p className="font-mono text-body-sm font-bold text-text-primary bg-surface-sunken p-2.5 rounded-lg">
              Reference: {submittedRef}
            </p>
            <p className="text-body-sm text-text-secondary">
              Our on-site facility manager will review your application and contact you on {phone || "your phone"} to schedule a society walkthrough.
            </p>
            <div className="pt-4">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setApplyModalOpen(false);
                  router.push("/account");
                }}
              >
                Track in My Account
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-body-sm text-text-secondary">
              Direct application for <strong>{listingTitle}</strong>. Zero brokerage, verified tenancy.
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-body-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleApply} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="text-body-xs font-semibold text-text-primary">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Srikanth Reddy"
                    className="mt-1 w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="text-body-xs font-semibold text-text-primary">
                    Phone Number (10 digits) *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="mt-1 w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="text-body-xs font-semibold text-text-primary">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="srikanth@example.com"
                    className="mt-1 w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label htmlFor="contact-movein" className="text-body-xs font-semibold text-text-primary">
                    Expected Move-In Date *
                  </label>
                  <input
                    id="contact-movein"
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="text-body-xs font-semibold text-text-primary">
                  Notes or Questions for Facility Manager (optional)
                </label>
                <textarea
                  id="contact-message"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Family of 3, looking to schedule visit this Saturday..."
                  className="mt-1 w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" disabled={isPending} className="mt-2 justify-center">
                {isPending ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </div>
        )}
      </Modal>
    </>
  );
}
