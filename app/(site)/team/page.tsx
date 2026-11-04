"use client";

import { useState } from "react";
import Image from "next/image";

interface Member {
  name: string;
  role: string;
  dept: string;
  photo?: string;
  photoBw?: string;
  bio: string;
}

const MEMBERS: Member[] = [
  // Faculty
  {
    name: "Prof. Yogesh Karunakar",
    role: "Faculty Coordinator",
    dept: "faculty",
    bio: "approves everything. reads every proposal. still replies at 11pm, which is either dedication or insomnia.",
  },
  // Leadership
  {
    name: "Raaj Patkar",
    role: "President",
    dept: "leadership",
    photo: "/team/raaj-patkar.png",
    photoBw: "/team/raaj-patkar-bw.png",
    bio: "runs the show, calls the meetings nobody asked for, and somehow still finds time to sleep. probably.",
  },
  {
    name: "Daivik Pawar",
    role: "Vice President",
    dept: "leadership",
    photo: "/team/daivik-pawar.png",
    photoBw: "/team/daivik-pawar-bw.png",
    bio: "the president when the president is busy. knows where every document is, including the one you lost.",
  },
  {
    name: "Subhra Parijha",
    role: "Secretary",
    dept: "leadership",
    photo: "/team/secretary.png",
    photoBw: "/team/secretary-bw.png",
    bio: "writes the minutes no one reads, sends the emails no one answers, and keeps the calendar honest.",
  },
  {
    name: "Krishna Mundhara",
    role: "Treasurer",
    dept: "leadership",
    photo: "/team/krishna-mundhara.png",
    photoBw: "/team/krishna-mundhara-bw.png",
    bio: "counting money that does not exist yet, chasing invoices that do, and explaining budgets.",
  },
  // Technical
  {
    name: "Ishwar Suthar",
    role: "Web Dev Head",
    dept: "technical",
    photo: "/team/web-dev-head.png",
    photoBw: "/team/web-dev-head-bw.png",
    bio: "ships the site, breaks the site, fixes the site. lives in dev tools and argues about semicolons.",
  },
  {
    name: "Rushabh Makwana",
    role: "Web Dev Co-Head",
    dept: "technical",
    photo: "/team/web-dev-cohead.png",
    photoBw: "/team/web-dev-cohead-bw.png",
    bio: "reviews the PRs the head rubber-stamped. writes the tests nobody asked for. always right.",
  },
  {
    name: "Aryan Wesavkar",
    role: "Cybersecurity Head",
    dept: "technical",
    photo: "/team/cyber-head.png",
    photoBw: "/team/cyber-head-bw.png",
    bio: "breaks things on purpose so the rest of us do not have to. will find the bug.",
  },
  {
    name: "Amey Thanekar",
    role: "Cybersecurity Co-Head",
    dept: "technical",
    bio: "backup paranoia. runs the CTFs and reads postmortems. knows your password was in a dump.",
  },
  {
    name: "Sachman Chadha",
    role: "AI/ML Head",
    dept: "technical",
    photo: "/team/sachman-chadha.png",
    photoBw: "/team/sachman-chadha-bw.png",
    bio: "trains models on data we should not have. writes prompts like spells. hallucinates, but on purpose.",
  },
  {
    name: "Sanchita Pawar",
    role: "AI/ML Co-Head",
    dept: "technical",
    photo: "/team/ai-ml-cohead.png",
    photoBw: "/team/ai-ml-cohead-bw.png",
    bio: "tames the GPU bill and reads the arXiv so the rest of the team can pretend they did.",
  },
  {
    name: "Siddhi Pandey",
    role: "IoT Head",
    dept: "technical",
    photo: "/team/siddhi-pandey.png",
    photoBw: "/team/siddhi-pandey-bw.png",
    bio: "solders things to other things, then wonders why the lights flicker. owns four broken arduinos.",
  },
  {
    name: "Aditi Panchal",
    role: "IoT Co-Head",
    dept: "technical",
    photo: "/team/aditi-panchal.png",
    photoBw: "/team/aditi-panchal-bw.png",
    bio: "has a favourite sensor. won't admit which. solders better than the head.",
  },
  {
    name: "Vaishnav Yewale",
    role: "DevOps Head",
    dept: "technical",
    photo: "/team/vaishnav-yewale.png",
    photoBw: "/team/vaishnav-yewale-bw.png",
    bio: "pipes data from here to there. the deploy works on their machine, which is the only machine that matters.",
  },
  {
    name: "Jeeval Patil",
    role: "DevOps Co-Head",
    dept: "technical",
    photo: "/team/devops-cohead.png",
    photoBw: "/team/devops-cohead-bw.png",
    bio: "pages the team at 3am when the cluster sneezes. sticker on the laptop: it works on my box.",
  },
  // Events
  {
    name: "Piyush Singh",
    role: "Event Head",
    dept: "events",
    photo: "/team/event-head.png",
    photoBw: "/team/event-head-bw.png",
    bio: "says yes to every event idea, then figures out how. has a calendar that would break a normal human.",
  },
  {
    name: "Sahil Madiwala",
    role: "Event Co-Head",
    dept: "events",
    photo: "/team/events-cohead.png",
    photoBw: "/team/events-cohead-bw.png",
    bio: "books the room, books the mic, books the panic attack. brings the clipboard to every meeting.",
  },
  {
    name: "Siddhesh Pawar",
    role: "Event Co-Head",
    dept: "events",
    photo: "/team/siddhesh-pawar.png",
    photoBw: "/team/siddhesh-pawar-bw.png",
    bio: "the second clipboard. the second coffee. the reason nothing catches fire.",
  },
  {
    name: "Krupa Marakal",
    role: "Hospitality Head",
    dept: "events",
    photo: "/team/hospitality-head.png",
    photoBw: "/team/hospitality-head-bw.png",
    bio: "feeds the team. feeds the speakers. knows which canteen is open on sundays.",
  },
  {
    name: "Jimeet Trivedi",
    role: "Volunteering Head",
    dept: "events",
    photo: "/team/volunteering-head.png",
    photoBw: "/team/volunteering-head-bw.png",
    bio: "herds the volunteers. has a group chat that pings constantly and a patient face.",
  },
  // Media
  {
    name: "Siddhi Bhangale",
    role: "Design Head",
    dept: "media",
    photo: "/team/siddhi-bhangale.png",
    photoBw: "/team/siddhi-bhangale-bw.png",
    bio: "turns rough napkin sketches into pixel-perfect Figma components. argues about kerning and grid systems.",
  },
  {
    name: "Disha Suthar",
    role: "Social Media Head",
    dept: "media",
    photo: "/team/disha-suthar.png",
    photoBw: "/team/disha-suthar-bw.png",
    bio: "posts at the worst hours for the algorithm. knows which trend to skip and which one to hijack.",
  },
  {
    name: "Devyani Palaye",
    role: "Social Media Co-Head",
    dept: "media",
    photo: "/team/devyani-palaye.png",
    photoBw: "/team/devyani-palaye-bw.png",
    bio: "drafts the captions the head edits. holds the brand voice together when everyone wants to be funny.",
  },
  {
    name: "Maahi Nagdeote",
    role: "Editor",
    dept: "media",
    photo: "/team/maahi-nagdeote.png",
    photoBw: "/team/maahi-nagdeote-bw.png",
    bio: "reads the writing twice, fixes it once, and is the reason the posts sound human.",
  },
];

