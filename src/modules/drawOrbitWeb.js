import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

// Per-instance body state
const _orbitBodies = {};

export function drawOrbitWeb(g, am, bm, b) {
    const mp = CMP('orbitWeb');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'orbitWeb';
    const cx = width / 2, cy = height / 2;

    // Init or reset bodies when count changes
    if (!_orbitBodies[mid] || _orbitBodies[mid].length !== mp.bodies) {
        randomSeed(params.seed + 91);
        _orbitBodies[mid] = [];
        for (let i = 0; i < mp.bodies; i++) {
            const ang = i * (TWO_PI / mp.bodies) + random(-.3, .3);
            const orbitR = width * (.12 + random(.08, .22));
            const speed = mp.initVel * (.6 + random(.8)) * (i % 2 === 0 ? 1 : -1);
            _orbitBodies[mid].push({
                x: cx + cos(ang) * orbitR, y: cy + sin(ang) * orbitR,
                vx: -sin(ang) * speed * 4, vy: cos(ang) * speed * 4,
                mass: .4 + random(.6), hue: i * (360 / mp.bodies), trail: []
            });
        }
        randomSeed(params.seed);
    }

    const bodies = _orbitBodies[mid];
    const N = bodies.length;
    const G = mp.gravity * 0.3 * (1 + AR('vol') * .3);
    const maxTrail = Math.floor(mp.trailLen);
    const dt = 0.5 * (1 + AR('bass') * .2);

    for (let i = 0; i < N; i++) {
        const bi = bodies[i];
        let ax = 0, ay = 0;
        for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const bj = bodies[j];
            const dx = bj.x - bi.x, dy = bj.y - bi.y;
            const d2 = dx * dx + dy * dy;
            const d = Math.sqrt(d2) + 8;
            const force = G * bi.mass * bj.mass / (d2 + 0.1);
            ax += force * dx / d; ay += force * dy / d;
        }
        // Soft center gravity
        const dcx = cx - bi.x, dcy = cy - bi.y;
        const distC = Math.sqrt(dcx * dcx + dcy * dcy) + 1;
        ax += dcx / distC * G * .12; ay += dcy / distC * G * .12;

        bi.vx += ax * dt; bi.vy += ay * dt;
        const spd = Math.sqrt(bi.vx * bi.vx + bi.vy * bi.vy);
        if (spd > 8) { bi.vx = bi.vx / spd * 8; bi.vy = bi.vy / spd * 8; }

        bi.trail.push({ x: bi.x, y: bi.y });
        if (bi.trail.length > maxTrail) bi.trail.shift();
        bi.x += bi.vx * dt; bi.y += bi.vy * dt;

        if (bi.x < 10 || bi.x > width - 10) bi.vx *= -.85;
        if (bi.y < 10 || bi.y > height - 10) bi.vy *= -.85;
        bi.x = Math.max(10, Math.min(width - 10, bi.x));
        bi.y = Math.max(10, Math.min(height - 10, bi.y));
    }

    g.colorMode(HSB, 360, 100, 100, 100);

    // Trails
    for (let i = 0; i < N; i++) {
        const bi = bodies[i];
        const hue = MH(mid, (rs.globalHue + bi.hue) % 360);
        const tLen = bi.trail.length;
        for (let t = 1; t < tLen; t++) {
            const frac = t / tLen;
            const alpha = frac * (mp.trailFade ? frac : 1) * 50 * b;
            g.stroke(hue, SS(60 + frac * 30), BS(70 + frac * 30), alpha);
            g.strokeWeight((.5 + frac * 2) * (1 + AR('vol') * .3));
            g.noFill();
            g.line(bi.trail[t - 1].x, bi.trail[t - 1].y, bi.trail[t].x, bi.trail[t].y);
        }
    }

    // Connection lines
    if (mp.connectLines) {
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const bi = bodies[i], bj = bodies[j];
                const dx = bi.x - bj.x, dy = bi.y - bj.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                const maxD = width * .55;
                if (d < maxD) {
                    const alpha = (1 - d / maxD) * 18 * b * (1 + AR('bass'));
                    const hue = MH(mid, (rs.globalHue + (bi.hue + bj.hue) / 2) % 360);
                    g.stroke(hue, SS(50), BS(80), alpha);
                    g.strokeWeight(.5 + AR('vol'));
                    g.line(bi.x, bi.y, bj.x, bj.y);
                }
            }
        }
    }

    // Body glows
    for (let i = 0; i < N; i++) {
        const bi = bodies[i];
        const hue = MH(mid, (rs.globalHue + bi.hue) % 360);
        const spd = Math.sqrt(bi.vx * bi.vx + bi.vy * bi.vy);
        const r = bi.mass * (6 + spd * 1.5) * (1 + AR('beat') * .4);
        g.noStroke();
        g.fill(hue, SS(40), BS(100), (50 + spd * 5) * b); g.ellipse(bi.x, bi.y, r * 3, r * 3);
        g.fill(hue, SS(80), BS(100), 80 * b); g.ellipse(bi.x, bi.y, r, r);
        g.fill(0, 0, 100, 60 * b); g.ellipse(bi.x, bi.y, r * .4, r * .4);
    }
}
