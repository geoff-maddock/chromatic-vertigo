import { rs, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params, getModById } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

export class Pinwheel {
    constructor(x, y, r, a0, dir, hBase, instId) {
        this.x = x; this.y = y; this.r = r; this.a = a0; this.dir = dir;
        this.hBase = hBase; this.instId = instId;
        this.phase = random(TWO_PI);
        this.orbitA = random(TWO_PI);
        this.orbitR = random(0, r * .3);
        this.orbitS = random(-.008, .008);
        this.cr = r; this.ox = 0; this.oy = 0;
    }

    update(am, bm) {
        const mp = getModById(this.instId) || {}; if (!mp.on) return;
        const spd = params.spinSpeed * (1 + AR('vol') * 2) * (1 + audioState.beatDetect * .5);
        this.a += spd * this.dir * (1 + noise(rs.fc * .01, this.phase) * params.chaos * 2);
        this.orbitA += this.orbitS * (1 + AR('bass') * 2) * (mp.orbitDrift || 0);
        this.cr = this.r * (0.88 + 0.12 * sin(rs.fc * .025 + this.phase))
            * (1 + AR('bass') * .8) * (1 + AR('beat') * .4);
        this.ox = this.orbitR * cos(this.orbitA) * params.chaos * (mp.orbitDrift || 0);
        this.oy = this.orbitR * sin(this.orbitA) * params.chaos * (mp.orbitDrift || 0);
    }

    draw(g, b) {
        const mp = getModById(this.instId); if (!mp) return;
        const n = mp.bladeCount, rings = mp.ringCount, r = this.cr;
        g.push(); g.translate(this.x + this.ox, this.y + this.oy);
        const warp = params.chaos * (audioState.beatDetect * .5 + .5);
        const skewOff = mp.bladeSkew * (TWO_PI / n) * .5;

        for (let ri = rings; ri >= 1; ri--) {
            const frac = ri / rings, rr = r * frac;
            for (let i = 0; i < n; i++) {
                const sa = this.a + (TWO_PI / n) * i + skewOff * ri;
                const ea = sa + TWO_PI / n;
                let hue, sat, bri;

                if (mp.altColoring > .5) {
                    hue = MH(this.instId, (this.hBase + rs.globalHue + ri * (360 / rings)) % 360);
                    sat = (70 + 20 * frac) * params.saturation;
                    bri = (40 + 45 * (1 - frac * .35)) * params.brightness;
                    if (i % 2 === 0) hue = (hue + 60) % 360;
                } else {
                    hue = MH(this.instId, (this.hBase + rs.globalHue + i * (360 / n) + ri * 28) % 360);
                    sat = (70 + 20 * frac) * params.saturation;
                    bri = (40 + 45 * (1 - frac * .35)) * params.brightness;
                    if ((i + ri) % 2 === 0) {
                        hue = (hue + 60) % 360;
                        bri = Math.min(100, (100 - bri * .35) * params.brightness);
                    }
                }

                g.colorMode(HSB, 360, 100, 100, 100);
                g.fill(hue, Math.min(100, sat), Math.min(100, bri), 88 * b);
                g.noStroke();
                g.beginShape();
                g.vertex(0, 0);
                for (let s = 0; s <= 10; s++) {
                    const aa = sa + (ea - sa) * s / 10;
                    const rr2 = rr * (1 + warp * .1 * sin(aa * 3 + rs.fc * .05));
                    g.vertex(cos(aa) * rr2, sin(aa) * rr2);
                }
                g.endShape(CLOSE);
            }
        }

        if (mp.hubGlow > .05) {
            g.colorMode(HSB, 360, 100, 100, 100);
            const hh = MH(this.instId, (this.hBase + rs.globalHue + 90) % 360);
            g.fill(hh, 30, 100, 70 * b * mp.hubGlow * (1 + audioState.beatDetect * .5));
            g.noStroke(); g.ellipse(0, 0, r * .12, r * .12);
            g.fill(hh, 10, 100, 40 * b * mp.hubGlow);
            g.ellipse(0, 0, r * .06, r * .06);
        }
        g.pop();
    }
}
