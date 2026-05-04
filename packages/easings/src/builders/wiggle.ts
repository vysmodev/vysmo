import { defineParametricEasing } from "../define.js";

export type WiggleType = "easeOut" | "easeInOut" | "anticipate" | "uniform";

export type WiggleParams = {
  /** Number of back-and-forth oscillations across [0, 1]. Default 10. */
  wiggles: number;
  /** Envelope shape. */
  type: WiggleType;
};

const DEFAULTS: WiggleParams = {
  wiggles: 10,
  type: "easeOut",
};

const TAU = Math.PI * 2;

function envelope(type: WiggleType, t: number): number {
  switch (type) {
    case "easeOut":
      return 1 - t;
    case "easeInOut":
      return 4 * t * (1 - t);
    case "anticipate":
      return t < 0.5 ? 2 * t : 2 - 2 * t;
    case "uniform":
      return 1;
  }
}

export const wiggle = defineParametricEasing(
  "wiggle",
  DEFAULTS,
  ({ wiggles, type }) => {
    const n = Math.max(1, wiggles);
    return (t: number) => envelope(type, t) * Math.sin(t * TAU * n);
  },
  { exactEndpoints: false },
);
