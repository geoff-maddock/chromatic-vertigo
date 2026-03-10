// ═══════════════════════════════════════════════════════
// PARAMS & MODULE DEFINITIONS
// ═══════════════════════════════════════════════════════

export const MOD_DEFAULTS = {
    pinwheels: { on: true, blend: 1, wheelCount: 5, bladeCount: 8, ringCount: 6, counterRotate: true, orbitDrift: .3, bladeSkew: 0, hubGlow: .5, altColoring: 0 },
    fractureWeb: { on: false, blend: .8, lines: 60, webDepth: 4, spreadAngle: .5, colorShift: 40, radiate: true, webSpin: .3 },
    lissajous: { on: false, blend: .7, freqA: 3, freqB: 5, density: 150, layers: 3, phaseSpeed: 1, strokeW: 1, rainbow: true },
    spirograph: { on: false, blend: .8, R: .45, r: .15, d: .2, passes: 2, traceSpeed: 1, strokeW: 1, fill: false },
    particleStorm: { on: false, blend: .75, count: 500, turbulence: .5, trailLen: 8, gravity: 0, attractMode: false, spawnEdge: false },
    kaleidoscope: { on: false, blend: .8, segments: 8, morphSpeed: 1, noiseScale: .3, fillOpacity: .55, strokeOn: false, strokeW: 1 },
    moireGrid: { on: false, blend: .6, gridSize: 20, gridType: 0, layers: 2, rotSpeed: .01, lineW: .8, polar: false },
    pulseRings: { on: false, blend: .9, ringN: 10, thickness: .5, spacing: .05, elliptic: false, eccentricity: .5, noiseWarp: .4, fill: false },
    chaosTunnel: { on: false, blend: .7, depth: 18, twist: 1, cornerBase: 4, connectLines: true, fillFaces: false, zoomPulse: .5 },
    noiseField: { on: false, blend: .65, scale: .008, warp: 1.5, step: 20, arrowLen: .65, curl: false, colorMode: 0 },
    plasmaWave: { on: false, blend: .8, scaleA: 2.5, scaleB: 1.8, scaleC: 3.2, speed: 1.0, complexity: 3, pixelSize: 6, contrast: 1.2 },
    crystalWeb: { on: false, blend: .85, faces: 20, spinX: .4, spinY: .7, spinZ: .3, perspective: 2.2, edgeGlow: .7, vertexGlow: .5, wireframe: true },
    bloomPetals: { on: false, blend: .8, petals: 7, layers: 3, petalLen: .8, petalWidth: .4, rotSpeed: .6, breathe: .5, innerRing: true },
    lightningArc: { on: false, blend: .9, arcs: 4, forkDepth: 5, spread: .6, restrikeBeat: true, glowWidth: 3, drift: .3 },
    orbitWeb: { on: false, blend: .75, bodies: 5, trailLen: 120, gravity: .8, initVel: .6, connectLines: true, trailFade: .85 }
};

