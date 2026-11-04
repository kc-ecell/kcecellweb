import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { TeamCard } from "@/components/site/TeamCard";
import { getStats, getTeam } from "@/lib/data/public";

const EVENTS = [
  {
    num: "01",
    title: "singularity 2027",
    tag: "upcoming",
    tagClass: "t-hackathon",
    location: "on campus · thane",
    date: "flagship 2027",
    summary:
      "the next chapter of our flagship 24-hour hackathon: uniting student builders, mentors, and early-stage capital.",
    href: "/events#singularity-2027",
  },
  {
    num: "02",
    title: "detroits",
    tag: "upcoming",
    tagClass: "t-competition",
    location: "engineering grounds",
    date: "upcoming 2026–27",
    summary:
      "high-octane engineering, robotics competitions, and hardware prototyping challenging inter-college student teams.",
    href: "/events#detroits",
  },
  {
    num: "03",
    title: "singularity 2026",
    tag: "completed",
    tagClass: "t-winner",
    location: "on campus · thane",
    date: "january 2026",
    summary:
      "celebrated 10 years of student builders with our biggest 24-hour hackathon, featuring 50+ prototype submissions and seed funding.",
    href: "/events#singularity-2026",
  },
  {
    num: "04",
    title: "hack4hygiene · sih 2025",
    tag: "winner",
    tagClass: "t-winner",
    location: "national stage",
    date: "sih 2025",
    summary:
      "e-cell teams took on the smart india hackathon 2025, bringing home 1st place nationally with hack4hygiene.",
    href: "/wall-of-fame",
  },
];

const TIMELINE_HIGHLIGHTS = [
  {
    year: "2016",
    title: "e-cell is founded",
    desc: "established at kccemsr to give students a space to turn ideas into scalable ventures.",
  },
  {
    year: "2018",
    title: "national stage at iit-b",
    desc: "secured 2nd place at iit bombay's national entrepreneurship challenge.",
  },
  {
    year: "2020",
    title: "respawn + online pivot",
    desc: "brought hundreds of students together for gaming and shifted building activities online.",
  },
  {
    year: "2024",
    title: "nec grand finale",
    desc: "reached the national grand finale of the entrepreneurship challenge with e-cell iit bombay.",
  },
  {
    year: "2025",
    title: "sih 2025 winners",
    desc: "hack4hygiene won the smart india hackathon 2025 national competition.",
  },
  {
    year: "2026",
    title: "singularity 2026 (completed in jan)",
    desc: "celebrated a decade of student founders with our biggest 24-hour hackathon platform to date.",
  },
  {
    year: "2027",
    title: "singularity 2027 & detroits",
    desc: "upcoming flagship hackathon and high-stakes engineering robotics competition.",
  },
];