const DEPTS = [
  { id: "all", label: "all builders" },
  { id: "leadership", label: "leadership" },
  { id: "technical", label: "technical" },
  { id: "events", label: "events & ops" },
  { id: "media", label: "media & comms" },
  { id: "faculty", label: "faculty" },
];

export default function TeamPage() {
  const [activeDept, setActiveDept] = useState("all");

  const filtered =
    activeDept === "all"
      ? MEMBERS
      : MEMBERS.filter((m) => m.dept === activeDept);

  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">cohort 2026–27 · kccemsr</p>
          <h1 className="display">
            the team<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          twenty-four students across five departments. we run the hackathons,
          manage the code, book the stages, and back the ventures.
        </p>
      </div>

      <nav className="filters" aria-label="Filter by department">
        {DEPTS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiveDept(d.id)}
            aria-current={activeDept === d.id ? "true" : undefined}
          >
            {d.label}
          </button>
        ))}
      </nav>

      <div className="team-grid">
        {filtered.map((member) => (
          <div key={member.name} className="team-card">
            <div className="team-photo-wrap">
              {member.photo ? (
                <>
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={340}
                    height={340}
                    className="team-photo-color"
                  />
                  {member.photoBw && (
                    <Image
                      src={member.photoBw}
                      alt=""
                      aria-hidden="true"
                      width={340}
                      height={340}
                      className="team-photo-bw"
                    />
                  )}
                </>
              ) : (
                <div className="bg-sunk text-muted flex h-full w-full items-center justify-center text-2xl font-light">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
            </div>
            <div className="team-info">
              <h4>{member.name}</h4>
              <span className="role">{member.role}</span>
              <p className="bio">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
