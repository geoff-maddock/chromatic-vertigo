import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';

export function drawNoiseField(g, am, b) {
    const mp = CMP('noiseField');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'noiseField';
    const sc = mp.scale, warp = mp.warp * (1 + AR('vol') * 1.5), step = mp.step;
    g.colorMode(HSB, 360, 100, 100, 100);
    g.strokeWeight(1.5 + AR('vol') * 2);

    for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
            const n1 = noise(x * sc, y * sc, rs.fc * .008);
            const n2 = noise(x * sc + 100, y * sc + 100, rs.fc * .008);
            let a = n1 * TWO_PI * warp * (mp.curl ? 1.5 : 2);
            if (mp.curl) a += HALF_PI;
            const len = step * mp.arrowLen * (1 + n2 * .5 + AR('vol') * .5);
            const tx = x + step / 2, ty = y + step / 2;
            const speed = abs(cos(a)) + abs(sin(a));
            let hue;
            switch (mp.colorMode) {
                case 0: hue = MH(mid, (rs.globalHue + n1 * 360 + x / width * 180) % 360); break;
                case 1: hue = MH(mid, rs.globalHue); break;
                case 2: hue = MH(mid, (rs.globalHue + speed * 180) % 360); break;
                case 3: hue = MH(mid, (rs.globalHue + y / height * 360) % 360); break;
                default: hue = MH(mid, rs.globalHue);
            }
            g.stroke(hue, SS(70), BS(90), 38 * b);
            g.line(tx, ty, tx + cos(a) * len, ty + sin(a) * len);
            if (len > 8) {
                const ah = a + PI * .85, ah2 = a - PI * .85;
                g.line(tx + cos(a) * len, ty + sin(a) * len, tx + cos(a) * len + cos(ah) * 4, ty + sin(a) * len + sin(ah) * 4);
                g.line(tx + cos(a) * len, ty + sin(a) * len, tx + cos(a) * len + cos(ah2) * 4, ty + sin(a) * len + sin(ah2) * 4);
            }
        }
    }
}