export const MOD_SPECS = {
    pinwheels: {
        label: '🌀 Pinwheels',
        params: [
            ['wheelCount', 'Wheel Count', 1, 12, 1, 5],
            ['bladeCount', 'Blades', 3, 20, 1, 8],
            ['ringCount', 'Rings', 2, 14, 1, 6],
            ['orbitDrift', 'Orbit Drift', 0, 1, .05, .3],
            ['bladeSkew', 'Blade Skew', 0, 1, .05, 0],
            ['hubGlow', 'Hub Glow', 0, 1, .05, .5],
            ['altColoring', 'Alt Coloring', 0, 1, .05, 0]
        ],
        toggles: [['counterRotate', 'Counter-Rotate', true]]
    },
    fractureWeb: {
        label: '🕸 Fracture Web',
        params: [
            ['lines', 'Line Count', 10, 120, 5, 60],
            ['webDepth', 'Branch Depth', 1, 7, 1, 4],
            ['spreadAngle', 'Spread Angle', 0, 2, .1, .5],
            ['colorShift', 'Color Shift', 0, 180, 5, 40],
            ['webSpin', 'Spin Speed', 0, 1, .05, .3]
        ],
        toggles: [['radiate', 'Radiate from Center', true]]
    },
    lissajous: {
        label: '∞ Lissajous',
        params: [
            ['freqA', 'Freq A', 1, 12, 1, 3],
            ['freqB', 'Freq B', 1, 12, 1, 5],
            ['density', 'Resolution', 50, 400, 25, 150],
            ['layers', 'Layers', 1, 6, 1, 3],
            ['phaseSpeed', 'Phase Speed', 0, 3, .1, 1],
            ['strokeW', 'Stroke Width', 0.5, 5, .5, 1]
        ],
        toggles: [['rainbow', 'Rainbow Mode', true]]
    },
    spirograph: {
        label: '⭕ Spirograph',
        params: [
            ['R', 'Outer R', 0.2, .8, .05, .45],
            ['r', 'Inner r', 0.05, .4, .05, .15],
            ['d', 'Pen Dist', 0.05, .5, .05, .2],
            ['passes', 'Passes', 1, 4, 1, 2],
            ['traceSpeed', 'Trace Speed', 0.5, 3, .1, 1],
            ['strokeW', 'Stroke Width', 0.5, 5, .5, 1]
        ],
        toggles: [['fill', 'Fill Mode', false]]
    },
    particleStorm: {
        label: '✦ Particle Storm',
        params: [
            ['count', 'Particle Count', 50, 1200, 50, 500],
            ['turbulence', 'Turbulence', 0, 2, .1, .5],
            ['trailLen', 'Trail Length', 0, 20, 1, 8],
            ['gravity', 'Gravity', -.5, .5, .05, 0]
        ],
        toggles: [['attractMode', 'Attract to Center', false], ['spawnEdge', 'Spawn at Edges', false]]
    },
    kaleidoscope: {
        label: '💎 Kaleidoscope',
        params: [
            ['segments', 'Segments', 2, 24, 1, 8],
            ['morphSpeed', 'Morph Speed', 0, 3, .1, 1],
            ['noiseScale', 'Noise Scale', 0.1, 1, .05, .3],
            ['fillOpacity', 'Fill Opacity', 0, 1, .05, .55],
            ['strokeW', 'Stroke Width', 0.5, 5, .5, 1]
        ],
        toggles: [['strokeOn', 'Show Outlines', false]]
    },
    moireGrid: {
        label: '⚡ Moiré Grid',
        params: [
            ['gridSize', 'Grid Size', 5, 60, 2, 20],
            ['layers', 'Layers', 1, 4, 1, 2],
            ['rotSpeed', 'Rotation Speed', 0, .05, .002, .01],
            ['lineW', 'Line Width', 0.3, 4, .1, .8]
        ],
        toggles: [['polar', 'Polar Mode', false]]
    },
    pulseRings: {
        label: '◎ Pulse Rings',
        params: [
            ['ringN', 'Ring Count', 3, 30, 1, 10],
            ['thickness', 'Thickness', 0.2, 5, .1, .5],
            ['spacing', 'Spacing', 0.02, .15, .01, .05],
            ['eccentricity', 'Ellipse Amount', 0, 1, .05, .5],
            ['noiseWarp', 'Noise Warp', 0, 1, .05, .4]
        ],
        toggles: [['elliptic', 'Elliptic Mode', false], ['fill', 'Fill Rings', false]]
    },
    chaosTunnel: {
        label: '🌌 Chaos Tunnel',
        params: [
            ['depth', 'Depth', 4, 40, 2, 18],
            ['twist', 'Twist Amount', 0, 4, .1, 1],
            ['cornerBase', 'Base Corners', 3, 12, 1, 4],
            ['zoomPulse', 'Zoom Pulse', 0, 2, .1, .5]
        ],
        toggles: [['connectLines', 'Connect Layers', true], ['fillFaces', 'Fill Faces', false]]
    },
    noiseField: {
        label: '〰 Noise Field',
        params: [
            ['scale', 'Noise Scale', .001, .03, .001, .008],
            ['warp', 'Warp Amount', 0, 4, .1, 1.5],
            ['step', 'Grid Step', 8, 40, 2, 20],
            ['arrowLen', 'Arrow Length', 0.2, 1.2, .05, .65]
        ],
        toggles: [['curl', 'Curl Mode', false]],
        selects: [['colorMode', 'Color Mode', ['Hue Gradient', 'Mono White', 'Speed-Based', 'Band-Based'], 0]]
    },
    plasmaWave: {
        label: '🌊 Plasma Wave',
        params: [
            ['scaleA', 'Wave Scale A', 0.5, 8, .1, 2.5],
            ['scaleB', 'Wave Scale B', 0.5, 8, .1, 1.8],
            ['scaleC', 'Wave Scale C', 0.5, 8, .1, 3.2],
            ['speed', 'Speed', 0.2, 4, .1, 1.0],
            ['complexity', 'Layers', 1, 6, 1, 3],
            ['pixelSize', 'Pixel Size', 2, 20, 1, 6],
            ['contrast', 'Contrast', 0.5, 3, .1, 1.2]
        ]
    },
    crystalWeb: {
        label: '🔮 Crystal Web',
        params: [
            ['faces', 'Vertices', 4, 60, 2, 20],
            ['spinX', 'Spin X', 0, 2, .05, .4],
            ['spinY', 'Spin Y', 0, 2, .05, .7],
            ['spinZ', 'Spin Z', 0, 2, .05, .3],
            ['perspective', 'Perspective', 1, 5, .1, 2.2],
            ['edgeGlow', 'Edge Glow', 0, 1, .05, .7],
            ['vertexGlow', 'Vertex Glow', 0, 1, .05, .5]
        ],
        toggles: [['wireframe', 'Wireframe Mode', true]]
    },
    bloomPetals: {
        label: '🌺 Bloom Petals',
        params: [
            ['petals', 'Petal Count', 3, 24, 1, 7],
            ['layers', 'Layers', 1, 5, 1, 3],
            ['petalLen', 'Petal Length', 0.2, 1.2, .05, .8],
            ['petalWidth', 'Petal Width', 0.1, 1, .05, .4],
            ['rotSpeed', 'Rotation Speed', 0, 2, .05, .6],
            ['breathe', 'Breathe Amount', 0, 1, .05, .5]
        ],
        toggles: [['innerRing', 'Inner Ring', true]]
    },
    lightningArc: {
        label: '⚡ Lightning Arc',
        params: [
            ['arcs', 'Arc Count', 1, 12, 1, 4],
            ['forkDepth', 'Fork Depth', 2, 8, 1, 5],
            ['spread', 'Spread', 0.1, 1, .05, .6],
            ['glowWidth', 'Glow Width', 1, 8, .5, 3],
            ['drift', 'Arc Drift', 0, 1, .05, .3]
        ],
        toggles: [['restrikeBeat', 'Restrike on Beat', true]]
    },
    orbitWeb: {
        label: '🪐 Orbit Web',
        params: [
            ['bodies', 'Body Count', 2, 12, 1, 5],
            ['trailLen', 'Trail Length', 20, 300, 10, 120],
            ['gravity', 'Gravity', 0.1, 3, .1, .8],
            ['initVel', 'Init Velocity', 0.1, 2, .05, .6]
        ],
        toggles: [['connectLines', 'Connect Bodies', true], ['trailFade', 'Trail Fade', true]]
    }
};

