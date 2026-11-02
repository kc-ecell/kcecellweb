const POSTS = [
  {
    slug: "sih-hack4hygiene-recap",
    title: "how hack4hygiene built a national sih winner in 36 hours",
    date: "feb 2025",
    author: "Technical Team",
    summary:
      "behind the scenes of building an automated, distributed sanitation monitoring network that secured 1st prize nationally at the smart india hackathon 2025.",
    tag: "case study",
  },
  {
    slug: "singularity-2026-announcement",
    title: "singularity 2026: celebrating a decade of student builders",
    date: "oct 2026",
    author: "Leadership Team",
    summary:
      "what to expect from our flagship 24-hour inter-college hackathon, mentorship format, judge panels, and the new challenge tracks.",
    tag: "announcement",
  },
  {
    slug: "from-classroom-to-national-podium",
    title: "from our first room in thane to the grand stage at iit bombay",
    date: "2024",
    author: "Editorial",
    summary:
      "ten years of lessons in student-led incubation, managing technical cohorts, running national hackathons, and fostering contrarian builders.",
    tag: "reflection",
  },
];

export default function BlogPage() {
  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">field notes & recaps</p>
          <h1 className="display">
            blog & dispatches<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          event recaps, technical postmortems, founder notes, and dispatches
          from the team behind e-cell kccemsr.
        </p>
      </div>

      <ul className="card-list mt-8">
        {POSTS.map((post, i) => (
          <li key={post.slug} className="card-row">
            <div className="row-inner">
              <span className="index-num">0{i + 1}</span>
              <h3>{post.title}</h3>
              <span className="arrow" aria-hidden="true">
                →
              </span>
              <p>{post.summary}</p>
              <div className="meta">
                <span className="tag t-hackathon">
                  <span className="dot" />
                  {post.tag}
                </span>
                <span>by {post.author}</span>
                <span>{post.date}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
