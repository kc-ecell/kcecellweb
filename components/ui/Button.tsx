"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant =
  "default" | "primary" | "secondary" | "light" | "ghost" | "danger";
type ButtonSize = "default" | "lg" | "sm";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export function useButtonFx() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!canHover || reduced || el.classList.contains("sm")) return;

    const fill = el.querySelector(".btn-fill") as HTMLElement | null;
    if (!fill) return;

    el.classList.add("btn-fx");

    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
    const PULL = 0.07;
    let origin = "50% 50%";

    const at = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
    };

    const onEnter = (e: PointerEvent) => {
      const { x, y } = at(e);
      origin = `${x}% ${y}%`;
      fill.getAnimations().forEach((a) => a.cancel());
      fill.animate(
        [
          { clipPath: `circle(0% at ${origin})` },
          { clipPath: `circle(160% at ${origin})` },
        ],
        { duration: 500, easing: EASE, fill: "forwards" },
      );
    };

    const onLeave = (e: PointerEvent) => {
      const { x, y } = at(e);
      fill.getAnimations().forEach((a) => a.cancel());
      fill.animate(
        [
          { clipPath: `circle(100% at ${origin})` },
          { clipPath: `circle(0% at ${x}% ${y}%)` },
        ],
        { duration: 420, easing: EASE, fill: "forwards" },
      );
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty(
        "--mx",
        `${(e.clientX - (r.left + r.width / 2)) * PULL}px`,
      );
      el.style.setProperty(
        "--my",
        `${(e.clientY - (r.top + r.height / 2)) * PULL}px`,
      );
    };

    el.addEventListener("pointerenter", onEnter as EventListener);
    el.addEventListener("pointerleave", onLeave as EventListener);
    el.addEventListener("pointermove", onMove as EventListener);

    return () => {
      el.removeEventListener("pointerenter", onEnter as EventListener);
      el.removeEventListener("pointerleave", onLeave as EventListener);
      el.removeEventListener("pointermove", onMove as EventListener);
    };
  }, []);

  return ref;
}

export function Button({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const fxRef = useButtonFx();

  const variantClass =
    variant === "primary"
      ? "primary"
      : variant === "light" || variant === "secondary"
        ? "light"
        : variant === "ghost"
          ? "ghost"
          : variant === "danger"
            ? "danger"
            : "";

  const sizeClass = size === "lg" ? "lg" : size === "sm" ? "sm" : "";

  return (
    <button
      ref={fxRef as React.RefObject<HTMLButtonElement>}
      className={cn("btn", variantClass, sizeClass, className)}
      {...props}
    >
      <span className="btn-inner">{children}</span>
      <span className="btn-fill" aria-hidden="true">
        <span className="btn-inner">{children}</span>
      </span>
    </button>
  );
}

export function ButtonLink({
  variant = "default",
  size = "default",
  className,
  children,
  href,
  ...props
}: ButtonBaseProps & React.ComponentProps<typeof Link>) {
  const fxRef = useButtonFx();

  const variantClass =
    variant === "primary"
      ? "primary"
      : variant === "light" || variant === "secondary"
        ? "light"
        : variant === "ghost"
          ? "ghost"
          : variant === "danger"
            ? "danger"
            : "";

  const sizeClass = size === "lg" ? "lg" : size === "sm" ? "sm" : "";

  return (
    <Link
      ref={fxRef as React.RefObject<HTMLAnchorElement>}
      href={href}
      className={cn("btn", variantClass, sizeClass, className)}
      {...props}
    >
      <span className="btn-inner">{children}</span>
      <span className="btn-fill" aria-hidden="true">
        <span className="btn-inner">{children}</span>
      </span>
    </Link>
  );
}
