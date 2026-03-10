// ═══════════════════════════════════════════════════════
// MODULES BARREL — draw dispatch + instance pools
// ═══════════════════════════════════════════════════════

import { rs } from '../renderer/rendererState.js';
import { Pinwheel } from './Pinwheel.js';
import { Particle } from './Particle.js';

import { drawFractureWeb } from './drawFractureWeb.js';
import { drawLissajous } from './drawLissajous.js';
import { drawSpirograph } from './drawSpirograph.js';
import { drawKaleidoscope } from './drawKaleidoscope.js';
import { drawMoireGrid } from './drawMoireGrid.js';
import { drawPulseRings } from './drawPulseRings.js';
import { drawChaosTunnel } from './drawChaosTunnel.js';
import { drawNoiseField } from './drawNoiseField.js';
import { drawPlasmaWave } from './drawPlasmaWave.js';
import { drawCrystalWeb } from './drawCrystalWeb.js';
import { drawBloomPetals } from './drawBloomPetals.js';
import { drawLightningArc } from './drawLightningArc.js';
import { drawOrbitWeb } from './drawOrbitWeb.js';

export { Pinwheel, Particle };

// ── Instance pools ──────────────────────────────────────
export const wheelsMap = {}; // id → Pinwheel[]
export const ptclsMap = {}; // id → Particle[]

// ── Draw order (single constant — no duplication) ──────
// Lower-index types render to the background,
// higher-index types render on top.
export const DRAW_ORDER = [
    'noiseField', 'plasmaWave', 'moireGrid', 'orbitWeb',
    'spirograph', 'lissajous', 'chaosTunnel', 'crystalWeb',
    'kaleidoscope', 'bloomPetals', 'pinwheels', 'fractureWeb',
    'lightningArc', 'pulseRings', 'particleStorm'
];

// ── Central dispatch ────────────────────────────────────
export function drawModuleInstance(m, g, am, bm, mm) {
    rs.activeModInst = m;
    const b = m.blend;
    switch (m.type) {
        case 'pinwheels': {
            const wArr = wheelsMap[m.id] || [];
            for (let i = 0; i < wArr.length; i++) { wArr[i].update(am, bm); wArr[i].draw(g, b); }
            break;
        }
        case 'fractureWeb': drawFractureWeb(g, am, bm, b); break;
        case 'lissajous': drawLissajous(g, am, b); break;
        case 'spirograph': drawSpirograph(g, am, b); break;
        case 'particleStorm': {
            const pArr = ptclsMap[m.id] || [];
            for (let j = 0; j < pArr.length; j++) { pArr[j].update(am); pArr[j].draw(g, b); }
            break;
        }
        case 'kaleidoscope': drawKaleidoscope(g, am, bm, b); break;
        case 'moireGrid': drawMoireGrid(g, am, mm, b); break;
        case 'pulseRings': drawPulseRings(g, am, bm, b); break;
        case 'chaosTunnel': drawChaosTunnel(g, am, bm, b); break;
        case 'noiseField': drawNoiseField(g, am, b); break;
        case 'plasmaWave': drawPlasmaWave(g, am, bm, b); break;
        case 'crystalWeb': drawCrystalWeb(g, am, bm, b); break;
        case 'bloomPetals': drawBloomPetals(g, am, bm, b); break;
        case 'lightningArc': drawLightningArc(g, am, bm, b); break;
        case 'orbitWeb': drawOrbitWeb(g, am, bm, b); break;
        default: break;
    }
    rs.activeModInst = null;
}
