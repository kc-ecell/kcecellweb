"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">kccemsr, thane (east)</p>
          <h1 className="display">
            get in touch<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          want to partner on an event, sponsor singularity, mentor student
          teams, or pitch a venture? we usually reply within two working days.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_360px]">
        {/* Contact Form */}
        <div className="border-line bg-surface border p-8 md:p-10">
          {submitted ? (
            <div className="py-12 text-center">
              <span className="tag t-open mb-4">
                <span className="dot" />
                message received
              </span>
              <h2 className="text-ink mb-2 text-3xl font-normal tracking-tight">
                thanks for reaching out<span className="dot-accent">.</span>
              </h2>
              <p className="text-muted mx-auto max-w-md text-base">
                a member of the leadership team will review your message and
                reply via email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="text-ink-2 mb-2 block text-sm" htmlFor="name">
                  your name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. aditya or rhea"
                  className="border-line-strong bg-bg text-ink focus:border-accent w-full border p-3 focus:outline-none"
                />
              </div>

              <div>
                <label
                  className="text-ink-2 mb-2 block text-sm"
                  htmlFor="email"
                >
                  email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="border-line-strong bg-bg text-ink focus:border-accent w-full border p-3 focus:outline-none"
                />
              </div>

              <div>
                <label
                  className="text-ink-2 mb-2 block text-sm"
                  htmlFor="topic"
                >
                  topic
                </label>
                <select
                  id="topic"
                  className="border-line-strong bg-bg text-ink focus:border-accent w-full border p-3 focus:outline-none"
                >
                  <option value="partnership">
                    Sponsorship / Industry Partnership
                  </option>
                  <option value="mentorship">
                    Mentorship / Speaker Invitation
                  </option>
                  <option value="student">Student Inquiry / Join E-Cell</option>
                  <option value="singularity">
                    Singularity 2026 Hackathon
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className="text-ink-2 mb-2 block text-sm"
                  htmlFor="message"
                >
                  message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="tell us what you have in mind..."
                  className="border-line-strong bg-bg text-ink focus:border-accent w-full resize-none border p-3 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <span>send message</span>
                <span className="arrow" aria-hidden="true">
                  <span>→</span>
                </span>
              </Button>
            </form>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="flex flex-col gap-8">
          <div className="border-line bg-surface border p-6">
            <h3 className="text-muted mb-2 font-mono text-sm font-medium tracking-wider uppercase">
              direct email
            </h3>
            <a
              href="mailto:kcecell@kccemsr.edu.in"
              className="text-ink hover:text-accent text-lg transition-colors"
            >
              kcecell@kccemsr.edu.in ↗
            </a>
            <p className="text-muted mt-2 text-xs">
              checked daily by our media and leadership team.
            </p>
          </div>

          <div className="border-line bg-surface border p-6">
            <h3 className="text-muted mb-2 font-mono text-sm font-medium tracking-wider uppercase">
              campus location
            </h3>
            <p className="text-ink text-base">
              K.C. College of Engineering & Management Studies
            </p>
            <p className="text-muted mt-1 text-sm">
              Mith Bunder Road, Kopri, Thane (East), Maharashtra 400603
            </p>
          </div>

          <div className="border-line bg-surface border p-6">
            <h3 className="text-muted mb-2 font-mono text-sm font-medium tracking-wider uppercase">
              social links
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              <a
                href="https://www.instagram.com/kcecell_?utm_source=ig_web_button_share_sheet&obrf=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-2 hover:text-accent text-sm"
              >
                Instagram ↗
              </a>
              <a
                href="https://www.linkedin.com/company/kcecell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-2 hover:text-accent text-sm"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://github.com/kc-ecell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-2 hover:text-accent text-sm"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
