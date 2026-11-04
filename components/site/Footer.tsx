"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { TypographicDome } from "./TypographicDome";
import { useFounder } from "@/lib/game/FounderContext";

const CONTACT_EMAIL = "kcecell@kccemsr.edu.in";
const INSTAGRAM_URL =
  "https://www.instagram.com/kcecell_?utm_source=ig_web_button_share_sheet&obrf=ZDNlZDc0MzIxNw==";
const LINKEDIN_URL = "https://www.linkedin.com/company/kcecell";
const GITHUB_URL = "https://github.com/kc-ecell";

// Geometric Hatched Architectural Logo matching the reference design
function HatchedLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="#111216" strokeWidth="2.2" strokeLinecap="square">
        <line x1="2" y1="8" x2="8" y2="2" />
        <line x1="2" y1="14" x2="14" y2="2" />
        <line x1="2" y1="20" x2="20" y2="2" />
        <line x1="2" y1="26" x2="26" y2="2" />
        <line x1="2" y1="32" x2="32" y2="2" />
        <line x1="2" y1="38" x2="38" y2="2" />
        <line x1="8" y1="38" x2="38" y2="8" />
        <line x1="14" y1="38" x2="38" y2="14" />
        <line x1="20" y1="38" x2="38" y2="20" />
        <line x1="26" y1="38" x2="38" y2="26" />
        <line x1="32" y1="38" x2="38" y2="32" />
      </g>
    </svg>
  );
}

