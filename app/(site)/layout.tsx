import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#content"
        className="focus:bg-lime focus:text-lime-ink sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[var(--z-overlay)] focus:rounded-sm focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="content" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
