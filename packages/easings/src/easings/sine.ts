import { defineEasing } from "../define.js";

const HALF_PI = Math.PI / 2;

export const sineIn = defineEasing("sine.in", (t) => 1 - Math.cos(t * HALF_PI));
export const sineOut = defineEasing("sine.out", (t) => Math.sin(t * HALF_PI));
export const sineInOut = defineEasing("sine.inOut", (t) => -(Math.cos(Math.PI * t) - 1) / 2);
