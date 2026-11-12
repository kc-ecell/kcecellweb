import { ContactForm } from "@/components/site/ContactForm";
import { getContactSettings } from "@/lib/data/public";

export default async function ContactPage() {
  const settings = await getContactSettings();

  return (
    <div className="wrap pt-16 pb-28">
      <div className="section-head mt-0">
        <div>
          <p className="eyebrow mb-2">kccemsr, thane (east)</p>
          <h1 className="display">
            get in touch<span className="dot-accent">.</span>
          </h1>
        </div>
        <p>
          want to partner on an event, sponsor singularity, mentor student
          teams, or pitch a venture? we usually reply within{" "}
          {settings.reply_time}.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_360px]">
        {/* Contact Form */}
        <div className="bg-surface shadow-card p-8 md:p-10">
          <ContactForm />
        </div>

        {/* Info Sidebar */}
        <div className="flex flex-col gap-8">
          <div className="bg-surface shadow-card p-6">
            <h2 className="contact-label text-muted mb-2">direct email</h2>
            <a
              href={`mailto:${settings.email}`}
              className="tap-row text-ink hover:text-accent text-lg transition-colors"
            >
              {settings.email} ↗
            </a>
            <p className="text-muted mt-2 text-xs">
              checked daily by our media and leadership team.
            </p>
          </div>

          <div className="bg-surface shadow-card p-6">
            <h2 className="contact-label text-muted mb-2">campus location</h2>
            <p className="text-ink text-base">
              K.C. College of Engineering & Management Studies
            </p>
            <p className="text-muted mt-1 text-sm">{settings.address}</p>
          </div>

          <div className="bg-surface shadow-card p-6">
            <h2 className="contact-label text-muted mb-2">social links</h2>
            <div className="mt-2 flex flex-col gap-2">
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-row text-ink-2 hover:text-accent text-sm"
              >
                Instagram ↗
              </a>
              <a
                href={settings.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-row text-ink-2 hover:text-accent text-sm"
              >
                LinkedIn ↗
              </a>
              <a
                href={settings.github}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-row text-ink-2 hover:text-accent text-sm"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
