import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';

export function drawCrystalWeb(g, am, bm, b) {
    const mp = CMP('crystalWeb');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'crystalWeb';
    const cx = width / 2, cy = height / 2, sz = width * .42;
    const beat = 1 + AR('beat') * .5;

    // Golden-spiral point distribution on unit sphere
    const N = mp.faces;
    const pts3 = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
        const y3 = 1 - 2 * (i / (N - 1 || 1));
        const r3 = Math.sqrt(Math.max(0, 1 - y3 * y3));
        const theta = goldenAngle * i;
        pts3.push([r3 * cos(theta), y3, r3 * sin(theta)]);
    }

    const rx = rs.fc * .009 * mp.spinX * (1 + AR('vol') * .5);
    const ry = rs.fc * .013 * mp.spinY * (1 + AR('vol') * .5);
    const rz = rs.fc * .007 * mp.spinZ * (1 + AR('vol') * .5);
    const cx3 = cos(rx), sx3 = sin(rx);
    const cy3 = cos(ry), sy3 = sin(ry);
    const cz3 = cos(rz), sz3 = sin(rz);

    function rot3(p) {
        const y1 = p[1] * cx3 - p[2] * sx3, z1 = p[1] * sx3 + p[2] * cx3;
        const x2 = p[0] * cy3 + z1 * sy3, z2 = -p[0] * sy3 + z1 * cy3;
        const x3 = x2 * cz3 - y1 * sz3, y3 = x2 * sz3 + y1 * cz3;
        return [x3, y3, z2];
    }

    function project(p) {
        const persp = mp.perspective;
        const z = p[2] + persp;
        const scale = (sz * persp) / (z + persp);
        return [cx + p[0] * scale, cy + p[1] * scale, p[2]];
    }

    const projected = pts3.map(p => project(rot3(p)));
    g.colorMode(HSB, 360, 100, 100, 100);

    if (mp.wireframe) {
        const distThresh = sz * .85 * (1 + AR('vol') * .1);
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const p1 = projected[i], p2 = projected[j];
                const dx = p1[0] - p2[0], dy = p1[1] - p2[1];
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < distThresh) {
                    const depthFrac = ((p1[2] + p2[2]) / 2 + 1) / 2;
                    const hue = MH(mid, (rs.globalHue + i * (360 / N) + j * 17) % 360);
                    const alpha = (1 - d / distThresh) * mp.edgeGlow * 80 * b * (.4 + depthFrac * .6);
                    g.stroke(hue, SS(75), BS(100), alpha);
                    g.strokeWeight(mp.edgeGlow * (.5 + depthFrac * .5) * (1 + AR('bass')));
                    g.noFill();
                    g.line(p1[0], p1[1], p2[0], p2[1]);
                }
            }
        }
    }

    if (mp.vertexGlow > .05) {
        for (let i = 0; i < N; i++) {
            const p = projected[i];
            const depthFrac = (p[2] + 1) / 2;
            const vsize = (3 + depthFrac * 8) * (1 + AR('vol') * .5) * beat * mp.vertexGlow;
            const hue = MH(mid, (rs.globalHue + i * (360 / N)) % 360);
            g.noStroke();
            g.fill(hue, SS(40), BS(100), 60 * b * depthFrac * mp.vertexGlow);
            g.ellipse(p[0], p[1], vsize * 2, vsize * 2);
            g.fill(hue, SS(80), BS(100), 85 * b * mp.vertexGlow);
            g.ellipse(p[0], p[1], vsize * .6, vsize * .6);
        }
    }
}
