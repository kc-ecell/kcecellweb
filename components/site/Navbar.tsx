"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/events", label: "events" },
  { href: "/team", label: "team" },
  { href: "/about", label: "about" },
  { href: "/wall-of-fame", label: "wall of fame" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 7) {
      clickCountRef.current = 0;
      window.dispatchEvent(new CustomEvent("ecell:logo-glitch"));
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 3000);
    }
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "`" }));
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  useEffect(() => {
    if (!isHome) return;

    const checkScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [isHome]);

  const isSolid = !isHome || scrolled;

  return (
    <header
      className={cn("site-header", isHome && "overlay", isSolid && "is-solid")}
    >
      <div className="wrap">
        <Link
          href="/"
          onClick={handleLogoClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="wordmark flex items-center transition-opacity select-none hover:opacity-85"
          aria-label="KC E-Cell"
        >
          <Image
            src="/brand/kc-ecell.png"
            alt="KC E-Cell Logo"
            width={64}
            height={54}
            className="h-10 w-auto object-contain sm:h-12"
            priority
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center lowercase transition-colors",
                  isActive
                    ? "text-accent before:bg-accent pl-3 font-medium before:absolute before:top-1/2 before:left-0 before:size-1.5 before:-translate-y-1/2"
                    : "text-ink-2 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ButtonLink
            href="/contact"
            size="sm"
            variant="primary"
            className="ml-2"
          >
            contact{" "}
            <span className="arrow" aria-hidden="true">
              <span>→</span>
            </span>
          </ButtonLink>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-ink-2 hover:text-ink cursor-pointer font-mono text-sm lowercase md:hidden"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "close" : "menu"}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="bg-bg/95 border-line fixed inset-x-0 top-[76px] bottom-0 z-50 flex flex-col gap-6 p-6 backdrop-blur-xl md:hidden">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "display flex items-center text-3xl lowercase transition-colors",
                  isActive
                    ? "text-accent before:bg-accent pl-4 before:absolute before:left-6 before:size-2"
                    : "text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ButtonLink
            href="/contact"
            variant="primary"
            className="mt-4 w-full"
            onClick={() => setMenuOpen(false)}
          >
            get in touch →
          </ButtonLink>
          <div className="border-line text-muted mt-auto border-t pt-4 font-mono text-xs">
            e-cell · k.c. college of engineering, thane
          </div>
        </div>
      )}
    </header>
  );
}
