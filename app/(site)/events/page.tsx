import { EventList } from "@/components/site/EventList";
import { getEvents, getStats } from "@/lib/data/public";

export default async function EventsPage() {
  const [events, stats] = await Promise.all([getEvents(), getStats()]);
  const total = stats.find((stat) => stat.slug === "events");

  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">{total?.display} events · 2016 → 2026</p>
          <h1 className="display">
            events & hackathons<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          from 24-hour hackathons and tech bootcamps to national podium
          finishes. upcoming events and archive records.
        </p>
      </div>

      <EventList events={events} />
    </div>
  );
}