export const MOD_RANGES = {
    pinwheels: { wheelCount: [1, 12], bladeCount: [3, 20], ringCount: [2, 14], orbitDrift: [0, 1], bladeSkew: [0, 1], hubGlow: [0, 1], altColoring: [0, 1], blend: [.3, 1] },
    fractureWeb: { lines: [10, 120], webDepth: [1, 7], spreadAngle: [0, 2], colorShift: [0, 180], webSpin: [0, 1], blend: [.3, 1] },
    lissajous: { freqA: [1, 12], freqB: [1, 12], density: [50, 400], layers: [1, 6], phaseSpeed: [0, 3], strokeW: [.5, 5], blend: [.3, 1] },
    spirograph: { R: [.2, .8], r: [.05, .4], d: [.05, .5], passes: [1, 4], traceSpeed: [.5, 3], strokeW: [.5, 5], blend: [.3, 1] },
    particleStorm: { count: [100, 1000], turbulence: [0, 2], trailLen: [0, 20], gravity: [-.5, .5], blend: [.3, 1] },
    kaleidoscope: { segments: [2, 24], morphSpeed: [0, 3], noiseScale: [.1, 1], fillOpacity: [0, 1], strokeW: [.5, 5], blend: [.3, 1] },
    moireGrid: { gridSize: [5, 60], layers: [1, 4], rotSpeed: [0, .05], lineW: [.3, 4], blend: [.3, 1] },
    pulseRings: { ringN: [3, 30], thickness: [.2, 5], spacing: [.02, .15], eccentricity: [0, 1], noiseWarp: [0, 1], blend: [.3, 1] },
    chaosTunnel: { depth: [4, 40], twist: [0, 4], cornerBase: [3, 12], zoomPulse: [0, 2], blend: [.3, 1] },
    noiseField: { scale: [.001, .03], warp: [0, 4], step: [8, 40], arrowLen: [.2, 1.2], blend: [.3, 1] },
    plasmaWave: { scaleA: [.5, 8], scaleB: [.5, 8], scaleC: [.5, 8], speed: [.2, 4], complexity: [1, 6], pixelSize: [2, 20], contrast: [.5, 3], blend: [.3, 1] },
    crystalWeb: { faces: [4, 60], spinX: [0, 2], spinY: [0, 2], spinZ: [0, 2], perspective: [1, 5], edgeGlow: [0, 1], vertexGlow: [0, 1], blend: [.3, 1] },
    bloomPetals: { petals: [3, 24], layers: [1, 5], petalLen: [.2, 1.2], petalWidth: [.1, 1], rotSpeed: [0, 2], breathe: [0, 1], blend: [.3, 1] },
    lightningArc: { arcs: [1, 12], forkDepth: [2, 8], spread: [.1, 1], glowWidth: [1, 8], drift: [0, 1], blend: [.3, 1] },
    orbitWeb: { bodies: [2, 12], trailLen: [20, 300], gravity: [.1, 3], initVel: [.1, 2], blend: [.3, 1] }
};

