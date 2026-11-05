"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMotionTier } from "@/components/motion/MotionProvider";

// Keep in step with --dur-drawer on .terminal-drawer in app/globals.css.
const EXIT_MS = { full: 280, lite: 160, off: 0 };
const DRAG_SLOP_PX = 6;
const SNAP_RATIO = 0.4; // how far a drag must travel to change the drawer's state
const FLICK_PX_PER_MS = 0.5;

type DragMode = "close" | "pull";

interface Drag {
  mode: DragMode;
  startX: number;
  lastX: number;
  lastT: number;
  velocity: number;
  offset: number;
  width: number;
  moved: boolean;
}

// Slide state for the terminal drawer. While a pointer is down the panel is
// moved straight through its style, so dragging never re-renders the terminal.
export function useTerminalDrawer(
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  const tier = useMotionTier();
  const panelRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const justDraggedRef = useRef(false);

  const [pulling, setPulling] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Closing keeps the panel mounted long enough to slide out.
  if (open !== wasOpen) {
    setWasOpen(open);
    setExiting(!open);
  }

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => setExiting(false), EXIT_MS[tier]);
    return () => clearTimeout(timer);
  }, [exiting, tier]);

  const paint = (drag: Drag) => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;
    panel.dataset.dragging = "";
    backdrop.dataset.dragging = "";
    panel.style.transform = `translate3d(${drag.offset}px, 0, 0)`;
    backdrop.style.opacity = String(1 + drag.offset / drag.width);
  };

  const release = () => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;
    delete panel.dataset.dragging;
    delete backdrop.dataset.dragging;
    panel.style.transform = "";
    backdrop.style.opacity = "";
  };

  // A pull from the tab mounts the panel partway through the gesture.
  useLayoutEffect(() => {
    if (pulling && dragRef.current) paint(dragRef.current);
  }, [pulling]);

  const start = (mode: DragMode, e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    if (mode === "close" && (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const width =
      panelRef.current?.offsetWidth ?? Math.min(window.innerWidth * 0.92, 480);
    dragRef.current = {
      mode,
      startX: e.clientX,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      offset: mode === "close" ? 0 : -width,
      width,
      moved: false,
    };
  };

  const move = (e: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < DRAG_SLOP_PX) return;
    drag.moved = true;
    drag.velocity =
      (e.clientX - drag.lastX) / Math.max(1, e.timeStamp - drag.lastT);
    drag.lastX = e.clientX;
    drag.lastT = e.timeStamp;
    const from = drag.mode === "close" ? 0 : -drag.width;
    drag.offset = Math.min(0, Math.max(-drag.width, from + dx));
    if (panelRef.current) paint(drag);
    else setPulling(true);
  };

  const end = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.moved) return;
    justDraggedRef.current = true;
    release();

    const travelled =
      drag.mode === "close"
        ? -drag.offset / drag.width
        : 1 + drag.offset / drag.width;
    const towards = drag.mode === "close" ? -drag.velocity : drag.velocity;
    const flipped =
      towards > FLICK_PX_PER_MS ||
      (towards >= -FLICK_PX_PER_MS && travelled > SNAP_RATIO);

    if (drag.mode === "close") {
      if (flipped) setOpen(false);
      return;
    }
    setPulling(false);
    if (flipped) setOpen(true);
    else setExiting(true);
  };

  return {
    tier,
    panelRef,
    backdropRef,
    pulling,
    rendered: open || pulling || exiting,
    leaving: !open && !pulling,
    tabProps: {
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => start("pull", e),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
      // Enter/Space and a plain tap land here; the end of a drag must not.
      onClick: () => {
        if (justDraggedRef.current) justDraggedRef.current = false;
        else setOpen(true);
      },
    },
    closeDragProps: {
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => start("close", e),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
