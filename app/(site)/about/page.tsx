import { ButtonLink } from "@/components/ui/Button";

const TIMELINE = [
  {
    lvl: "01",
    year: "2016",
    title: "E-Cell is founded",
    desc: "Established with the vision of fostering entrepreneurship among students, creating a platform where ideas could be explored, developed, and transformed into ventures.",
  },
  {
    lvl: "02",
    year: "2017",
    title: "First experiments",
    desc: "Expanded into Google Crowdsource programs, drone workshops, and entrepreneurship bootcamps, encouraging students to experiment with modern technology.",
  },
  {
    lvl: "03",
    year: "2018",
    title: "National stage at IIT Bombay",
    desc: "Secured 2nd place at IIT Bombay's National Entrepreneurship Challenge, marking E-Cell's arrival on the national collegiate entrepreneurship stage.",
  },
  {
    lvl: "04",
    year: "2019",
    title: "Innovation Mela win",
    desc: "Won 1st place at the Innovation Mela while several student ventures and technical projects began incubation under the Cell.",
  },
  {
    lvl: "05",
    year: "2020",
    title: "RESPAWN & going online",
    desc: "RESPAWN brought hundreds of students together for an inter-college gaming and developer event. When the pandemic hit, E-Cell shifted online and kept building.",
  },
  {
    lvl: "06",
    year: "2021–23",
    title: "Beyond events",
    desc: "Moved beyond one-off events into real-world projects, international collaborations, and tech-driven solutions with stronger incubation.",
  },
  {
    lvl: "07",
    year: "2024",
    title: "NEC grand finale",
    desc: "Collaborated with E-Cell IIT Bombay and reached the national grand finale of the National Entrepreneurship Challenge among top collegiate teams across India.",
  },
  {
    lvl: "08",
    year: "2025",
    title: "SIH 2025 winners",
    desc: "Continued competing nationally. E-Cell team Hack4Hygiene won the prestigious Smart India Hackathon 2025 organized by the Ministry of Education & AICTE.",
  },
  {
    lvl: "09",
    year: "2026",
    title: "Singularity 2026 (completed in January)",
    desc: "Celebrated ten years of student building with our landmark 24-hour hackathon, uniting over 50 prototype teams and early venture grants.",
  },
  {
    lvl: "10",
    year: "2027",
    title: "Singularity 2027 & Detroits (upcoming)",
    desc: "The next frontier: our upcoming Singularity 2027 hackathon and Detroits hardware & robotics arena, pushing collegiate engineering further.",
  },
];

export default function AboutPage() {
  return (
    <div className="wrap pt-16 pb-28">
      {/* Page Header */}
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">est. 2016 · kccemsr, thane</p>
          <h1 className="display">
            about e-cell<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          we help students turn ideas into ventures. we run hackathons,
          workshops, and mentorship, connecting student founders with people who
          have done it before.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="my-16 grid gap-8 md:grid-cols-2">
        <div className="border-line bg-surface border p-8">
          <span className="tag t-hackathon mb-3">
            <span className="dot" />
            our mission
          </span>
          <h2 className="text-ink mb-4 text-2xl font-normal tracking-tight">
            ideas in. startups out.
          </h2>
          <p className="text-ink-2 text-base leading-relaxed">
            We help KCCEMSR students move from intent to execution. We run
            workshops, competitions, hackathons, and mentorship sessions,
            connecting student founders with industry leaders who have walked
            the path before.
          </p>
        </div>

        <div className="border-line bg-surface border p-8">
          <span className="tag t-workshop mb-3">
            <span className="dot" />
            our vision
          </span>
          <h2 className="text-ink mb-4 text-2xl font-normal tracking-tight">
            failing counts as progress.
          </h2>
          <p className="text-ink-2 text-base leading-relaxed">
            Every student at KCCEMSR should have the skills, the network, and
            the nerve to start something real. We aim to normalize calculated
            risk and build an ecosystem where curiosity produces visible
            outcomes.
          </p>
        </div>
      </div>

      {/* 9-Level History Timeline */}
      <div className="section-head">
        <h2 id="timeline">
          the 10-year timeline<span className="dot-accent">.</span>
        </h2>
        <p>
          from our first meeting room in kopri, thane to the grand stages of iit
          bombay and the smart india hackathon.
        </p>
      </div>

      <div className="timeline-list">
        {TIMELINE.map((item) => (
          <div key={item.lvl} className="timeline-card">
            <div className="flex items-baseline justify-between">
              <span className="timeline-year">{item.year}</span>
              <span className="text-muted font-mono text-xs">
                LVL {item.lvl}
              </span>
            </div>
            <h3 className="text-ink text-lg font-medium tracking-tight">
              {item.title}
            </h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Faculty and College details */}
      <div className="border-line bg-surface mt-24 border p-8 md:p-12">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">institution & leadership</p>
          <h2 className="text-ink mb-4 text-3xl font-normal tracking-tight">
            k.c. college of engineering & management studies
          </h2>
          <p className="text-ink-2 mb-6 text-base leading-relaxed">
            Located in Kopri, Thane (East), affiliated with the University of
            Mumbai. E-Cell operates under the guidance of{" "}
            <strong>Prof. Yogesh Karunakar</strong> (Faculty Coordinator) and
            college leadership to encourage student innovation.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/contact" variant="primary">
              reach out to us →
            </ButtonLink>
            <ButtonLink href="/team" variant="light">
              view current cohort →
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
