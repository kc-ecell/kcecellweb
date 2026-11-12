"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { submitContact } from "@/lib/actions/contact";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = Object.fromEntries(new FormData(e.currentTarget));
    setError("");
    startTransition(async () => {
      const result = await submitContact(input);
      if (result.ok) setSubmitted(true);
      else setError(result.message ?? "couldn't send that.");
    });
  };

  return (
    <>
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
            a member of the leadership team will review your message and reply
            via email shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <div>
            <label className="text-ink-2 mb-2 block text-sm" htmlFor="name">
              your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. aditya or rhea"
              className="border-line-strong bg-bg text-ink focus:border-accent w-full border p-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-ink-2 mb-2 block text-sm" htmlFor="email">
              email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="border-line-strong bg-bg text-ink focus:border-accent w-full border p-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-ink-2 mb-2 block text-sm" htmlFor="topic">
              topic
            </label>
            <select
              id="topic"
              name="topic"
              className="border-line-strong bg-bg text-ink focus:border-accent w-full border p-3 focus:outline-none"
            >
              <option value="partnership">
                Sponsorship / Industry Partnership
              </option>
              <option value="speaker">Mentorship / Speaker Invitation</option>
              <option value="general">Student Inquiry / Join E-Cell</option>
              <option value="general">Singularity 2026 Hackathon</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-ink-2 mb-2 block text-sm" htmlFor="message">
              message
            </label>
            <textarea
              id="message"
              name="message"
              minLength={10}
              required
              rows={5}
              placeholder="tell us what you have in mind..."
              className="border-line-strong bg-bg text-ink focus:border-accent w-full resize-none border p-3 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={pending}
            size="lg"
            className="w-full sm:w-auto"
          >
            <span>{pending ? "sending…" : "send message"}</span>
            <span className="arrow" aria-hidden="true">
              <span>→</span>
            </span>
          </Button>
          <p role="status" className="text-danger text-sm">
            {error}
          </p>
        </form>
      )}
    </>
  );
}
