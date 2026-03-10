import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

export function drawChaosTunnel(g, am, bm, b) {
    const mp = CMP('chaosTunnel');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'chaosTunnel';
    const cx = width / 2, cy = height / 2, dep = mp.depth;
    const twist = mp.twist * (1 + AR('vol') * 2);
    const zp = mp.zoomPulse * (1 + AR('beat') * .5);
    g.colorMode(HSB, 360, 100, 100, 100);

    for (let i = 0; i < dep; i++) {
        const it = 1 - i / dep;
        const sz2 = it * width * .5 * (1 + AR('bass') * .2 + audioState.beatDetect * .05 * zp);
        const rot = rs.fc * params.spinSpeed * twist * (it * 2 + .5) + i * .3;
        const corners = mp.cornerBase + Math.floor(i * .4);
        const hue = MH(mid, (rs.globalHue + i * (360 / dep)) % 360);

        if (!mp.fillFaces) {
            g.stroke(hue, SS(70), BS(100), (55 + i / dep * 25) * b);
            g.strokeWeight(it * 3 + .5 + AR('vol') * 2); g.noFill();
        } else {
            g.fill(hue, SS(50), BS(60), (15 + i / dep * 10) * b);
            g.stroke(hue, SS(70), BS(100), 30 * b); g.strokeWeight(.5);
        }

        g.push(); g.translate(cx, cy); g.rotate(rot);
        g.beginShape();
        for (let aa = 0; aa < TWO_PI; aa += TWO_PI / corners) {
            const nr = sz2 * (1 + noise(cos(aa) * 1.5 + rs.fc * .01, sin(aa) * 1.5 + i * .5) * params.chaos * .8);
            g.vertex(cos(aa) * nr, sin(aa) * nr);
        }
        g.endShape(CLOSE); g.pop();

        if (mp.connectLines && i < dep - 1) {
            const sz3 = ((dep - i - 1) / dep) * width * .5;
            const rot2 = rot + params.spinSpeed * twist + .3;
            g.stroke(hue, SS(50), BS(80), 18 * b); g.strokeWeight(.5); g.noFill();
            for (let jj = 0; jj < corners; jj++) {
                const a1 = jj * TWO_PI / corners + rot;
                const a2 = jj * TWO_PI / corners + rot2;
                g.line(cx + cos(a1) * sz2, cy + sin(a1) * sz2, cx + cos(a2) * sz3, cy + sin(a2) * sz3);
            }
        }
    }
}
