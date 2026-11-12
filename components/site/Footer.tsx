"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { useFounder } from "@/lib/game/FounderContext";

const CONTACT_EMAIL = "kcecell@kccemsr.edu.in";
const INSTAGRAM_URL =
  "https://www.instagram.com/kcecell_?utm_source=ig_web_button_share_sheet&obrf=ZDNlZDc0MzIxNw==";
const LINKEDIN_URL = "https://www.linkedin.com/company/kcecell";
const GITHUB_URL = "https://github.com/kc-ecell";

const PAGE_LINKS = [
  { href: "/events", label: "events" },
  { href: "/team", label: "team" },
  { href: "/about", label: "about" },
  { href: "/wall-of-fame", label: "wall of fame" },
];

const SOCIAL_LINKS = [
  { href: INSTAGRAM_URL, label: "instagram" },
  { href: LINKEDIN_URL, label: "linkedin" },
  { href: GITHUB_URL, label: "github" },
];

export function Footer() {
  const { setTerminalOpen, terminalOpen } = useFounder();
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(
    null,
  );

  return (
    <footer className="site-footer bg-bg text-accent relative isolate flex min-h-svh w-full flex-col overflow-hidden px-4 pt-24 pb-20 md:px-6">
      <div className="bg-accent h-1 w-full" />

      <div className="mt-5 flex flex-col gap-8 md:mt-7 md:flex-row md:items-start md:justify-between">
        <Reveal>
          <h2 className="footer-statement">
            let&rsquo;s ship
            <br />
            your idea.
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="self-end md:self-center">
          <p className="footer-year">
            <span className="sr-only">Copyright 2026</span>
            <span aria-hidden="true">©26</span>
          </p>
        </Reveal>
      </div>

      <div className="mt-auto pt-16">
        <p className="footer-prompt">
          drop us a line about what you&rsquo;re building.
        </p>

        <Link
          href="/contact"
          className="footer-bar bg-accent hover:bg-ink mt-4 flex items-center justify-between px-5 py-5 transition-colors md:mt-5 md:px-7 md:py-7"
        >
          <span className="footer-cta">let&rsquo;s talk</span>
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 md:h-8 md:w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M6 18 18 6M8 6h10v10" />
          </svg>
        </Link>

        <div className="footer-links text-ink-2 mt-5 flex flex-col gap-3 text-xs lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1">
            <span>© 2026 E-Cell KCCEMSR</span>
            <button
              type="button"
              onClick={() => setTerminalOpen(!terminalOpen)}
              className="footer-terminal text-accent hover:text-ink cursor-pointer p-1 font-mono font-bold motion-safe:animate-pulse"
              title="Launch ecell.sh terminal (~ or Ctrl+K)"
              aria-label="Launch ecell.sh terminal"
            >
              _
            </button>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {PAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("privacy")}
                  className="cursor-pointer"
                >
                  privacy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("terms")}
                  className="cursor-pointer"
                >
                  terms
                </button>
              </li>
            </ul>
          </nav>
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
            className="bg-surface text-ink shadow-card w-full max-w-lg p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-line mb-4 flex items-center justify-between border-b pb-4">
              <h3 className="text-sm font-bold tracking-wider uppercase">
                {legalModal === "privacy"
                  ? "Privacy Policy"
                  : "Terms of Service"}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                aria-label="Close"
                className="bg-sunk text-ink hover:bg-line flex h-7 w-7 cursor-pointer items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            <div
              data-lenis-prevent
              className="text-ink-2 flex max-h-[60vh] flex-col gap-3 overflow-y-auto overscroll-contain pr-2 text-xs leading-relaxed"
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
            <div className="border-line mt-6 flex justify-end border-t pt-4">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="bg-accent text-on-accent hover:bg-ink cursor-pointer px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors"
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
