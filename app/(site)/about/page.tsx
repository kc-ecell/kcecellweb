import { ButtonLink } from "@/components/ui/Button";
import { getTimeline } from "@/lib/data/public";

export default async function AboutPage() {
  const timeline = await getTimeline();

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
        {timeline.map((item) => (
          <div key={item.id} className="timeline-card">
            <div className="flex items-baseline justify-between">
              <span className="timeline-year">{item.year}</span>
              <span className="text-muted font-mono text-xs">
                LVL {String(item.level).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-ink text-lg font-medium tracking-tight">
              {item.title}
            </h3>
            <p>{item.description}</p>
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
