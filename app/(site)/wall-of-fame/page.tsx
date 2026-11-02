const WINS = [
  {
    year: "2025",
    title: "Smart India Hackathon 2025: Hack4Hygiene",
    category: "hackathon",
    organizer: "Ministry of Education & AICTE, Govt. of India",
    result: "1st Place Winner",
    tagClass: "t-winner",
    description:
      "National champions in Smart India Hackathon 2025. Team Hack4Hygiene engineered an automated, IoT-enabled public sanitation tracking and alerts network to solve municipal cleanliness challenges.",
  },
  {
    year: "2024",
    title: "National Entrepreneurship Challenge (NEC)",
    category: "entrepreneurship",
    organizer: "E-Cell, IIT Bombay",
    result: "National Finalist",
    tagClass: "t-competition",
    description:
      "Collaborated with E-Cell IIT Bombay through an intensive 6-month national competition assessing venture pipeline, campus startup density, and execution quality.",
  },
  {
    year: "2019",
    title: "Innovation Mela",
    category: "innovation",
    organizer: "Regional Innovation Consortium",
    result: "1st Place",
    tagClass: "t-hackathon",
    description:
      "1st place for student-led hardware and software prototypes incubated within KCCEMSR's technical labs.",
  },
  {
    year: "2018",
    title: "National Entrepreneurship Challenge (NEC)",
    category: "entrepreneurship",
    organizer: "E-Cell, IIT Bombay",
    result: "2nd Place Nationally",
    tagClass: "t-winner",
    description:
      "Secured 2nd place on the main stage of IIT Bombay's E-Summit, establishing KCCEMSR as a powerhouse among collegiate entrepreneurship cells in India.",
  },
];

export default function WallOfFamePage() {
  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">national track record · 2018 → 2026</p>
          <h1 className="display">
            wall of fame<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          when our teams go out to compete, we ship solutions that win. national
          hackathons, collegiate challenges, and venture podiums.
        </p>
      </div>

      <div className="mt-12 grid gap-6">
        {WINS.map((win) => (
          <div
            key={win.title + win.year}
            className="border-line bg-surface hover:border-line-strong hover:bg-sunk border p-8 transition-colors"
          >
            <div className="border-line mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b pb-4">
              <span className="text-ink font-mono text-3xl font-light tracking-tight">
                {win.year}
              </span>
              <span className={`tag ${win.tagClass}`}>
                <span className="dot" />
                {win.result}
              </span>
            </div>
            <h3 className="text-ink mb-2 text-2xl font-normal tracking-tight">
              {win.title}
            </h3>
            <p className="text-muted mb-4 text-sm">
              Organized by {win.organizer}
            </p>
            <p className="text-ink-2 max-w-3xl text-base leading-relaxed">
              {win.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
