// Rigid-body physics for the pixel critters, shared by the page and terminal
// canvases. Pure maths: no DOM, no React, no rendering.
//
// Units are css px, seconds and radians. `lift` is height above the critter's
// ground line, so screen y = y - lift. `rot` is clockwise-positive, matching
// canvas rotate(). Each critter is a square box, HALF px from centre to edge.

export type CritterState = "walk" | "idle" | "sleep" | "held" | "air" | "down";

export interface CritterBody {
  x: number;
  y: number;
  lift: number;
  vx: number;
  vy: number;
  liftV: number;
  rot: number;
  rotV: number;
  squash: number;
  squashV: number;
  holdX: number;
  holdLift: number;
  mass: number;
  state: CritterState;
}

export interface Bounds {
  left: number;
  right: number;
  /** Highest screen y the feet may reach. */
  top: number;
}

export interface WorldOptions<T extends CritterBody> {
  /** Critters hit each other. Off on the lite motion tier. */
  collisions: boolean;
  /** Came to rest. `upright` is false when it ended up on its side or head. */
  onSettle: (c: T, upright: boolean) => void;
  /** Hit the floor hard enough to bounce. */
  onImpact?: (c: T, speed: number) => void;
  /** Was standing, and another critter just knocked it off its feet. */
  onKnock?: (c: T, speed: number) => void;
}

export const HALF = 21;
export const GRAVITY = 1900;
export const MAX_LAUNCH = 3200;

const STEP = 1 / 120;
const QUARTER = Math.PI / 2;

// Quadratic air drag. Terminal velocity = sqrt(GRAVITY / AIR_DRAG), about 2180.
const AIR_DRAG = 0.0004;
const SPIN_DRAG = 0.4;

// Moment of inertia per unit mass for a square: (2 * HALF)^2 / 6.
const INERTIA = (2 * HALF * 2 * HALF) / 6;
const FRICTION = 0.5;
const FLOOR_BOUNCE = 0.42;
const WALL_BOUNCE = 0.6;
const CEILING_BOUNCE = 0.5;
const BODY_BOUNCE = 0.55;
// Below this a contact is dead: no bounce, which is what lets critters settle.
const REST_SPEED = 120;

// Gravity's pull on a box balancing on a corner: g * r / I about that corner.
const TIP_TORQUE = 48;
// Spin lost each time a tumbling box slaps down onto a flat face.
const FLAT_SLAP = 0.55;

const JELLY_STIFFNESS = 320;
const JELLY_DAMPING = 14;
const JELLY_KICK = 0.012;
const JELLY_MAX = 1.2;

const HOLD_STIFFNESS = 1400;
const HOLD_DAMPING = 60;
const SWING_MAX_ACCEL = 6000;
const PENDULUM_LENGTH = 40;
const PENDULUM_DAMPING = 3;
const PENDULUM_MAX = 1.3;

const COLLIDE_RADIUS = 19;
const KNOCK_SPEED = 90;
const WALK_ACCEL = 220;

const STALE_MS = 70;
const SAMPLE_MS = 120;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const wrapAngle = (a: number) =>
  a - 2 * Math.PI * Math.round(a / (2 * Math.PI));

/** How far the feet sit above the floor when a corner of the box touches it. */
const support = (rot: number) =>
  HALF * (Math.abs(Math.sin(rot)) + Math.abs(Math.cos(rot)) - 1);

/**
 * Impulse against a fixed surface, with Coulomb friction at the contact so spin
 * and sliding trade off. (nx, ny) points out of the surface in screen space.
 * Returns the approach speed, or 0 if the body was already moving away.
 */
function bounce(
  b: CritterBody,
  nx: number,
  ny: number,
  restitution: number,
): number {
  const vy = -b.liftV;
  const approach = -(b.vx * nx + vy * ny);
  if (approach <= 0) return 0;

  const tx = -ny;
  const ty = nx;
  const struck = approach >= REST_SPEED;
  const normal = (1 + (struck ? restitution : 0)) * approach;
  const limit = FRICTION * normal;
  const slide = b.vx * tx + vy * ty;

  // Only real impacts trade spin for sliding. In resting contact a box pivots on
  // its corner without slipping, so friction there must leave the spin alone or
  // it cancels the tipping torque and the box freezes balanced on a corner.
  const tangent = struck
    ? clamp(
        -(slide - b.rotV * HALF) / (1 + (HALF * HALF) / INERTIA),
        -limit,
        limit,
      )
    : clamp(-slide, -limit, limit);

  b.vx += normal * nx + tangent * tx;
  b.liftV -= normal * ny + tangent * ty;
  if (struck) b.rotV -= (HALF * tangent) / INERTIA;
  return approach;
}