// Instance id counter (monotonically increasing, never reused)
let _modIdCounter = 10;
export function nextModId() { return ++_modIdCounter; }

/** Create a fresh instance object for a given module type */
export function makeModInstance(type, idSuffix) {
    const d = MOD_DEFAULTS[type];
    const inst = JSON.parse(JSON.stringify(d));
    inst.type = type;
    inst.id = `${type}_${idSuffix}`;
    inst.hueRange = { start: 0, end: 360 };
    return inst;
}

// Global params object — mutated in place by UI
export const params = {
    seed: 42,
    spinSpeed: .012,
    audioReact: 2,
    hueSpeed: 1,
    chaos: .2,
    persist: .3,
    brightness: 1,
    saturation: 1,
    hueRange: { start: 0, end: 360 },
    moduleList: [Object.assign(makeModInstance('pinwheels', 0), { on: true })]
};

export const defParams = JSON.parse(JSON.stringify(params));

// ── O(1) module registry (Map-based lookup) ──
const modRegistry = new Map();

/** Must be called after any mutation to params.moduleList */
export function rebuildModRegistry() {
    modRegistry.clear();
    for (const m of params.moduleList) modRegistry.set(m.id, m);
}

// Initial build
rebuildModRegistry();

export function getModById(id) {
    return modRegistry.get(id) ?? null;
}

export function getModIndex(id) {
    for (let i = 0; i < params.moduleList.length; i++) {
        if (params.moduleList[i].id === id) return i;
    }
    return -1;
}

/** Get first instance of a type (used by chain helpers & CMP fallback) */
export function getFirstModOfType(type) {
    for (const m of params.moduleList) {
        if (m.type === type) return m;
    }
    return null;
}

/** Format a param value for display */
export function fmtV(v) {
    if (typeof v !== 'number') return v;
    return Math.abs(v) < .1 && v !== 0 ? v.toFixed(3) : v % 1 === 0 ? v : v.toFixed(2);
}
