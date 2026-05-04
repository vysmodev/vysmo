import { defineEasing } from "../define.js";

export const linear = defineEasing("linear", (t) => t);
export const none = linear;
