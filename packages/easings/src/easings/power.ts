import { defineEasing } from "../define.js";

const makeIn = (n: number) => (t: number) => t ** n;
const makeOut = (n: number) => (t: number) => 1 - (1 - t) ** n;
const makeInOut = (n: number) => (t: number) =>
  t < 0.5 ? 2 ** (n - 1) * t ** n : 1 - (-2 * t + 2) ** n / 2;

export const power1In = defineEasing("power1.in", makeIn(2));
export const power1Out = defineEasing("power1.out", makeOut(2));
export const power1InOut = defineEasing("power1.inOut", makeInOut(2));

export const power2In = defineEasing("power2.in", makeIn(3));
export const power2Out = defineEasing("power2.out", makeOut(3));
export const power2InOut = defineEasing("power2.inOut", makeInOut(3));

export const power3In = defineEasing("power3.in", makeIn(4));
export const power3Out = defineEasing("power3.out", makeOut(4));
export const power3InOut = defineEasing("power3.inOut", makeInOut(4));

export const power4In = defineEasing("power4.in", makeIn(5));
export const power4Out = defineEasing("power4.out", makeOut(5));
export const power4InOut = defineEasing("power4.inOut", makeInOut(5));

export const quadIn = power1In;
export const quadOut = power1Out;
export const quadInOut = power1InOut;

export const cubicIn = power2In;
export const cubicOut = power2Out;
export const cubicInOut = power2InOut;

export const quartIn = power3In;
export const quartOut = power3Out;
export const quartInOut = power3InOut;

export const quintIn = power4In;
export const quintOut = power4Out;
export const quintInOut = power4InOut;
