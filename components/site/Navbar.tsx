"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { useFounder } from "@/lib/game/FounderContext";

const MOBILE_LINKS = [{ href: "/", label: "home" }];

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
  const { setTerminalOpen } = useFounder();
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

  // Close the mobile menu on navigation
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // While the mobile menu is open: lock page scroll, close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isSolid = !isHome || scrolled || menuOpen;

  const isActiveLink = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "site-header",
          isHome && "overlay",
          isSolid && "is-solid",
        )}
      >
        <div className="wrap">
          <Link
            href="/"
            onClick={handleLogoClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="wordmark flex shrink-0 items-center transition-opacity select-none hover:opacity-85"
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
            className="text-ink-2 hover:text-ink shrink-0 cursor-pointer px-2 py-3 font-mono text-sm lowercase md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? "close" : "menu"}
          </button>
        </div>
      </header>

      {/* Mobile menu: rendered outside the header, because the header's
        transform/backdrop-filter would trap a fixed child inside its 76px box. */}
      {menuOpen && (
        <div id="mobile-menu" className="mobile-menu md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-5">
            {[...MOBILE_LINKS, ...NAV_LINKS].map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "display flex items-center gap-3 text-3xl lowercase transition-colors",
                    isActive ? "text-accent" : "text-ink",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 shrink-0",
                      isActive ? "bg-accent" : "bg-transparent",
                    )}
                  />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <ButtonLink
            href="/contact"
            variant="primary"
            className="mt-8 w-full"
            onClick={() => setMenuOpen(false)}
          >
            get in touch →
          </ButtonLink>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setTerminalOpen(true);
            }}
            className="border-line text-ink-2 hover:text-ink mt-3 w-full cursor-pointer border px-4 py-3 text-left font-mono text-sm"
          >
            <span className="text-accent">&gt;_</span> open terminal
          </button>
          <div className="border-line text-muted mt-auto border-t pt-4 font-mono text-xs">
            e-cell · k.c. college of engineering, thane
          </div>
        </div>
      )}
    </>
  );
}
