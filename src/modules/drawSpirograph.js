import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

export function drawSpirograph(g, am, b) {
    const mp = CMP('spirograph');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'spirograph';
    const cx = width / 2, cy = height / 2, sz = width * .46;
    const R = mp.R * sz;
    const r0 = mp.r * sz * (1 + AR('vol') * .3);
    const d0 = mp.d * sz;
    const total = rs.fc * .02 * mp.traceSpeed * (1 + AR('vol') * .5);
    g.colorMode(HSB, 360, 100, 100, 100); g.noFill();
    const steps = 700;

    for (let pass = 0; pass < mp.passes; pass++) {
        const r = r0 * (1 - pass * .2);
        const d = d0 * (1 + pass * .3);
        const hOff = pass * (180 / mp.passes);
        if (mp.fill) {
            g.fill(MH(mid, (rs.globalHue + hOff) % 360), SS(60), BS(80), 20 * b);
            g.noStroke();
        } else {
            g.noFill();
            g.stroke(MH(mid, (rs.globalHue + hOff) % 360), SS(85), BS(100), (50 + AR('vol') * 40) * b);
            g.strokeWeight(mp.strokeW * (1 + AR('vol') * 1.5 + audioState.beatDetect));
        }
        g.beginShape();
        for (let i = 0; i <= steps; i++) {
            const t = (total + pass) * i / steps * TWO_PI * 10;
            const x = cx + (R - r) * cos(t) + d * cos((R - r) / r * t);
            const y = cy + (R - r) * sin(t) - d * sin((R - r) / r * t);
            g.stroke(MH(mid, (rs.globalHue + hOff + i * (360 / steps)) % 360), SS(85), BS(100), (50 + AR('vol') * 40) * b);
            g.vertex(x, y);
        }
        g.endShape();
    }
}
