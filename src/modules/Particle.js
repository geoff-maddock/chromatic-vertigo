import { rs, MH } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params, getModById } from '../state/params.js';
import { audioState } from '../audio/AudioEngine.js';

export class Particle {
    constructor(instId) { this.instId = instId; this.trail = []; this.reset(); }

    reset() {
        const mp = getModById(this.instId) || {};
        if (mp.spawnEdge) {
            const side = floor(random(4));
            if (side === 0) { this.x = random(width); this.y = 0; }
            else if (side === 1) { this.x = width; this.y = random(height); }
            else if (side === 2) { this.x = random(width); this.y = height; }
            else { this.x = 0; this.y = random(height); }
        } else {
            this.x = random(width); this.y = random(height);
        }
        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.life = random(.3, 1);
        this.maxLife = this.life;
        this.hue = random(360);
        this.sz = random(1.5, 5);
        this.trail = [];
    }

    update(am) {
        const mp = getModById(this.instId); if (!mp) return;
        const n = noise(this.x * .003 + rs.fc * .006, this.y * .003) * TWO_PI * 2;
        const turb = mp.turbulence * (1 + AR('vol') * 3);
        if (mp.attractMode) {
            const dx = width / 2 - this.x, dy = height / 2 - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 1;
            this.vx += dx / dist * .5; this.vy += dy / dist * .5;
        }
        const angle = mp.curl ? n + HALF_PI : n;
        this.vx = lerp(this.vx, cos(angle) * 3, turb * .05) + random(-.5, .5) * params.chaos;
        this.vy = lerp(this.vy, sin(angle) * 3, turb * .05) + random(-.5, .5) * params.chaos + mp.gravity * .1;
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > mp.trailLen + 1) this.trail.shift();
        this.x += this.vx; this.y += this.vy;
        this.life -= .008;
        if (this.life <= 0 || this.x < -10 || this.x > width + 10 ||
            this.y < -10 || this.y > height + 10) this.reset();
    }

    draw(g, b) {
        const a = this.life / this.maxLife;
        g.colorMode(HSB, 360, 100, 100, 100); g.noFill(); g.strokeWeight(this.sz * .5);
        for (let i = 1; i < this.trail.length; i++) {
            g.stroke(
                MH(this.instId, (this.hue + rs.globalHue + i * 5) % 360),
                80 * params.saturation, 100 * params.brightness,
                a * (i / this.trail.length) * 70 * b
            );
            g.line(this.trail[i - 1].x, this.trail[i - 1].y, this.trail[i].x, this.trail[i].y);
        }
        g.stroke(
            MH(this.instId, (this.hue + rs.globalHue) % 360),
            90 * params.saturation, 100 * params.brightness, a * 88 * b
        );
        g.strokeWeight(this.sz * (1 + audioState.beatDetect * .5));
        g.point(this.x, this.y);
    }
}