function stepFree(b: CritterBody, h: number, bounds: Bounds) {
  const drag = Math.min(0.5, AIR_DRAG * Math.hypot(b.vx, b.liftV) * h);
  b.vx -= b.vx * drag;
  b.liftV -= b.liftV * drag + GRAVITY * h;
  b.rotV -= b.rotV * SPIN_DRAG * h;

  const rotBefore = b.rot;
  b.x += b.vx * h;
  b.lift += b.liftV * h;
  b.rot += b.rotV * h;

  if (b.x < bounds.left) {
    b.x = bounds.left;
    bounce(b, 1, 0, WALL_BOUNCE);
  } else if (b.x > bounds.right) {
    b.x = bounds.right;
    bounce(b, -1, 0, WALL_BOUNCE);
  }

  const ceiling = Math.max(0, b.y - bounds.top);
  if (b.lift > ceiling) {
    b.lift = ceiling;
    bounce(b, 0, 1, CEILING_BOUNCE);
  }

  const floor = support(b.rot);
  if (b.lift > floor) return { impact: 0, settled: false };

  b.lift = floor;
  const approach = bounce(b, 0, -1, FLOOR_BOUNCE);
  const impact = approach >= REST_SPEED ? approach : 0;
  b.squashV += impact * JELLY_KICK;

  // On the floor, gravity tips the box onto its nearest flat face.
  const flat = Math.round(b.rot / QUARTER) * QUARTER;
  const tilt = b.rot - flat;
  b.rotV -=
    Math.sign(tilt) * TIP_TORQUE * Math.sin(Math.PI / 4 - Math.abs(tilt)) * h;
  if ((rotBefore - flat) * tilt < 0) b.rotV *= FLAT_SLAP;
  if (Math.abs(tilt) < 0.04 && Math.abs(b.rotV) < 1) {
    b.rot = flat;
    b.rotV = 0;
  }

  const settled =
    b.rot === flat && Math.abs(b.vx) < 8 && Math.abs(b.liftV) < REST_SPEED;
  return { impact, settled };
}

/** Held critters chase the pointer on a stiff spring and swing like a pendulum. */
function stepHeld(b: CritterBody, h: number, bounds: Bounds) {
  const ax = HOLD_STIFFNESS * (b.holdX - b.x) - HOLD_DAMPING * b.vx;
  const ay = HOLD_STIFFNESS * (b.holdLift - b.lift) - HOLD_DAMPING * b.liftV;
  b.vx += ax * h;
  b.liftV += ay * h;
  b.x = clamp(b.x + b.vx * h, bounds.left, bounds.right);
  b.lift += b.liftV * h;
  if (b.lift < 0) {
    b.lift = 0;
    b.liftV = 0;
  }

  // A big pointer jump is a huge spike in ax; cap what the swing sees of it.
  const shove = clamp(ax, -SWING_MAX_ACCEL, SWING_MAX_ACCEL);
  b.rot = wrapAngle(b.rot);
  b.rotV +=
    ((-GRAVITY * Math.sin(b.rot) + shove * Math.cos(b.rot)) / PENDULUM_LENGTH -
      PENDULUM_DAMPING * b.rotV) *
    h;
  b.rot += b.rotV * h;
  if (Math.abs(b.rot) > PENDULUM_MAX) {
    b.rot = Math.sign(b.rot) * PENDULUM_MAX;
    b.rotV = 0;
  }
}

function stepJelly(b: CritterBody, h: number) {
  b.squashV += (-JELLY_STIFFNESS * b.squash - JELLY_DAMPING * b.squashV) * h;
  b.squash = clamp(b.squash + b.squashV * h, -JELLY_MAX, JELLY_MAX);
}

const isMobile = (b: CritterBody) => b.state === "air" || b.state === "held";

/**
 * Circle-circle impulse between two critters, in screen space so that what looks
 * like a hit is a hit. Held critters have infinite mass: you can bat others with
 * them. Standing critters only move if the hit is hard enough to knock them.
 */