export function Footer() {
  const { setTerminalOpen, terminalOpen } = useFounder();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(
    null,
  );

  const handleSubscribe = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    try {
      localStorage.setItem("ecell:newsletter:subscribed", email);
    } catch {
      // storage unavailable
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-[#edece6] text-[#111216]">
      {/* 1. Celestial Typographic Dome & ASCII Matrix Dispersion */}
      <TypographicDome />

      {/* 2. Main Editorial Cream Footer Section */}
      <div className="relative z-10 w-full px-6 pt-8 pb-10 sm:px-10 md:px-16 lg:px-20">
        <div className="mx-auto max-w-[1360px]">
          {/* Top Grid: Brand & Newsletter (Left) | Navigation Columns (Right) */}
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Brand & Newsletter */}
            <div className="flex max-w-xl flex-col items-start lg:col-span-6">
              {/* Brand Header */}
              <div className="mb-5 flex items-center gap-3.5">
                <HatchedLogo className="h-10 w-10 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-base leading-tight font-bold tracking-tight text-[#111216] uppercase sm:text-lg">
                    THE ENTREPRENEURSHIP
                  </span>
                  <span className="font-mono text-base leading-tight font-bold tracking-tight text-[#111216] uppercase sm:text-lg">
                    CELL · KCCEMSR
                  </span>
                </div>
              </div>

              {/* Tagline / Blurb */}
              <p className="mb-6 max-w-md font-sans text-sm leading-relaxed text-neutral-600 sm:text-base">
                One short email when applications open, flagship hackathons
                drop, or seed grants go live.
              </p>

              {/* Pill Newsletter Input with Segmented [ STAY ] [ UPDATED ] Button */}
              <form
                onSubmit={handleSubscribe}
                className="relative flex w-full max-w-md items-center rounded-full border border-black/15 bg-white/50 p-1.5 transition-all focus-within:border-black/45 focus-within:bg-white"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={subscribed}
                  aria-label="Your email address"
                  className="w-full bg-transparent px-4 py-2 font-mono text-xs text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-60 sm:text-sm"
                />

                {subscribed ? (
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#111216] px-3 py-2 font-mono text-[11px] font-semibold tracking-wider text-[#edece6] uppercase select-none sm:px-4 sm:py-2.5 sm:text-xs">
                    <span>SUBSCRIBED</span>
                    <span aria-hidden="true">✓</span>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center overflow-hidden rounded-full bg-[#111216] font-mono text-[11px] font-semibold text-[#edece6] uppercase shadow-sm select-none sm:text-xs">
                    <button
                      type="button"
                      onClick={() => handleSubscribe()}
                      className="px-2.5 py-2 tracking-wider transition-colors hover:bg-neutral-800 sm:px-3.5 sm:py-2.5"
                    >
                      STAY
                    </button>
                    <div className="h-3.5 w-[1px] bg-neutral-700" />
                    <button
                      type="submit"
                      className="px-2.5 py-2 tracking-wider transition-colors hover:bg-neutral-800 sm:px-3.5 sm:py-2.5"
                    >
                      UPDATED
                    </button>
                  </div>
                )}
              </form>

              {/* College affiliation tag */}
              <div className="mt-5 flex items-center gap-2 font-mono text-[11px] tracking-wider text-neutral-500 uppercase">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span>
                  K.C. College of Engineering & Management Studies · Thane
                </span>
              </div>
            </div>

            {/* Right Column: Navigation Columns */}
            <div className="grid grid-cols-2 gap-8 sm:gap-14 lg:col-span-6 lg:pl-8">
              {/* Resources Column */}
              <div>
                <h3 className="mb-5 font-mono text-xs tracking-widest text-neutral-500 uppercase">
                  Resources
                </h3>
                <ul className="flex flex-col gap-3 font-mono text-xs font-semibold tracking-wider text-[#111216] uppercase sm:text-sm">
                  <li>
                    <Link
                      href="/events"
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      EVENTS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/team"
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      TEAM
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      ABOUT
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/wall-of-fame"
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      WALL OF FAME
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/events#singularity-2027"
                      className="inline-block text-neutral-700 transition-opacity hover:opacity-60"
                    >
                      SINGULARITY 2027
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/events#detroits"
                      className="inline-block text-neutral-700 transition-opacity hover:opacity-60"
                    >
                      DETROITS
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal & Connect Column */}
              <div>
                <h3 className="mb-5 font-mono text-xs tracking-widest text-neutral-500 uppercase">
                  Legal
                </h3>
                <ul className="flex flex-col gap-3 font-mono text-xs font-semibold tracking-wider text-[#111216] uppercase sm:text-sm">
                  <li>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      INSTAGRAM
                    </a>
                  </li>
                  <li>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      LINKEDIN
                    </a>
                  </li>
                  <li>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      GITHUB
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="inline-block transition-opacity hover:opacity-60"
                    >
                      CONTACT
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setLegalModal("privacy")}
                      className="inline-block cursor-pointer text-left transition-opacity hover:opacity-60"
                    >
                      PRIVACY POLICY
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setLegalModal("terms")}
                      className="inline-block cursor-pointer text-left transition-opacity hover:opacity-60"
                    >
                      TERMS OF SERVICE
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Made By, and Docked [ LEARN MORE + ] Pill */}
          <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-black/10 pt-6 font-mono text-xs tracking-wider text-neutral-600 md:flex-row md:items-center">
            <div className="flex items-center gap-1.5">
              <span>© 2026 THE ENTREPRENEURSHIP CELL · KCCEMSR</span>
              <button
                type="button"
                onClick={() => setTerminalOpen(!terminalOpen)}
                className="inline-block animate-pulse cursor-pointer p-0.5 text-xs font-bold text-emerald-600 hover:text-black"
                title="Launch ecell.sh terminal (~ or Ctrl+K)"
                aria-label="Launch ecell.sh terminal"
              >
                _
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span>BUILT BY E-CELL TECH TEAM</span>
                <Image
                  src="/brand/kc-ecell.png"
                  alt="KC E-Cell Logo"
                  width={24}
                  height={20}
                  className="h-auto w-5 opacity-75"
                />
              </div>

              {/* Docked Learn More Pill matching reference */}
              <button
                type="button"
                onClick={() => setLearnMoreOpen(!learnMoreOpen)}
                className="flex cursor-pointer items-center gap-2 rounded-md bg-[#dedbd2] px-3 py-1.5 font-mono text-xs font-semibold tracking-wide text-[#111216] transition-colors hover:bg-[#d4d0c5]"
                aria-expanded={learnMoreOpen}
              >
                <span>LEARN MORE</span>
                <span className="font-mono text-sm leading-none">
                  {learnMoreOpen ? "−" : "+"}
                </span>
              </button>
            </div>
          </div>

          {/* Expandable Learn More Panel */}
          {learnMoreOpen && (
            <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 rounded-lg border border-black/10 bg-[#e3e0d6] p-5 font-mono text-xs leading-relaxed text-neutral-800 duration-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-2 font-bold tracking-wider text-[#111216] uppercase">
                    MISSION
                  </h4>
                  <p className="text-neutral-600">
                    Empowering students at KCCEMSR Thane to move from intent to
                    execution through hackathons, incubation, and founder
                    mentorship.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-bold tracking-wider text-[#111216] uppercase">
                    CONNECT
                  </h4>
                  <p className="text-neutral-600">
                    Reach us at{" "}
                    <span className="font-semibold text-[#111216]">
                      {CONTACT_EMAIL}
                    </span>
                    . Campus visits and partnership proposals welcome.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-bold tracking-wider text-[#111216] uppercase">
                    FOUNDER TERMINAL
                  </h4>
                  <p className="text-neutral-600">
                    Looking for staff entry or easter eggs? Press{" "}
                    <kbd className="rounded bg-black/10 px-1.5 py-0.5 font-bold text-neutral-900">
                      ~
                    </kbd>{" "}
                    or{" "}
                    <kbd className="rounded bg-black/10 px-1.5 py-0.5 font-bold text-neutral-900">
                      `
                    </kbd>{" "}
                    anywhere on this site.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legal Dialog / Modal */}
      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-black/15 bg-[#edece6] p-6 font-mono text-[#111216] shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-4">
              <h3 className="text-sm font-bold tracking-wider uppercase">
                {legalModal === "privacy"
                  ? "Privacy Policy"
                  : "Terms of Service"}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 font-bold text-[#111216] hover:bg-black/20"
              >
                ✕
              </button>
            </div>
            <div
              data-lenis-prevent
              className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto overscroll-contain pr-2 text-xs leading-relaxed text-neutral-700"
            >
              {legalModal === "privacy" ? (
                <>
                  <p>
                    <strong>1. Information Collection:</strong> E-Cell KCCEMSR
                    collects only the contact details provided directly by you
                    when subscribing to announcements or registering for
                    hackathons.
                  </p>
                  <p>
                    <strong>2. Usage:</strong> Your email is strictly used for
                    club updates, grant alerts, and event reminders. We never
                    sell or share student data with third-party advertisers.
                  </p>
                  <p>
                    <strong>3. Data Storage:</strong> Data is handled securely
                    following educational best practices. You may request
                    removal at any time by emailing {CONTACT_EMAIL}.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Acceptance:</strong> By accessing
                    ecell-kccemsr.com, you agree to respect campus community
                    standards, hackathon rules, and student fair play.
                  </p>
                  <p>
                    <strong>2. Intellectual Property:</strong> Projects
                    developed during hackathons remain the intellectual property
                    of their respective student creators.
                  </p>
                  <p>
                    <strong>3. Conduct:</strong> Any harassment, unauthorized
                    exploitation, or disruption of events will result in
                    immediate disqualification.
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end border-t border-black/10 pt-4">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="rounded bg-[#111216] px-4 py-2 text-xs font-semibold tracking-wider text-[#edece6] uppercase transition-colors hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
