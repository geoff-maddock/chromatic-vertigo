import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

// Per-instance arc seeds
const _lightningSeeds = {};

export function drawLightningArc(g, am, bm, b) {
    const mp = CMP('lightningArc');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'lightningArc';
    const cx = width / 2, cy = height / 2;

    // Regenerate arc seeds on beat or periodically
    if (!_lightningSeeds[mid] ||
        (mp.restrikeBeat && audioState.beatDetect > 0.7 && (rs.fc % 8 === 0)) ||
        (rs.fc % 90 === 0)) {
        _lightningSeeds[mid] = [];
        for (let i = 0; i < mp.arcs; i++) {
            _lightningSeeds[mid].push(Math.floor(Math.random() * 99999));
        }
    }

    function bolt(x1, y1, x2, y2, depth, seed, hue, alpha) {
        if (depth <= 0) {
            g.stroke(hue, SS(30), BS(100), alpha * b);
            g.strokeWeight(mp.glowWidth * .3);
            g.line(x1, y1, x2, y2);
            return;
        }
        randomSeed(seed);
        const mx = (x1 + x2) / 2 + random(-1, 1) * mp.spread * width * .12 * (depth / mp.forkDepth) * (1 + AR('bass'))
            + random(-1, 1) * mp.drift * width * .05 * (1 + AR('vol'));
        const my = (y1 + y2) / 2 + random(-1, 1) * mp.spread * width * .12 * (depth / mp.forkDepth) * (1 + AR('bass'))
            + random(-1, 1) * mp.drift * height * .05 * (1 + AR('vol'));
        const w = mp.glowWidth * (depth / mp.forkDepth) * (.5 + AR('vol') * .5);
        // Outer glow
        g.stroke(hue, SS(60), BS(90), alpha * .35 * b); g.strokeWeight(w * 3);
        g.line(x1, y1, mx, my); g.line(mx, my, x2, y2);
        // Core
        g.stroke(hue, SS(20), BS(100), alpha * b); g.strokeWeight(w * .8);
        g.line(x1, y1, mx, my); g.line(mx, my, x2, y2);

        bolt(x1, y1, mx, my, depth - 1, seed + 1, hue, alpha * .85);
        bolt(mx, my, x2, y2, depth - 1, seed + 2, hue, alpha * .85);
        if (depth > 1 && random(1) < 0.35) {
            const fx = mx + random(-1, 1) * width * .12 * mp.spread;
            const fy = my + random(-1, 1) * height * .12 * mp.spread;
            bolt(mx, my, fx, fy, depth - 2, seed + 7, hue, alpha * .4);
        }
    }

    g.colorMode(HSB, 360, 100, 100, 100); g.noFill();
    const seeds = _lightningSeeds[mid] || [];

    for (let i = 0; i < mp.arcs; i++) {
        const seed = seeds[i] || i * 777;
        randomSeed(seed);
        const a1 = TWO_PI * i / mp.arcs + rs.fc * params.spinSpeed * .3 * (1 + AR('vol') * .3);
        const a2 = a1 + PI + random(-.5, .5) * mp.spread * 2;
        const r1 = width * .38 * (.7 + random(.3)) * (1 + AR('beat') * .15);
        const r2 = width * .38 * (.7 + random(.3)) * (1 + AR('beat') * .15);
        const px1 = cx + cos(a1) * r1, py1 = cy + sin(a1) * r1;
        const px2 = cx + cos(a2) * r2, py2 = cy + sin(a2) * r2;
        const hue = MH(mid, (rs.globalHue + i * (360 / mp.arcs) + AR('beat') * 60) % 360);
        bolt(px1, py1, px2, py2, mp.forkDepth, seed, hue, 65 + am * 30);
    }
    randomSeed(params.seed);
}
