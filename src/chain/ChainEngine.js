// ═══════════════════════════════════════════════════════
// CHAIN ENGINE — chain modulation rendering system
// ═══════════════════════════════════════════════════════

import { params, getModById, getModIndex, MOD_SPECS }
    from '../state/params.js';
import { rs }
    from '../renderer/rendererState.js';
import { DRAW_ORDER, drawModuleInstance }
    from '../modules/index.js';

// ── Chain style definitions ─────────────────────────────
export const CHAIN_STYLES = {
    displace: { label: 'Displace', desc: 'Source brightness warps target geometry' },
    mask: { label: 'Mask', desc: 'Source brightness gates target alpha' },
    hueShift: { label: 'Hue Warp', desc: 'Source hue rotates target colors' },
    scale: { label: 'Scale', desc: 'Source energy scales target size params' },
    timeWarp: { label: 'Time Warp', desc: 'Source energy modulates target speed' },
    kaleid: { label: 'Kaleid', desc: 'Source pixel data is kaleidoscoped before target draws' },
    invert: { label: 'Invert', desc: 'Source inverts target color channels' },
    ripple: { label: 'Ripple', desc: 'Source creates wave distortion in target' }
};

// ── Link list ───────────────────────────────────────────
export const chainLinks = [
    { src: 'pinwheels', dst: 'fractureWeb', style: 'displace', strength: 0.5 },
    { src: 'fractureWeb', dst: 'kaleidoscope', style: 'kaleid', strength: 0.7 }
];

// ── Per-instance chain buffers ──────────────────────────
export const chainBuffers = {};

// ── Signal extraction ───────────────────────────────────
export function extractSignal(buf) {
    buf.loadPixels();
    const px = buf.pixels;
    const n = px.length / 4;
    const step = Math.max(1, Math.floor(n / 400));
    let totR = 0, totG = 0, totB = 0, count = 0, bright = 0, hueSum = 0;
    for (let i = 0; i < n; i += step) {
        const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
        const bri = (r + g + b) / 765;
        totR += r; totG += g; totB += b; bright += bri; count++;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
        if (d > 10) {
            let h;
            if (mx === r) h = (g - b) / d;
            else if (mx === g) h = 2 + (b - r) / d;
            else h = 4 + (r - g) / d;
            h = ((h * 60) % 360 + 360) % 360;
            hueSum += h;
        }
    }
    return {
        brightness: count > 0 ? bright / count : 0,
        energy: count > 0 ? (totR + totG + totB) / (count * 765) : 0,
        avgHue: count > 0 ? hueSum / count : 0,
        r: count > 0 ? totR / (count * 255) : 0,
        g: count > 0 ? totG / (count * 255) : 0,
        b_: count > 0 ? totB / (count * 255) : 0
    };
}

// ── Chain modulation ────────────────────────────────────
export function applyChainMod(dstId, srcSig, style, strength) {
    const base = getModById(dstId); if (!base) return null;
    const mod = JSON.parse(JSON.stringify(base));
    const s = strength, bri = srcSig.brightness, en = srcSig.energy, hu = srcSig.avgHue;

    switch (style) {
        case 'displace':
            if (mod.scale !== undefined) mod.scale = base.scale * (1 + bri * s * 4);
            if (mod.warp !== undefined) mod.warp = base.warp * (1 + bri * s * 6);
            if (mod.spreadAngle !== undefined) mod.spreadAngle = base.spreadAngle * (1 + bri * s * 3);
            if (mod.noiseWarp !== undefined) mod.noiseWarp = Math.min(1, base.noiseWarp + bri * s * .8);
            if (mod.orbitDrift !== undefined) mod.orbitDrift = Math.min(1, base.orbitDrift + bri * s);
            if (mod.bladeSkew !== undefined) mod.bladeSkew = Math.min(1, bri * s);
            break;
        case 'mask':
            mod.blend = base.blend * Math.max(0.05, 1 - en * s);
            if (mod.fillOpacity !== undefined) mod.fillOpacity = base.fillOpacity * (1 - en * s * .5);
            break;
        case 'hueShift': {
            const shift = hu * s;
            mod.hueRange = { start: (base.hueRange.start + shift) % 360, end: (base.hueRange.end + shift) % 360 };
            if (mod.colorShift !== undefined) mod.colorShift = (base.colorShift + hu * s * .5) % 180;
            break;
        }
        case 'scale': {
            const sf = 1 + en * s * 2;
            if (mod.wheelCount !== undefined) mod.wheelCount = Math.min(12, Math.max(1, Math.round(base.wheelCount * sf)));
            if (mod.ringN !== undefined) mod.ringN = Math.min(30, Math.max(3, Math.round(base.ringN * sf)));
            if (mod.depth !== undefined) mod.depth = Math.min(40, Math.max(4, Math.round(base.depth * sf)));
            if (mod.segments !== undefined) mod.segments = Math.min(24, Math.max(2, Math.round(base.segments * sf)));
            if (mod.gridSize !== undefined) mod.gridSize = Math.max(5, Math.round(base.gridSize / sf));
            if (mod.ringCount !== undefined) mod.ringCount = Math.min(14, Math.max(2, Math.round(base.ringCount * sf)));
            break;
        }
        case 'timeWarp': {
            const tf = 1 + en * s * 4;
            if (mod.phaseSpeed !== undefined) mod.phaseSpeed = base.phaseSpeed * tf;
            if (mod.traceSpeed !== undefined) mod.traceSpeed = base.traceSpeed * tf;
            if (mod.morphSpeed !== undefined) mod.morphSpeed = base.morphSpeed * tf;
            if (mod.webSpin !== undefined) mod.webSpin = Math.min(1, base.webSpin * tf);
            if (mod.rotSpeed !== undefined) mod.rotSpeed = Math.min(.05, base.rotSpeed * tf);
            if (mod.turbulence !== undefined) mod.turbulence = Math.min(2, base.turbulence * tf);
            if (mod.twist !== undefined) mod.twist = Math.min(4, base.twist * tf);
            break;
        }
        case 'kaleid': {
            const ks = Math.max(2, Math.round(2 + en * s * 10));
            if (mod.segments !== undefined) mod.segments = Math.min(24, ks);
            if (mod.bladeCount !== undefined) mod.bladeCount = Math.min(20, Math.max(3, Math.round(base.bladeCount * (1 + en * s))));
            if (mod.cornerBase !== undefined) mod.cornerBase = Math.min(12, Math.max(3, ks));
            if (mod.ringCount !== undefined) mod.ringCount = Math.min(14, Math.max(2, Math.round(base.ringCount * (1 + en * s * .5))));
            break;
        }
        case 'invert':
            mod.hueRange = { start: (base.hueRange.start + 180) % 360, end: (base.hueRange.end + 180) % 360 };
            if (mod.altColoring !== undefined) mod.altColoring = en > 0.3 ? 1 - base.altColoring : base.altColoring;
            break;
        case 'ripple': {
            const rp = bri * s;
            if (mod.noiseWarp !== undefined) mod.noiseWarp = Math.min(1, base.noiseWarp + rp * .6);
            if (mod.warp !== undefined) mod.warp = Math.min(4, base.warp * (1 + rp * 3));
            if (mod.thickness !== undefined) mod.thickness = Math.min(5, base.thickness * (1 + rp * 2));
            if (mod.spreadAngle !== undefined) mod.spreadAngle = Math.min(2, base.spreadAngle * (1 + rp * 2));
            if (mod.turbulence !== undefined) mod.turbulence = Math.min(2, base.turbulence + rp);
            break;
        }
    }
    return mod;
}

