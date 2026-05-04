import { defineParametricEasing } from "../define.js";

export type SpringParams = {
  /** Spring stiffness (higher = faster, more aggressive). Default 170 matches Framer Motion. */
  stiffness: number;
  /** Damping coefficient (higher = less oscillation). Default 26 is underdamped but close to critical. */
  damping: number;
  /** Object mass (higher = slower, more inertia). Default 1. */
  mass: number;
  /** Initial velocity at t=0. Default 0. */
  velocity: number;
};

const DEFAULTS: SpringParams = {
  stiffness: 170,
  damping: 26,
  mass: 1,
  velocity: 0,
};

const SETTLE_EPSILON = 1e-4;
const MAX_SETTLE_TIME = 10;
const SETTLE_SAMPLES = 1000;

function makeSpringFunction({ stiffness, damping, mass, velocity }: SpringParams) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const B = (velocity - zeta * w0 * -1) / wd;
    return (t: number) => 1 + Math.exp(-zeta * w0 * t) * (-Math.cos(wd * t) + B * Math.sin(wd * t));
  }
  if (zeta === 1) {
    const B = velocity - w0;
    return (t: number) => 1 + (-1 + B * t) * Math.exp(-w0 * t);
  }
  const r = w0 * Math.sqrt(zeta * zeta - 1);
  const lPlus = -zeta * w0 + r;
  const lMinus = -zeta * w0 - r;
  const det = lMinus - lPlus;
  const A = (-lMinus - velocity) / det;
  const B = (lPlus + velocity) / det;
  return (t: number) => 1 + A * Math.exp(lPlus * t) + B * Math.exp(lMinus * t);
}

function findSettleTime(fn: (t: number) => number): number {
  let lastUnsettled = 0;
  const step = MAX_SETTLE_TIME / SETTLE_SAMPLES;
  for (let i = 1; i <= SETTLE_SAMPLES; i++) {
    const t = i * step;
    if (Math.abs(fn(t) - 1) > SETTLE_EPSILON) lastUnsettled = t;
  }
  return Math.max(lastUnsettled + step * 2, step * 10);
}

export const spring = defineParametricEasing("spring", DEFAULTS, (params) => {
  const raw = makeSpringFunction(params);
  const settle = findSettleTime(raw);
  return (t) => raw(t * settle);
});