function collidePair<T extends CritterBody>(
  a: T,
  b: T,
  onKnock: (c: T, speed: number) => void,
) {
  if (!isMobile(a) && !isMobile(b)) return;

  let dx = b.x - a.x;
  // Screen-space offset from a to b; y grows downwards.
  const dy = a.lift - b.lift + (b.y - a.y);
  const reach = COLLIDE_RADIUS * 2;
  if (Math.abs(dx) >= reach || Math.abs(dy) >= reach) return;
  // Dead-centre stacks would have no sideways normal and never slide apart.
  if (Math.abs(dx) < 1) dx = a.x <= b.x ? 1 : -1;
  const dist = Math.hypot(dx, dy);
  if (dist >= reach) return;

  const nx = dx / dist;
  const ny = dy / dist;
  const closing = -((b.vx - a.vx) * nx + (a.liftV - b.liftV) * ny);

  const knocks = closing >= KNOCK_SPEED;
  const weight = (c: T) =>
    c.state === "held" || (!isMobile(c) && !knocks) ? 0 : 1 / c.mass;
  const wa = weight(a);
  const wb = weight(b);
  const total = wa + wb;
  if (total === 0) return;

  if (closing > 0) {
    const e = closing < REST_SPEED ? 0 : BODY_BOUNCE;
    const normal = ((1 + e) * closing) / total;

    const tx = -ny;
    const ty = nx;
    const slip =
      (b.vx - a.vx) * tx +
      (a.liftV - b.liftV) * ty -
      HALF * ((wa ? a.rotV : 0) + (wb ? b.rotV : 0));
    const spinShare = (HALF * HALF * total) / INERTIA;
    const limit = FRICTION * normal;
    const tangent = clamp(-slip / (total + spinShare), -limit, limit);

    const px = normal * nx + tangent * tx;
    const py = normal * ny + tangent * ty;
    a.vx -= px * wa;
    a.liftV += py * wa;
    a.rotV -= (HALF * tangent * wa) / INERTIA;
    b.vx += px * wb;
    b.liftV -= py * wb;
    b.rotV -= (HALF * tangent * wb) / INERTIA;

    if (knocks) {
      for (const c of [a, b]) {
        if (isMobile(c)) continue;
        c.state = "air";
        c.vy = 0;
        onKnock(c, closing);
      }
    }
  }

  const overlap = (reach - dist) / total;
  a.x -= nx * overlap * wa;
  b.x += nx * overlap * wb;
  if (isMobile(a)) a.lift = Math.max(0, a.lift + ny * overlap * wa);
  if (isMobile(b)) b.lift = Math.max(0, b.lift - ny * overlap * wb);
}

export function createCritterWorld<T extends CritterBody>(
  options: WorldOptions<T>,
) {
  const { collisions, onSettle, onImpact, onKnock } = options;
  const knock = onKnock ?? (() => {});
  let pending = 0;

  return {
    /** Runs fixed-size steps so behaviour doesn't change with frame rate. */
    step(bodies: T[], dt: number, bounds: Bounds) {
      pending += dt;
      while (pending >= STEP) {
        pending -= STEP;
        for (const b of bodies) {
          stepJelly(b, STEP);
          if (b.state === "held") {
            stepHeld(b, STEP, bounds);
          } else if (b.state === "air") {
            const { impact, settled } = stepFree(b, STEP, bounds);
            if (impact > 0) onImpact?.(b, impact);
            if (settled) {
              b.vx = 0;
              b.liftV = 0;
              b.rot = wrapAngle(b.rot);
              onSettle(b, Math.abs(b.rot) < 0.1);
            }
          }
        }
        if (!collisions) continue;
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            collidePair(bodies[i]!, bodies[j]!, knock);
          }
        }
      }
    },
  };
}

/** Jumps with exactly the spin needed to land on its feet. */
export function hop(b: CritterBody, liftV: number) {
  b.state = "air";
  b.vy = 0;
  b.liftV = liftV;
  b.rot = wrapAngle(b.rot);
  b.rotV = (-b.rot * GRAVITY) / (2 * liftV);
}

/** Accelerates a grounded critter towards a velocity, then moves it. */
export function steer(
  b: CritterBody,
  targetVx: number,
  targetVy: number,
  dt: number,
) {
  const dvx = targetVx - b.vx;
  const dvy = targetVy - b.vy;
  const change = Math.hypot(dvx, dvy);
  const scale = change > 0 ? Math.min(1, (WALK_ACCEL * dt) / change) : 0;
  b.vx += dvx * scale;
  b.vy += dvy * scale;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
}

/**
 * Throw velocity from recent pointer samples. A pointer that stopped before the
 * release throws nothing, so holding still and letting go just drops the critter.
 */
export function releaseVelocity(
  samples: { x: number; y: number; t: number }[],
  now: number,
) {
  const recent = samples.filter((s) => now - s.t <= SAMPLE_MS);
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (!first || !last || first === last || now - last.t > STALE_MS) {
    return { vx: 0, liftV: 0 };
  }
  const secs = Math.max(0.015, (last.t - first.t) / 1000);
  return {
    vx: clamp((last.x - first.x) / secs, -MAX_LAUNCH, MAX_LAUNCH),
    liftV: clamp((first.y - last.y) / secs, -MAX_LAUNCH, MAX_LAUNCH),
  };
}
