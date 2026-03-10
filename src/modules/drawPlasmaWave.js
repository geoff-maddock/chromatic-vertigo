import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';

export function drawPlasmaWave(g, am, bm, b) {
    const mp = CMP('plasmaWave');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'plasmaWave';
    const t = rs.fc * .012 * mp.speed * (1 + AR('vol') * .8);
    const px = mp.pixelSize, cx = width / 2, cy = height / 2;
    const sA = mp.scaleA * .012, sB = mp.scaleB * .018, sC = mp.scaleC * .009;
    const con = mp.contrast * (1 + AR('bass') * .4);
    g.colorMode(HSB, 360, 100, 100, 100); g.noStroke();

    for (let x = 0; x < width; x += px) {
        for (let y = 0; y < height; y += px) {
            const dx = x - cx, dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let v = 0;
            for (let layer = 0; layer < mp.complexity; layer++) {
                const lt = t * (1 + layer * .3);
                v += sin(x * sA + lt);
                v += sin(y * sB + lt * 1.3);
                v += sin(dist * (sC * (1 + layer * .2)) + lt);
                v += sin((x * sA * .7 + y * sB * .7) + lt * .8 + layer * 1.2);
            }
            v = (v / (mp.complexity * 4) + 1) * 0.5; // normalize [0,1]
            v = Math.max(0, Math.min(1, (v - .5) * con + .5));
            const hue = MH(mid, (rs.globalHue + v * 360 + AR('beat') * 30) % 360);
            const sat = SS(65 + v * 30);
            const bri2 = BS(40 + v * 60);
            g.fill(hue, sat, bri2, (50 + v * 50) * b);
            g.rect(x, y, px, px);
        }
    }
}
