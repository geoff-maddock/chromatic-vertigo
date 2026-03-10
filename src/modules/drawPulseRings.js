import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

export function drawPulseRings(g, am, bm, b) {
    const mp = CMP('pulseRings');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'pulseRings';
    const cx = width / 2, cy = height / 2, n = mp.ringN;
    g.colorMode(HSB, 360, 100, 100, 100);

    for (let i = 0; i < n; i++) {
        const base = (i / n) * mp.spacing * 20 + mp.spacing;
        const r = base * width * .5 * (1 + AR('vol') * .4);
        const pulse = sin(rs.fc * .06 - i * .4 + AR('bass') * 8) * width * .04;
        const rr = r + pulse + AR('beat') * width * .03;
        const hue = MH(mid, (rs.globalHue + i * (360 / n)) % 360);
        const thick = mp.thickness * (1 + AR('vol') * 2) * (1 + audioState.beatDetect * .5);

        if (!mp.fill) {
            g.noFill(); g.stroke(hue, SS(80), BS(100), (65 - i * 2) * b); g.strokeWeight(thick + 1);
        } else {
            g.fill(hue, SS(60), BS(80), (25 - i) * b); g.noStroke();
        }

        if (mp.elliptic) {
            const ecc = mp.eccentricity;
            g.push(); g.translate(cx, cy); g.rotate(rs.fc * params.spinSpeed * .3);
            g.beginShape();
            for (let a = 0; a < TWO_PI; a += .08) {
                const cr = rr * (1 + mp.noiseWarp * noise(cos(a) * 2 + rs.fc * .01, sin(a) * 2) * .4);
                g.vertex(cos(a) * cr * (1 + ecc), sin(a) * cr * (1 - ecc * .5));
            }
            g.endShape(CLOSE); g.pop();
        } else {
            g.beginShape();
            for (let a = 0; a < TWO_PI; a += .05) {
                const cr = rr + noise(cos(a) * 2 + rs.fc * .01, sin(a) * 2) * params.chaos * 40 * mp.noiseWarp;
                g.vertex(cx + cos(a) * cr, cy + sin(a) * cr);
            }
            g.endShape(CLOSE);
        }
    }
}
