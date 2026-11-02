import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { GamificationLayer } from "@/components/game/GamificationLayer";
import { PageCritters } from "@/components/game/PageCritters";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LenisProvider>
      <GamificationLayer>
        <a
          href="#content"
          className="focus:bg-lime focus:text-lime-ink sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[var(--z-overlay)] focus:rounded-sm focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="content" className="relative flex flex-1 flex-col">
          <PageCritters count={10} />
          {children}
        </main>
        <Footer />
      </GamificationLayer>
    </LenisProvider>
  );
}
