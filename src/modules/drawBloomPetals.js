import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

export function drawBloomPetals(g, am, bm, b) {
    const mp = CMP('bloomPetals');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'bloomPetals';
    const cx = width / 2, cy = height / 2;
    const baseR = width * .42 * mp.petalLen * (1 + AR('bass') * .15);
    const breathAmt = mp.breathe * (sin(rs.fc * .04) * .5 + .5) * (1 + AR('vol') * .3);
    const globalRot = rs.fc * params.spinSpeed * mp.rotSpeed * (1 + AR('vol') * .4);
    g.colorMode(HSB, 360, 100, 100, 100);

    for (let layer = 0; layer < mp.layers; layer++) {
        const layerScale = 1 - (layer * .12);
        const layerRot = globalRot * (1 + layer * .3) + layer * (PI / mp.petals);
        const layerHueOff = layer * (360 / mp.layers);

        for (let p = 0; p < mp.petals; p++) {
            const petalAngle = p * (TWO_PI / mp.petals) + layerRot;
            const hue = MH(mid, (rs.globalHue + layerHueOff + p * (360 / mp.petals)) % 360);
            const petalR = baseR * layerScale * (1 + breathAmt * .2);
            const halfW = mp.petalWidth * PI * .5;

            g.noStroke();
            g.fill(hue, SS(70 + layer * 8), BS(85 + layer * 5), (30 + layer * 10) * b);
            g.beginShape();
            const steps = 40;
            for (let si = 0; si <= steps; si++) {
                const t = si / steps;
                const petalT = t * TWO_PI;
                const r = petalR * sin(petalT * 0.5) * (1 + noise(rs.fc * .01 + p * .5, layer * .3 + t) * params.chaos * .4);
                const a = petalAngle + (t - .5) * halfW * 2;
                g.vertex(cx + cos(a) * r, cy + sin(a) * r);
            }
            g.endShape(CLOSE);

            // Petal vein
            g.stroke(hue, SS(90), BS(100), (45 + layer * 8) * b);
            g.strokeWeight(.8 + AR('vol')); g.noFill();
            g.beginShape();
            for (let si = 0; si <= 20; si++) {
                const t2 = si / 20;
                const r2 = petalR * t2 * layerScale * (1 + breathAmt * .15);
                g.vertex(cx + cos(petalAngle) * r2, cy + sin(petalAngle) * r2);
            }
            g.endShape();
        }
    }

    if (mp.innerRing) {
        const innerR = baseR * .18 * (1 + AR('vol') * .3) * (1 + audioState.beatDetect * .2);
        g.noFill();
        const steps2 = 60;
        g.beginShape();
        for (let si = 0; si <= steps2; si++) {
            const a2 = si / steps2 * TWO_PI + globalRot;
            const r2 = innerR * (1 + sin(a2 * mp.petals + rs.fc * .08) * 0.25 * (1 + AR('bass')));
            const hue2 = MH(mid, (rs.globalHue + si * (360 / steps2)) % 360);
            g.stroke(hue2, SS(85), BS(100), (70 + audioState.beatDetect * 20) * b);
            g.strokeWeight(1.5 + AR('vol') * 2);
            g.vertex(cx + cos(a2) * r2, cy + sin(a2) * r2);
        }
        g.endShape(CLOSE);
    }
}
