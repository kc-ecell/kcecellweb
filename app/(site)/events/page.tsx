"use client";

import { useState } from "react";

interface EventItem {
  id: string;
  num: string;
  title: string;
  type: "hackathon" | "workshop" | "competition" | "gaming";
  status: "upcoming" | "past";
  location: string;
  date: string;
  summary: string;
  tagClass: string;
}

const ALL_EVENTS: EventItem[] = [
  {
    id: "singularity-2027",
    num: "01",
    title: "singularity 2027",
    type: "hackathon",
    status: "upcoming",
    location: "kccemsr campus · thane",
    date: "flagship 2027",
    summary:
      "the next iteration of our flagship 24-hour inter-college hackathon: bringing together student builders, product designers, and VC mentors for intense prototyping.",
    tagClass: "t-hackathon",
  },
  {
    id: "detroits",
    num: "02",
    title: "detroits",
    type: "competition",
    status: "upcoming",
    location: "kccemsr tech arena",
    date: "upcoming 2026–27",
    summary:
      "our marquee engineering and hardware showcase featuring high-stakes robotics competitions, autonomous builds, and inter-college tech rivalries.",
    tagClass: "t-competition",
  },
  {
    id: "singularity-2026",
    num: "03",
    title: "singularity 2026",
    type: "hackathon",
    status: "past",
    location: "kccemsr campus · thane",
    date: "january 2026 · completed",
    summary:
      "celebrated 10 years of student builders with our biggest 24-hour hackathon, featuring 50+ prototype submissions, industry judges, and early stage seed grants.",
    tagClass: "t-hackathon",
  },
  {
    id: "sih-2025",
    num: "04",
    title: "smart india hackathon 2025 (hack4hygiene)",
    type: "competition",
    status: "past",
    location: "national grand finale",
    date: "2025",
    summary:
      "e-cell team hack4hygiene won 1st prize at sih 2025, solving national-scale sanitation challenges with automated monitoring systems.",
    tagClass: "t-winner",
  },
  {
    id: "nec-2024",
    num: "05",
    title: "national entrepreneurship challenge (iit bombay)",
    type: "competition",
    status: "past",
    location: "iit bombay campus",
    date: "2024",
    summary:
      "grand finalists finishing 44th among 500+ colleges nationwide, showcasing e-cell kccemsr's year-round incubation pipeline.",
    tagClass: "t-competition",
  },
  {
    id: "respawn-2020",
    num: "06",
    title: "respawn gaming & dev meetup",
    type: "gaming",
    status: "past",
    location: "campus & online",
    date: "2020",
    summary:
      "bringing together hundreds of collegiate esports players, designers, and game developers before the pandemic shift.",
    tagClass: "t-workshop",
  },
  {
    id: "nec-2018",
    num: "07",
    title: "nec 2018 podium finish (2nd place)",
    type: "competition",
    status: "past",
    location: "iit bombay",
    date: "2018",
    summary:
      "our first major national podium finish: 2nd place in the national entrepreneurship challenge at e-summit iit bombay.",
    tagClass: "t-competition",
  },
  {
    id: "drone-workshop-2017",
    num: "08",
    title: "hands-on drone engineering workshop",
    type: "workshop",
    status: "past",
    location: "kccemsr robotics lab",
    date: "2017",
    summary:
      "hands-on aerodynamics, flight controllers, and assembling quadcopters from scratch with student engineers.",
    tagClass: "t-workshop",
  },
  {
    id: "google-crowdsource-2017",
    num: "09",
    title: "google crowdsource community initiative",
    type: "workshop",
    status: "past",
    location: "seminar hall",
    date: "2017",
    summary:
      "collaborative machine learning data annotation and ai language model training workshops conducted in partnership with google crowdsource.",
    tagClass: "t-workshop",
  },
];

const FILTERS = [
  { id: "all", label: "all events" },
  { id: "upcoming", label: "upcoming" },
  { id: "hackathon", label: "hackathons" },
  { id: "competition", label: "competitions" },
  { id: "workshop", label: "workshops" },
];

export default function EventsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = ALL_EVENTS.filter((e) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return e.status === "upcoming";
    return e.type === filter;
  });

  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">100+ events · 2016 → 2026</p>
          <h1 className="display">
            events & hackathons<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          from 24-hour hackathons and tech bootcamps to national podium
          finishes. upcoming events and archive records.
        </p>
      </div>

      <nav className="filters" aria-label="Filter events">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-current={filter === f.id ? "true" : undefined}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <ul className="card-list">
        {filtered.map((item) => (
          <li key={item.id} className="card-row">
            <div className="row-inner">
              <span className="index-num">{item.num}</span>
              <h3>{item.title}</h3>
              <span className="arrow" aria-hidden="true">
                →
              </span>
              <p>{item.summary}</p>
              <div className="meta">
                <span className={`tag ${item.tagClass}`}>
                  <span className="dot" />
                  {item.type}
                </span>
                <span>{item.location}</span>
                <span>{item.date}</span>
                {item.status === "upcoming" && (
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
    </div>
  );
}
