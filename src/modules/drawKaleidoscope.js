import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';

export function drawKaleidoscope(g, am, bm, b) {
    const mp = CMP('kaleidoscope');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'kaleidoscope';
    const seg = mp.segments, cx = width / 2, cy = height / 2;
    const ms = mp.morphSpeed * (1 + AR('vol'));
    const ns = mp.noiseScale;
    g.colorMode(HSB, 360, 100, 100, 100);
    g.push(); g.translate(cx, cy);

    for (let s = 0; s < seg; s++) {
        g.push(); g.rotate(s * TWO_PI / seg);
        if (!mp.strokeOn) {
            g.noStroke();
        } else {
            g.stroke(MH(mid, (rs.globalHue + s * 30) % 360), SS(60), BS(90), 40 * b);
            g.strokeWeight(mp.strokeW);
        }
        for (let i = 0; i < 24; i++) {
            const t = i / 24;
            const r1 = width * .1 + noise(t * 3 * ns, rs.fc * .012 * ms, s * .7) * width * .38 * (1 + AR('bass') * .3);
            const r2 = width * .1 + noise(t * 3 * ns + 1, rs.fc * .012 * ms + .5, s * .7) * width * .38 * (1 + AR('bass') * .3);
            const a1 = t * TWO_PI / seg;
            const a2 = (t + 1 / 24) * TWO_PI / seg;
            g.fill(MH(mid, (rs.globalHue + s * (360 / seg) + i * (180 / 24)) % 360), SS(75), BS(90), mp.fillOpacity * 100 * b);
            g.beginShape();
            g.vertex(0, 0);
            g.vertex(cos(a1) * r1, sin(a1) * r1);
            g.vertex(cos(a2) * r2, sin(a2) * r2);
            g.endShape(CLOSE);
        }
        g.pop();
    }
    g.pop();
}
