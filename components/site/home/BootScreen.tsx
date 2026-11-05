import type { CSSProperties } from "react";
import Image from "next/image";
import { BootController } from "@/components/site/home/BootController";

// Home page logo screen. Hidden unless the gate in lib/motion/boot-gate.ts
// sets html[data-boot]. See docs/ANIMATIONS.md §1.
//
// The logo row is rendered twice, one copy per half of the screen, so the exit
// slices the logos along the seam. Both copies run identical animations.

// 17 shares no factor with 36, so this visits every cell once, in scattered order.
const PIXEL_ORDER = Array.from({ length: 36 }, (_, n) => (n * 17) % 36);

function Logos({ decorative = false }: { decorative?: boolean }) {
  return (
    <div className="boot-row">
      <div className="boot-logo boot-logo--crest">
        <Image
          src="/brand/kccemsr-crest.png"
          alt={decorative ? "" : "K.C. College of Engineering crest"}
          width={235}
          height={304}
          sizes="176px"
        />
      </div>
      <div className="boot-slot">
        <div className="boot-logo boot-logo--ecell">
          <Image
            src="/brand/kc-ecell-dark.png"
            alt={decorative ? "" : "KC E-Cell logo"}
            width={480}
            height={405}
            sizes="176px"
          />
          <div className="boot-pixels">
            {PIXEL_ORDER.map((order) => (
              <span key={order} style={{ "--i": order } as CSSProperties} />
            ))}
          </div>
        </div>
        <p className="boot-caption">
          <span>KCCEMSR, THANE</span>
          e-cell
        </p>
      </div>
    </div>
  );
}

export function BootScreen() {
  return (
    <BootController>
      <div className="boot-half boot-half--top">
        <Logos />
      </div>
      <div className="boot-half boot-half--bottom">
        <Logos decorative />
      </div>
    </BootController>
  );
}