// Draw one module, optionally with param overrides
function drawModule(instId, g, am, bm, mm, overrideParams) {
    const m = getModById(instId); if (!m) return;
    if (overrideParams) {
        const saved = JSON.parse(JSON.stringify(m));
        Object.keys(overrideParams).forEach(k => { m[k] = overrideParams[k]; });
        drawModuleInstance(m, g, am, bm, mm);
        const idx = getModIndex(instId);
        if (idx >= 0) params.moduleList[idx] = saved;
    } else {
        drawModuleInstance(m, g, am, bm, mm);
    }
}

// ── Chain draw mode ─────────────────────────────────────
export function drawChainMode(am, bm, mm) {
    const activeIds = params.moduleList.filter(m => m.on).map(m => m.id);
    const pg = rs.pg;

    // Ensure per-instance chain buffers
    activeIds.forEach(id => {
        if (!chainBuffers[id] || chainBuffers[id].width !== width) {
            chainBuffers[id] = createGraphics(width, height);
            chainBuffers[id].colorMode(HSB, 360, 100, 100, 100);
        }
    });

    const isSource = {}, isDest = {};
    chainLinks.forEach(lnk => { isSource[lnk.src] = true; isDest[lnk.dst] = true; });

    // Render sources into their buffers
    activeIds.forEach(id => {
        if (!isSource[id]) return;
        chainBuffers[id].colorMode(RGB); chainBuffers[id].background(0, 0, 0, 0);
        chainBuffers[id].colorMode(HSB, 360, 100, 100, 100);
        drawModuleInstance(getModById(id), chainBuffers[id], am, bm, mm);
    });

    // Extract signals and compute overrides
    const dstOverrides = {};
    chainLinks.forEach(lnk => {
        const srcM = getModById(lnk.src), dstM = getModById(lnk.dst);
        if (!srcM || !dstM || !srcM.on || !dstM.on || !chainBuffers[lnk.src]) return;
        const sig = extractSignal(chainBuffers[lnk.src]);
        const modP = applyChainMod(lnk.dst, sig, lnk.style, lnk.strength);
        if (modP) dstOverrides[lnk.dst] = modP;
    });

    // Draw all instances to pg
    pg.colorMode(RGB);
    if (params.persist > .01) {
        pg.fill(12, 12, 11, 255 * (1 - params.persist)); pg.noStroke(); pg.rect(0, 0, width, height);
    } else {
        pg.background(12, 12, 11);
    }
    pg.colorMode(HSB, 360, 100, 100, 100);

    DRAW_ORDER.forEach(type => {
        params.moduleList.forEach(m => {
            if (m.type !== type || !m.on) return;
            const id = m.id;
            if (isSource[id] && !isDest[id]) {
                pg.push(); pg.drawingContext.globalAlpha = m.blend;
                pg.image(chainBuffers[id], 0, 0);
                pg.drawingContext.globalAlpha = 1; pg.pop();
            } else {
                drawModule(id, pg, am, bm, mm, dstOverrides[id] || null);
            }
        });
    });
}
