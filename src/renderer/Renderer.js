// ═══════════════════════════════════════════════════════
// RENDERER — p5 setup / draw loop, system init
// ═══════════════════════════════════════════════════════

import { params, defParams, makeModInstance, nextModId, rebuildModRegistry, getModById }
    from '../state/params.js';
import { rs } from './rendererState.js';
import { audioState, getAudio, av, abass, amid, ahi, invalidateFFTCanvas }
    from '../audio/AudioEngine.js';
import { AR } from '../audio/AudioMapping.js';
import { Pinwheel, Particle, wheelsMap, ptclsMap, DRAW_ORDER, drawModuleInstance }
    from '../modules/index.js';

import { buildModUI } from '../ui/ModuleUI.js';
import { buildHuePicker } from '../ui/HuePicker.js';
import { renderAmapUI } from '../audio/AudioMapping.js';
import { drawChainMode } from '../chain/ChainEngine.js';

// ── Pre-baked vignette layer (performance improvement) ─
let vignetteLayer = null;
function buildVignette(w, h) {
    vignetteLayer = createGraphics(w, h);
    vignetteLayer.colorMode(RGB);
    vignetteLayer.clear();
    for (let rv = w * .49; rv > w * .3; rv -= 5) {
        vignetteLayer.stroke(10, 10, 9, map(rv, w * .3, w * .49, 130, 0));
        vignetteLayer.noFill();
        vignetteLayer.ellipse(w / 2, h / 2, rv * 2, rv * 2);
    }
}

// ── p5 lifecycle ────────────────────────────────────────
export function setup() {
    const sz = min(windowWidth - 330, windowHeight - 28, 820);
    const cv = createCanvas(sz, sz); cv.parent('cc');
    colorMode(HSB, 360, 100, 100, 100);
    rs.pg = createGraphics(sz, sz);
    rs.pg.colorMode(HSB, 360, 100, 100, 100);
    buildVignette(sz, sz);
    invalidateFFTCanvas(); // reset cached FFT canvas context
    buildModUI();
    buildMappingLabels();
    doInitSys();
    const ghp = document.getElementById('globalHuePicker');
    if (ghp) buildHuePicker(ghp, 'Global Hue Range', params.hueRange, (s, e) => { params.hueRange.start = s; params.hueRange.end = e; });
    renderAmapUI();
}

export function draw() {
    getAudio();
    const am = av(), bm = abass(), mm = amid();
    rs.globalHue = (rs.globalHue + params.hueSpeed * (1 + AR('vol') * .5)) % 360;
    rs.fc++;
    const pg = rs.pg;

    if (window._cv_renderMode === 'chain') {
        drawChainMode(am, bm, mm);
        pg.image(vignetteLayer, 0, 0);
        image(pg, 0, 0);
        return;
    }

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
            drawModuleInstance(m, pg, am, bm, mm);
        });
    });

    pg.image(vignetteLayer, 0, 0);
    image(pg, 0, 0);
}

export function windowResized() {
    // Manual resize mode — user controls canvas size via drag handles
}

// ── System init ─────────────────────────────────────────
export function doInitSys() {
    randomSeed(params.seed); noiseSeed(params.seed);
    // Clear pools
    Object.keys(wheelsMap).forEach(k => delete wheelsMap[k]);
    Object.keys(ptclsMap).forEach(k => delete ptclsMap[k]);
    rs.globalHue = 0; rs.fc = 0;
    const sz = width || 600;

    params.moduleList.forEach(m => {
        if (m.type === 'pinwheels') {
            const wArr = [], n = m.wheelCount;
            if (n === 1) {
                wArr.push(new Pinwheel(sz / 2, sz / 2, sz * .42, 0, 1, 0, m.id));
            } else {
                wArr.push(new Pinwheel(sz / 2, sz / 2, sz * .17, random(TWO_PI), 1, random(360), m.id));
                let placed = 0, ring = 1;
                while (placed < n - 1) {
                    const inR = min(n - 1 - placed, ring * 4 + 2);
                    const oR = sz * (.22 + ring * .14);
                    const rR = sz * (.09 + .03 / ring);
                    for (let i = 0; i < inR && placed < n - 1; i++) {
                        const a = (TWO_PI * i / inR) + random(-.12, .12);
                        const dir = (m.counterRotate && placed % 2) ? -1 : 1;
                        wArr.push(new Pinwheel(sz / 2 + cos(a) * oR, sz / 2 + sin(a) * oR, rR, random(TWO_PI), dir, random(360), m.id));
                        placed++;
                    }
                    ring++;
                }
            }
            wheelsMap[m.id] = wArr;
        }
        if (m.type === 'particleStorm') {
            const pArr = [];
            for (let j = 0; j < m.count; j++) pArr.push(new Particle(m.id));
            ptclsMap[m.id] = pArr;
        }
    });
}

// ── UI handlers ──────────────────────────────────────────
export function gp(name, value) {
    params[name] = value;
    const el = document.getElementById(name + '-v');
    if (el) el.textContent = fmtV(value);
}

export function doUpdateSeedDisp() {
    const el = document.getElementById('seedIn'); if (el) el.value = params.seed;
}
export function doUpdateSeed() {
    const v = parseInt(document.getElementById('seedIn').value);
    if (v > 0) { params.seed = v; doInitSys(); } else doUpdateSeedDisp();
}
export function doPrevSeed() { params.seed = Math.max(1, params.seed - 1); doUpdateSeedDisp(); doInitSys(); }
export function doNextSeed() { params.seed++; doUpdateSeedDisp(); doInitSys(); }
export function doRndSeed() { params.seed = Math.floor(Math.random() * 999999) + 1; doUpdateSeedDisp(); doInitSys(); }

export function doResetAll() {
    Object.assign(params, JSON.parse(JSON.stringify(defParams)));
    rebuildModRegistry();
    ['spinSpeed', 'audioReact', 'hueSpeed', 'chaos', 'persist', 'brightness', 'saturation'].forEach(k => {
        const el = document.getElementById(k); if (el) el.value = params[k];
        const vel = document.getElementById(k + '-v'); if (vel) vel.textContent = fmtV(params[k]);
    });
    doUpdateSeedDisp(); buildModUI(); doInitSys();
    const ghp = document.getElementById('globalHuePicker');
    if (ghp) buildHuePicker(ghp, 'Global Hue Range', params.hueRange, (s, e) => { params.hueRange.start = s; params.hueRange.end = e; });
}
export function doSave() { saveCanvas('vertigo-' + params.seed, 'png'); }

export function toggleSpectrum() {
    const overlay = document.getElementById('meterOverlay');
    const btn = document.getElementById('specBtn');
    if (!overlay) return;
    const hidden = overlay.classList.toggle('hidden');
    if (btn) btn.textContent = '📊 Spectrum: ' + (hidden ? 'Off' : 'On');
}

/** Helper (re-exported for main.js convenience imports) */
export { rebuildModRegistry };
import { fmtV } from '../state/params.js';

// Build AMAP source-slot labels (called once on setup)
function buildMappingLabels() {
    // Nothing to do — labels are rendered by renderAmapUI
}
