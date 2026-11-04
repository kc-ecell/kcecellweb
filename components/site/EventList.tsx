"use client";

import { useState } from "react";
import type { PublicEvent } from "@/lib/data/public";

const FILTERS = [
  { id: "all", label: "all events" },
  { id: "upcoming", label: "upcoming" },
  { id: "hackathon", label: "hackathons" },
  { id: "competition", label: "competitions" },
  { id: "workshop", label: "workshops" },
];

export function EventList({ events }: { events: PublicEvent[] }) {
  const [filter, setFilter] = useState("all");
  const filtered = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return event.upcoming;
    return event.format === filter;
  });

  return (
    <>
      <nav className="filters" aria-label="Filter events">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            aria-current={filter === option.id ? "true" : undefined}
          >
            {option.label}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <p className="text-muted mt-8">no events here yet.</p>
      ) : (
        <ul className="card-list">
          {filtered.map((event, index) => (
            <li key={event.id} id={event.slug} className="card-row">
              <div className="row-inner">
                <span className="index-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{event.title}</h3>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
                <p>{event.summary}</p>
                <div className="meta">
                  <span className={`tag ${event.tagClass}`}>
                    <span className="dot" />
                    {event.format}
                  </span>
                  <span>{event.venue}</span>
                  <span>{event.dateLabel}</span>
                  {event.upcoming && (
                    <span className="tag t-open">
                      <span className="dot" />
                      coming soon
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
