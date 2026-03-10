// ═══════════════════════════════════════════════════════
// RENDERER STATE
// Shared mutable state & helpers imported by all draw
// modules. Lives in its own file to keep draw modules
// free from circular dependencies with Renderer.js.
// ═══════════════════════════════════════════════════════

import { params, getModById, getFirstModOfType } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

// ── Mutable render state ────────────────────────────────
export const rs = {
    /** Currently-drawing module instance (set per-call in drawModuleInstance) */
    activeModInst: null,
    /** Frame counter incremented each draw() tick */
    fc: 0,
    /** Global hue, 0–360 */
    globalHue: 0,
    /** Off-screen graphics buffer for kaleidoscope / chain modes */
    pg: null
};

// Expose params hook used by AudioMapping (avoids circular dep there)
if (typeof window !== 'undefined') window._cv_params = { getModById };

// ── Per-frame global-parameter helpers ─────────────────

/** Clamp brightness by global brightness param (0–100 → scale). */
export function BS(v) {
    return Math.min(100, v * params.brightness);
}

/** Clamp saturation by global saturation param. */
export function SS(v) {
    return Math.min(100, v * params.saturation);
}

/**
 * Map a hue h (0–360) linearly into [start,end] range with wrapping.
 */
export function mapHue(h, start, end) {
    const range = end - start;
    if (range === 0) return start;
    const r = range < 0 ? (360 + range) : range;
    return (start + ((h / 360) * r) + 360) % 360;
}

/** Apply global hue range to raw hue h. */
export function GH(h) {
    return mapHue(h, params.hueRange.start, params.hueRange.end);
}

/** Apply global hue range + per-module hue range to raw hue h. */
export function MH(id, h) {
    const m = getModById(id);
    if (!m || !m.hueRange) return GH(h);
    return mapHue(GH(h), m.hueRange.start, m.hueRange.end);
}

/**
 * CMP(type) — "current module params"
 * Returns the active-module instance if one is set, otherwise falls back
 * to the first enabled module of the given type, or an empty object.
 */
export function CMP(type) {
    return rs.activeModInst || getFirstModOfType(type) || {};
}
