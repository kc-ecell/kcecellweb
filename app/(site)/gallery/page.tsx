import Image from "next/image";
import { getGallery } from "@/lib/data/public";

export default async function GalleryPage() {
  const photos = await getGallery();

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
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group bg-surface hover:shadow-card-hover hover:bg-sunk shadow-card overflow-hidden transition-all duration-300"
          >
            <div className="bg-sunk relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-5">
              <h3 className="text-ink mb-1 text-base font-medium tracking-tight">
                {photo.alt}
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
