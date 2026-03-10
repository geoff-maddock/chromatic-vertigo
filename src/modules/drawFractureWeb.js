import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';

export function drawFractureWeb(g, am, bm, b) {
    const mp = CMP('fractureWeb');
    const cx = width / 2, cy = height / 2;
    const beat = 1 + AR('beat');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'fractureWeb';
    g.colorMode(HSB, 360, 100, 100, 100);
    randomSeed(params.seed + 77);

    function branch(x1, y1, x2, y2, depth, hue) {
        if (depth <= 0) return;
        g.stroke(MH(mid, (hue + rs.globalHue) % 360), SS(60 + depth * 8), BS(70 + depth * 5), (35 + depth * 8) * b);
        g.strokeWeight(depth * .6 * (1 + AR('vol') * .5));
        g.line(x1, y1, x2, y2);
        const spread = mp.spreadAngle * (1 + AR('vol') * .5);
        const mx = (x1 + x2) / 2 + random(-28 * spread, 28 * spread) * params.chaos * (1 + AR('vol') * 2) * beat;
        const my = (y1 + y2) / 2 + random(-28 * spread, 28 * spread) * params.chaos * (1 + AR('bass') * 2) * beat;
        branch(x1, y1, mx, my, depth - 1, (hue + mp.colorShift) % 360);
        branch(x2, y2, mx, my, depth - 1, (hue + mp.colorShift * 2) % 360);
    }

    for (let i = 0; i < mp.lines; i++) {
        const a = TWO_PI * i / mp.lines + rs.fc * params.spinSpeed * mp.webSpin * (1 + AR('vol'));
        const r = width * .46 * (1 + AR('bass') * .2);
        const startR = mp.radiate ? .12 : .4;
        branch(
            cx + cos(a) * r * startR, cy + sin(a) * r * startR,
            cx + cos(a) * r, cy + sin(a) * r,
            mp.webDepth,
            MH(mid, (i * (360 / mp.lines)) % 360)
        );
    }
    randomSeed(params.seed);
}
