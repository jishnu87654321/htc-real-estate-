"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Button } from "@/components/primitives/Button";
import { duration, ease, useReducedMotion } from "@/lib/motion";
import { submitOwnerSubmissionAction } from "@/app/actions/public-forms";
import { AlertCircle } from "lucide-react";

export function ListFlow() {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [locality, setLocality] = useState("Gachibowli");
  const [communityName, setCommunityName] = useState("");
  const [bhk, setBhk] = useState(3);
  const [areaSqft, setAreaSqft] = useState(1450);
  const [price, setPrice] = useState(45000);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  const totalSteps = 4;

  function next() {
    setError(null);
    if (step === 0 && !locality.trim()) {
      setError("Please enter community or locality");
      return;
    }
    if (step === 2 && (!price || price <= 0)) {
      setError("Please enter a valid monthly rent");
      return;
    }
    if (step === totalSteps - 1) {
      // Final Submit
      if (!ownerName.trim() || !ownerEmail.trim() || !ownerPhone.trim()) {
        setError("Please enter your name, email and phone number");
        return;
      }

      startTransition(async () => {
        const res = await submitOwnerSubmissionAction({
          ownerName,
          ownerEmail,
          ownerPhone,
          locality,
          communityName: communityName || undefined,
          bhk,
          areaSqft,
          price,
        });

        if (res.success) {
          setReference(res.reference || "");
          setDone(true);
        } else {
          setError(res.error || "Failed to submit property");
        }
      });
      return;
    }

    setDirection(1);
    setStep((s) => s + 1);
  }

  function back() {
    setError(null);
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <Section id="new" className="bg-surface-page">
      <Container className="max-w-2xl">
        {!done ? (
          <>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <motion.div
                className="h-full rounded-full bg-clay-600"
                animate={{ scaleX: (step + 1) / totalSteps }}
                style={{ transformOrigin: "left", width: "100%" }}
                transition={{ duration: duration.base, ease: ease.out }}
              />
            </div>
            <p className="mt-3 text-body-sm text-text-tertiary">
              Step {step + 1} of {totalSteps}
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-body-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="relative mt-6 min-h-[260px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={reducedMotion ? undefined : { x: 40 * direction, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={reducedMotion ? undefined : { x: -40 * direction, opacity: 0 }}
                  transition={{ duration: duration.base, ease: ease.out }}
                  className="space-y-4"
                >
                  {step === 0 && (
                    <>
                      <h2 className="font-serif text-display-sm text-text-primary">Where is your property?</h2>
                      <p className="text-body-md text-text-secondary">
                        Enter community name and locality. If HTC manages it, verification is instant.
                      </p>
                      <div>
                        <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="locality">
                          Locality / Area *
                        </label>
                        <input
                          id="locality"
                          type="text"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                          placeholder="e.g. Gachibowli, Kondapur, HITEC City"
                        />
                      </div>
                      <div>
                        <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="community">
                          Society or Community Name (optional)
                        </label>
                        <input
                          id="community"
                          type="text"
                          value={communityName}
                          onChange={(e) => setCommunityName(e.target.value)}
                          className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                          placeholder="e.g. Sarvani Heights"
                        />
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h2 className="font-serif text-display-sm text-text-primary">Tell us about the home</h2>
                      <p className="text-body-md text-text-secondary">Size, layout, and configuration.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="bhk">
                            BHK Configuration
                          </label>
                          <select
                            id="bhk"
                            value={bhk}
                            onChange={(e) => setBhk(Number(e.target.value))}
                            className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                          >
                            <option value={1}>1 BHK</option>
                            <option value={2}>2 BHK</option>
                            <option value={3}>3 BHK</option>
                            <option value={4}>4+ BHK</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="area">
                            Area (sq ft)
                          </label>
                          <input
                            id="area"
                            type="number"
                            value={areaSqft}
                            onChange={(e) => setAreaSqft(Number(e.target.value))}
                            className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                            placeholder="1450"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="font-serif text-display-sm text-text-primary">Rent and pricing</h2>
                      <p className="text-body-md text-text-secondary">Expected monthly rent in INR.</p>
                      <div>
                        <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="price">
                          Expected Monthly Rent (₹) *
                        </label>
                        <input
                          id="price"
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                          placeholder="42000"
                        />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h2 className="font-serif text-display-sm text-text-primary">Your contact details</h2>
                      <p className="text-body-md text-text-secondary">
                        Our facility manager on site will call you to schedule physical verification.
                      </p>
                      <div>
                        <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="ownerName">
                          Full Name *
                        </label>
                        <input
                          id="ownerName"
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                          placeholder="K. Ramesh Rao"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="ownerEmail">
                            Email *
                          </label>
                          <input
                            id="ownerEmail"
                            type="email"
                            value={ownerEmail}
                            onChange={(e) => setOwnerEmail(e.target.value)}
                            className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                            placeholder="owner@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-body-sm font-medium text-text-primary mb-1" htmlFor="ownerPhone">
                            Phone Number *
                          </label>
                          <input
                            id="ownerPhone"
                            type="tel"
                            value={ownerPhone}
                            onChange={(e) => setOwnerPhone(e.target.value)}
                            className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 py-3 text-body-md text-text-primary focus:outline-none"
                            placeholder="9876543210"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex justify-between">
              <Button type="button" variant="ghost" size="md" onClick={back} disabled={step === 0 || isPending}>
                Back
              </Button>
              <Button type="button" variant="primary" size="md" onClick={next} disabled={isPending}>
                {isPending ? "Submitting..." : step === totalSteps - 1 ? "Submit Property" : "Continue"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <svg viewBox="0 0 48 48" className="h-14 w-14 text-green-600">
              <motion.circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: ease.out }} />
              <motion.path
                d="M14 24l7 7 13-15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: ease.out }}
              />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: duration.slow }}>
              <span className="mt-4 inline-block font-mono text-body-sm font-bold text-text-tertiary">
                Reference: {reference}
              </span>
              <h2 className="mt-2 font-serif text-display-sm text-text-primary">Your property has been submitted!</h2>
              <p className="mt-3 max-w-[46ch] text-body-md text-text-secondary">
                Our HTC facility manager will review your submission and contact you on {ownerPhone} within 24 hours to schedule verification.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button href="/account" variant="primary" size="md">
                  View in My Account
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setStep(0);
                    setDone(false);
                  }}
                >
                  List another property
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </Container>
    </Section>
  );
}
