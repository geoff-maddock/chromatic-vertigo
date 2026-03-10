import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';

export function drawLissajous(g, am, b) {
    const mp = CMP('lissajous');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'lissajous';
    const cx = width / 2, cy = height / 2, R = width * .44;
    const fA = mp.freqA + AR('vol') * 2 * params.chaos;
    const fB = mp.freqB + AR('vol') * 1.5 * params.chaos;
    const phase = rs.fc * .015 * mp.phaseSpeed * (1 + AR('vol'));
    g.colorMode(HSB, 360, 100, 100, 100); g.noFill();
    const steps = mp.density * 3;

    for (let layer = 0; layer < mp.layers; layer++) {
        g.beginShape();
        for (let i = 0; i <= steps; i++) {
            const t = TWO_PI * i / steps;
            const x = cx + cos(fA * t + phase + layer * 1.05) * R * (.85 + AR('vol') * .15);
            const y = cy + sin(fB * t + layer * .8) * R * (.85 + AR('vol') * .15);
            const hue = mp.rainbow
                ? MH(mid, (rs.globalHue + i * (360 / steps) + layer * 120) % 360)
                : MH(mid, (rs.globalHue + layer * 60) % 360);
            g.stroke(hue, SS(80), BS(100), 40 * b);
            g.strokeWeight(mp.strokeW * (1 + AR('vol') * 2));
            g.vertex(x, y);
        }
        g.endShape();
    }
}
