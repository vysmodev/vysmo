import { defineParametricEasing } from "../define.js";

export type StepPosition = "start" | "end" | "none";

type StepsParams = { count: number; position: StepPosition };

const DEFAULTS: StepsParams = { count: 5, position: "end" };

export const steps = defineParametricEasing(
  "steps",
  DEFAULTS,
  ({ count, position }) => {
    const n = Math.max(1, Math.floor(count));
    switch (position) {
      case "end":
        return (t) => Math.min(Math.floor(t * n), n) / n;
      case "start":
        return (t) => Math.min(Math.floor(t * n) + 1, n) / n;
      case "none":
        if (n === 1) return () => 0;
        return (t) => Math.min(Math.floor(t * n), n - 1) / (n - 1);
    }
  },
  { exactEndpoints: false },
);
