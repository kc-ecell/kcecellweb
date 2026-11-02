import Image from "next/image";

const GALLERY_PHOTOS = [
  {
    src: "/hero/team-1.webp",
    title: "hackathon floor · singularity",
    caption: "teams building late into the night during the 24-hour sprint.",
  },
  {
    src: "/hero/team-2.webp",
    title: "workshop demo & review",
    caption: "mentors reviewing student prototypes and circuit schematics.",
  },
  {
    src: "/hero/team-3.webp",
    title: "pitch day presentation",
    caption: "founders on stage pitching to the evaluation panel.",
  },
  {
    src: "/hero/team-5.webp",
    title: "national challenge qualifiers",
    caption: "strategy session preparing teams for national competitions.",
  },
  {
    src: "/hero/team-6.webp",
    title: "cohort brainstorming",
    caption: "whiteboarding system architectures and product flows.",
  },
  {
    src: "/hero/team-7.webp",
    title: "hands-on electronics lab",
    caption: "assembling sensor testbeds and iot microcontrollers.",
  },
  {
    src: "/hero/team-8.webp",
    title: "respawn gaming arena",
    caption:
      "hundreds of students gathered for our collegiate gaming and tech meetup.",
  },
  {
    src: "/hero/team-9.webp",
    title: "annual summit keynote",
    caption:
      "industry founders sharing insights on building defensible startups.",
  },
  {
    src: "/hero/team-10.webp",
    title: "celebrating the sih 2025 win",
    caption: "the moment hack4hygiene was announced national champions.",
  },
  {
    src: "/hero/landing-end.webp",
    title: "e-cell builder culture",
    caption: "shipping what's next with the student community.",
  },
];

export default function GalleryPage() {
  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">moments & records · 2016 → 2026</p>
          <h1 className="display">
            gallery<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          snapshots from hackathon floors, midnight debugging, keynote sessions,
          and national celebrations across the years.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GALLERY_PHOTOS.map((photo) => (
          <div
            key={photo.src}
            className="group border-line bg-surface hover:border-line-strong hover:bg-sunk overflow-hidden border transition-all duration-300"
          >
            <div className="bg-sunk relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-5">
              <h3 className="text-ink mb-1 text-base font-medium tracking-tight">
                {photo.title}
              </h3>
              <p className="text-muted text-xs leading-relaxed">
                {photo.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