export default async function Home() {
  const [stats, team] = await Promise.all([getStats(), getTeam()]);
  const featuredTeam = team.filter((m) => m.tier !== "faculty").slice(0, 8);
  const members = stats.find((stat) => stat.slug === "members");

  return (
    <>
      {/* 1. Hero Media: Pixel art illustration from Commons Gigs */}
      <div className="hero-media">
        <picture>
          <source type="image/avif" srcSet="/brand/hero-1672.avif" />
          <source type="image/webp" srcSet="/brand/hero-1672.webp" />
          <img
            src="/brand/hero-1672.jpg"
            alt="A pixel-art garden with an old computer sitting among the trees"
            width={1672}
            height={941}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      {/* 2. Hero Section */}
      <section className="hero wrap">
        <h1 className="display">
          ideas in. startups out<span className="dot-accent">.</span>
        </h1>
        <div>
          <p>
            the entrepreneurship cell of k.c. college of engineering and
            management studies, thane. we help students move from intent to
            execution.
          </p>
          <p>
            ventures, hackathons, mentorship from industry founders, and results
            you can point to.
          </p>
          <div className="btn-group">
            <ButtonLink href="#events" size="lg" variant="primary">
              <span>see what we run</span>
              <span className="arrow down" aria-hidden="true">
                <span>↓</span>
              </span>
            </ButtonLink>
            <ButtonLink href="/team" size="lg" variant="primary">
              <span>meet the team</span>
              <span className="arrow" aria-hidden="true">
                <span>→</span>
              </span>
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* 3. At a Glance Stats */}
      <section className="wrap" aria-label="At a glance">
        <dl className="stats">
          {stats.map((s) => (
            <div key={s.slug}>
              <dt>{s.label}</dt>
              <dd>{s.display}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 4. Flagships & Events */}
      <section className="wrap" id="events" aria-labelledby="events-heading">
        <div className="section-head">
          <h2 id="events-heading">flagships &amp; events</h2>
          <p>
            hackathons, bootcamps, and national challenges. everything we build
            and compete in across the academic year.
          </p>
        </div>

        <ul className="card-list card-list--plain">
          {EVENTS.map((event) => (
            <li key={event.num} className="card-row">
              <Link href={event.href}>
                <h3>{event.title}</h3>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
                <p>{event.summary}</p>
                <div className="meta">
                  <span className={`tag ${event.tagClass}`}>
                    <span className="dot" />
                    {event.tag}
                  </span>
                  <span>{event.location}</span>
                  <span>{event.date}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. What We Do: The 4 Core Programs */}
      <section
        className="wrap"
        id="programs"
        aria-labelledby="programs-heading"
      >
        <div className="section-head">
          <h2 id="programs-heading">what we do</h2>
          <p>
            from first-year ideation to pitching in front of national panels.
            our four core initiatives.
          </p>
        </div>

        <div className="program-grid">
          <div className="program">
            <h3>hackathons</h3>
            <p>
              24-hour inter-college builds where student teams turn ideas into
              working software and hardware prototypes with direct floor
              mentorship.
            </p>
          </div>
          <div className="program">
            <h3>bootcamps &amp; workshops</h3>
            <p>
              hands-on technical tracks covering applied ai, fullstack systems,
              embedded robotics, and cybersecurity fundamentals.
            </p>
          </div>
          <div className="program">
            <h3>incubation &amp; mentorship</h3>
            <p>
              regular review sessions for venture ideas, prototype validation,
              pitch decks, and connections to campus seed grants and angel
              networks.
            </p>
          </div>
          <div className="program">
            <h3>national challenges</h3>
            <p>
              sponsored contingents and focused prep for nec iit bombay, smart
              india hackathon, and collegiate innovation challenges across
              india.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Timeline: 2016 -> 2026 */}
      <section
        className="wrap"
        id="timeline"
        aria-labelledby="timeline-heading"
      >
        <div className="section-head">
          <h2 id="timeline-heading">the story so far</h2>
          <p>
            established in 2016. from a classroom in thane to national podiums
            at iit bombay and smart india hackathon.
          </p>
        </div>

        <div className="timeline-list">
          {TIMELINE_HIGHLIGHTS.map((milestone) => (
            <div key={milestone.year} className="timeline-card">
              <div className="timeline-year">{milestone.year}</div>
              <h4 className="text-ink text-base font-medium tracking-tight">
                {milestone.title}
              </h4>
              <p>{milestone.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Featured Team: 2026-27 Cohort */}
      <section className="wrap" id="team" aria-labelledby="team-heading">
        <div className="section-head">
          <h2 id="team-heading">the builders</h2>
          <p>
            {team.length} people across five departments run e-cell this year.
            here are some of the people behind the work.
          </p>
        </div>

        <div className="team-grid">
          {featuredTeam.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <ButtonLink href="/team" variant="light" size="lg">
            <span>meet the full 2026–27 cohort</span>
            <span className="arrow" aria-hidden="true">
              <span>→</span>
            </span>
          </ButtonLink>
        </div>
      </section>

      {/* 8. Full-Width Rolling CTA Band */}
      <Link href="/contact" className="cta-band">
        <div className="wrap">
          <div>
            <span className="roll">
              <span>have an idea to build?</span>
              <span aria-hidden="true">partner with e-cell →</span>
            </span>
            <span className="sub">
              talk to {members?.display} student founders and engineers at
              kccemsr
            </span>
          </div>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </div>
      </Link>
    </>
  );
}
