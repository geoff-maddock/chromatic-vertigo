import { rs, CMP, MH, BS, SS } from '../renderer/rendererState.js';
import { AR } from '../audio/AudioMapping.js';
import { params } from '../state/params.js';

export function drawMoireGrid(g, am, mm, b) {
    const mp = CMP('moireGrid');
    const mid = rs.activeModInst ? rs.activeModInst.id : 'moireGrid';
    const gs = mp.gridSize, cx = width / 2, cy = height / 2;
    const baseRot = rs.fc * params.spinSpeed * 20 * mp.rotSpeed / 0.01 * (1 + AR('vol') * 1.5);
    g.colorMode(HSB, 360, 100, 100, 100);
    g.strokeWeight(mp.lineW);

    if (mp.polar) {
        for (let layer = 0; layer < mp.layers; layer++) {
            const layerOff = layer * baseRot * .3 + layer * mm * 10;
            g.push(); g.translate(cx, cy); g.rotate(layerOff);
            const nLines = Math.floor(width / gs) * 2;
            for (let i = 0; i < nLines; i++) {
                const ra = i * TWO_PI / nLines;
                g.stroke(MH(mid, (rs.globalHue + i * (360 / nLines) + layer * 90) % 360), SS(60), BS(80), (28 + layer * 8) * b);
                g.line(0, 0, cos(ra) * width * .7, sin(ra) * width * .7);
            }
            for (let ri = gs; ri < width * .7; ri += gs * (1 + AR('vol') * .1)) {
                g.stroke(MH(mid, (rs.globalHue + ri / width * 180 + layer * 90) % 360), SS(70), BS(85), (22 + layer * 8) * b);
                g.noFill(); g.ellipse(0, 0, ri * 2, ri * 2);
            }
            g.pop();
        }
    } else {
        for (let layer = 0; layer < mp.layers; layer++) {
            const gs2 = gs * (1 + layer * .3 + AR('vol') * .2 * layer);
            const rot = baseRot * (layer % 2 === 0 ? 1 : -1) * layer * .5;
            if (layer === 0) {
                for (let x = 0; x <= width; x += gs) {
                    g.stroke(MH(mid, (rs.globalHue + x / width * 180) % 360), SS(60), BS(80), 30 * b);
                    g.line(x, 0, x, height);
                }
                for (let y = 0; y <= height; y += gs) {
                    g.stroke(MH(mid, (rs.globalHue + y / height * 180 + 90) % 360), SS(60), BS(80), 30 * b);
                    g.line(0, y, width, y);
                }
            } else {
                g.push(); g.translate(cx, cy); g.rotate(rot);
                for (let x2 = -width; x2 <= width; x2 += gs2) {
                    g.stroke(MH(mid, (rs.globalHue + 90 + (x2 + width) / (width * 2) * 180 + layer * 60) % 360), SS(70), BS(90), (20 + layer * 5) * b);
                    g.line(x2, -height, x2, height);
                }
                for (let y2 = -height; y2 <= height; y2 += gs2) {
                    g.stroke(MH(mid, (rs.globalHue + 270 + (y2 + height) / (height * 2) * 180 + layer * 60) % 360), SS(70), BS(90), (20 + layer * 5) * b);
                    g.line(-width, y2, width, y2);
                }
                g.pop();
            }
        }
    }
}
