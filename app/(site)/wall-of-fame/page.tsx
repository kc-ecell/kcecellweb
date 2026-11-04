import { getAchievements } from "@/lib/data/public";

export default async function WallOfFamePage() {
  const wins = await getAchievements();

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
        {wins.map((win) => (
          <div
            key={win.id}
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
            {win.organizer && (
              <p className="text-muted mb-4 text-sm">
                Organized by {win.organizer}
              </p>
            )}
            <p className="text-ink-2 max-w-3xl text-base leading-relaxed">
              {win.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
