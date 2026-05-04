import { describe, expect, it } from "vitest";
import { HANDCURATED_NAMES, listPresets, resolvePreset } from "../presets/index.js";
import { evaluateSpecs } from "../animate.js";
import type { PresetName } from "../types.js";

const ALL = listPresets();

describe("preset catalog", () => {
  it("exposes 15 hand-curated starter presets — 6 enter, 4 exit, 5 emphasis", () => {
    // Asserts the seed catalog only — `listPresets()` also includes any
    // entries authored via the Studio's random generator and ingested
    // into `presets/generated.ts`, which grows independently.
    expect(HANDCURATED_NAMES).toHaveLength(15);
    expect(HANDCURATED_NAMES.filter((n) => n.startsWith("enter/"))).toHaveLength(6);
    expect(HANDCURATED_NAMES.filter((n) => n.startsWith("exit/"))).toHaveLength(4);
    expect(HANDCURATED_NAMES.filter((n) => n.startsWith("emphasis/"))).toHaveLength(5);
  });

  it("includes 3D presets that set perspective and (where relevant) transformOrigin", () => {
    const depth = resolvePreset("enter/depth-zoom");
    expect(depth.perspective).toBeGreaterThan(0);
    const flip = resolvePreset("enter/flip-x");
    expect(flip.perspective).toBeGreaterThan(0);
    expect(flip.transformOrigin).toBeDefined();
    const coin = resolvePreset("emphasis/coin-flip");
    expect(coin.perspective).toBeGreaterThan(0);
  });

  it("each preset has a namespaced kebab-case name", () => {
    // Allow digits inside segments — generated names use a placeholder
    // form like `enter/g-001` until the rename pass assigns semantic
    // labels. Strict letters-only kebab-case still applies after rename.
    for (const name of ALL) {
      expect(name).toMatch(/^(enter|exit|emphasis)\/[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("resolvePreset returns a fully-formed Preset with ≥1 animation", () => {
    for (const name of ALL) {
      const p = resolvePreset(name);
      expect(p.name).toBe(name);
      expect(p.stagger).toBeGreaterThan(0);
      expect(p.animations.length).toBeGreaterThan(0);
    }
  });

  it("resolvePreset throws on an unknown name", () => {
    expect(() => resolvePreset("enter/bogus" as PresetName)).toThrow(/unknown preset/);
  });

  it("enter presets start invisible (opacity 0 at t=0)", () => {
    for (const name of ALL.filter((n) => n.startsWith("enter/"))) {
      const p = resolvePreset(name);
      const v = evaluateSpecs(p.animations, 0);
      expect(v.opacity).toBe(0);
    }
  });

  it("exit presets end invisible (opacity 0 at end of timeline)", () => {
    for (const name of ALL.filter((n) => n.startsWith("exit/"))) {
      const p = resolvePreset(name);
      const end = Math.max(
        ...p.animations.map((a) => (a.delay ?? 0) + (a.duration ?? 600)),
      );
      const v = evaluateSpecs(p.animations, end);
      expect(v.opacity).toBe(0);
    }
  });

  it("emphasis presets return to their rest state at the end (mod 360 for rotations)", () => {
    const rotationRest = (deg: number): number => {
      const m = ((deg % 360) + 360) % 360;
      return m > 180 ? m - 360 : m;
    };
    for (const name of ALL.filter((n) => n.startsWith("emphasis/"))) {
      const p = resolvePreset(name);
      const end = Math.max(
        ...p.animations.map((a) => (a.delay ?? 0) + (a.duration ?? 600)),
      );
      const v = evaluateSpecs(p.animations, end);
      if (v.scale !== undefined) expect(v.scale).toBeCloseTo(1, 3);
      if (v.translateX !== undefined) expect(v.translateX).toBeCloseTo(0, 3);
      if (v.rotate !== undefined) expect(rotationRest(v.rotate)).toBeCloseTo(0, 3);
      if (v.rotateY !== undefined) expect(rotationRest(v.rotateY)).toBeCloseTo(0, 3);
    }
  });
});
