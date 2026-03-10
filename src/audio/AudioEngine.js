// ═══════════════════════════════════════════════════════
// AUDIO ENGINE
// Handles microphone input, frequency analysis, and meter UI.
// All live signal values are held on the exported `audioState`
// object so other modules can read them without needing callback.
// ═══════════════════════════════════════════════════════

// Mutable audio state — read by AudioMapping and draw modules
export const audioState = {
    micOn: false,
    sVol: 0, sBass: 0, sMid: 0, sHi: 0,
    beatDetect: 0, beatTimer: 0,
    peakVol: 0, peakBass: 0, peakMid: 0, peakHi: 0
};

const PEAK_DECAY = 0.995;

let actx = null;
let analyserNode = null;
let micStream = null;
let freqData = null;

// Cached DOM refs — populated lazily on first use (set after DOM ready)
let _fftCanvas = null;
let _fftCtx = null;
let _meterEls = null;

function getMeterEls() {
    if (!_meterEls) {
        _meterEls = {
            mVol: document.getElementById('mVol'),
            mVolV: document.getElementById('mVolV'),
            mBass: document.getElementById('mBass'),
            mBassV: document.getElementById('mBassV'),
            mMid: document.getElementById('mMid'),
            mMidV: document.getElementById('mMidV'),
            mHi: document.getElementById('mHi'),
            mHiV: document.getElementById('mHiV'),
            mBeat: document.getElementById('mBeat'),
            mBeatV: document.getElementById('mBeatV'),
            beatFlash: document.getElementById('beatFlash'),
            micBadge: document.getElementById('micBadge'),
            micBtn: document.querySelector('[onclick="toggleMic()"]')
        };
    }
    return _meterEls;
}

function getFFTCanvas() {
    if (!_fftCanvas) _fftCanvas = document.getElementById('fftCanvas');
    return _fftCanvas;
}

function getFFTCtx() {
    if (!_fftCtx) {
        const c = getFFTCanvas();
        if (c) _fftCtx = c.getContext('2d');
    }
    return _fftCtx;
}

// Call after canvas resize to clear cached FFT canvas width
export function invalidateFFTCanvas() {
    _fftCanvas = null;
    _fftCtx = null;
}

export function toggleMic() {
    if (audioState.micOn) stopMic(); else startMic();
}

export async function startMic() {
    const els = getMeterEls();
    if (els.micBadge) { els.micBadge.textContent = 'Requesting...'; els.micBadge.className = 'mic-badge pend'; }
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        actx = new (window.AudioContext || window.webkitAudioContext)();
        analyserNode = actx.createAnalyser();
        analyserNode.fftSize = 1024;
        analyserNode.smoothingTimeConstant = 0.75;
        freqData = new Uint8Array(analyserNode.frequencyBinCount);
        actx.createMediaStreamSource(micStream).connect(analyserNode);
        audioState.micOn = true;
        if (els.micBadge) { els.micBadge.textContent = '🎤 Live'; els.micBadge.className = 'mic-badge on'; }
        if (els.micBtn) els.micBtn.textContent = '🔇 Disable Mic';
    } catch (e) {
        if (els.micBadge) { els.micBadge.textContent = 'Access denied'; els.micBadge.className = 'mic-badge off'; }
    }
}

export function stopMic() {
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    if (actx) actx.close();
    audioState.micOn = false;
    Object.assign(audioState, { sVol: 0, sBass: 0, sMid: 0, sHi: 0, beatDetect: 0, peakVol: 0, peakBass: 0, peakMid: 0, peakHi: 0, beatTimer: 0 });
    const els = getMeterEls();
    if (els.micBadge) { els.micBadge.textContent = 'Microphone inactive'; els.micBadge.className = 'mic-badge off'; }
    if (els.micBtn) els.micBtn.textContent = '🎤 Enable Microphone';
    updateMeterUI(0, 0, 0, 0, 0);
    if (els.beatFlash) els.beatFlash.classList.remove('active');
}

/** Must be called once per draw() frame to update audio state */
export function getAudio() {
    if (!audioState.micOn || !analyserNode) return;
    analyserNode.getByteFrequencyData(freqData);
    const n = freqData.length;
    let s = 0, bs = 0, ms = 0, hs = 0;
    for (let i = 0; i < n; i++) {
        s += freqData[i];
        if (i < n * .06) bs += freqData[i];
        else if (i < n * .25) ms += freqData[i];
        else hs += freqData[i];
    }
    const vol = s / (n * 255);
    const bass = bs / (n * .06 * 255);
    const mid = ms / (n * .19 * 255);
    const hi = hs / (n * .75 * 255);

    audioState.sVol = audioState.sVol * .82 + vol * .18;
    audioState.sBass = audioState.sBass * .7 + bass * .3;
    audioState.sMid = audioState.sMid * .8 + mid * .2;
    audioState.sHi = audioState.sHi * .85 + hi * .15;

    if (audioState.sVol > audioState.peakVol) audioState.peakVol = audioState.sVol; else audioState.peakVol *= PEAK_DECAY;
    if (audioState.sBass > audioState.peakBass) audioState.peakBass = audioState.sBass; else audioState.peakBass *= PEAK_DECAY;
    if (audioState.sMid > audioState.peakMid) audioState.peakMid = audioState.sMid; else audioState.peakMid *= PEAK_DECAY;
    if (audioState.sHi > audioState.peakHi) audioState.peakHi = audioState.sHi; else audioState.peakHi *= PEAK_DECAY;

    // Beat detection (uses p5 frameCount global)
    if (audioState.sBass > .18) {
        if (frameCount - audioState.beatTimer > 8) {
            audioState.beatDetect = 1;
            audioState.beatTimer = frameCount;
        } else {
            audioState.beatDetect *= 0.9;
        }
    } else {
        audioState.beatDetect *= 0.88;
    }

    updateMeterUI(audioState.sVol, audioState.sBass, audioState.sMid, audioState.sHi, audioState.beatDetect);
    drawFFT();
}

export function updateMeterUI(vol, bass, mid, hi, beat) {
    const els = getMeterEls();
    function sb(el, vel, v, cap) {
        if (el) el.style.width = Math.min(v / cap, 1) * 100 + '%';
        if (vel) vel.textContent = v.toFixed(2);
    }
    sb(els.mVol, els.mVolV, vol, .4);
    sb(els.mBass, els.mBassV, bass, .6);
    sb(els.mMid, els.mMidV, mid, .5);
    sb(els.mHi, els.mHiV, hi, .4);
    if (els.mBeat) els.mBeat.style.width = Math.min(beat, 1) * 100 + '%';
    if (els.mBeatV) els.mBeatV.textContent = beat.toFixed(2);
    if (els.beatFlash) {
        if (beat > .6) els.beatFlash.classList.add('active');
        else els.beatFlash.classList.remove('active');
    }
}

export function drawFFT() {
    const c = getFFTCanvas();
    if (!c || !analyserNode || !freqData) return;
    // Sync canvas width to its container (only on first call or after resize)
    if (c.parentElement) {
        const pw = c.parentElement.offsetWidth || c.parentElement.clientWidth || 300;
        if (c.width !== pw) { c.width = pw; _fftCtx = null; }
    }
    const ctx = getFFTCtx();
    if (!ctx) return;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(8,8,8,.85)';
    ctx.fillRect(0, 0, W, H);

    const zones = [
        { e: .04, col: 'rgba(180,80,220,.15)' },
        { e: .10, col: 'rgba(217,119,87,.15)' },
        { e: .20, col: 'rgba(200,150,60,.12)' },
        { e: .40, col: 'rgba(106,155,204,.12)' },
        { e: .70, col: 'rgba(100,200,160,.10)' },
        { e: 1, col: 'rgba(180,140,220,.09)' }
    ];
    let px = 0;
    for (let z = 0; z < zones.length; z++) {
        const zx = zones[z].e * W;
        ctx.fillStyle = zones[z].col;
        ctx.fillRect(px, 0, zx - px, H);
        if (z > 0) {
            ctx.strokeStyle = 'rgba(255,255,255,.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, H);
            ctx.stroke();
        }
        px = zx;
    }

    const n = freqData.length;
    const bins = Math.floor(n * .75);
    for (let i = 0; i < bins; i++) {
        const v = freqData[i] / 255;
        const x = (i / bins) * W;
        const bw = Math.max(1, W / bins);
        const bh = v * H * .88;
        const frac = i / bins;
        const hue = frac < .04 ? 280 : frac < .10 ? 20 : frac < .20 ? 40 : frac < .40 ? 200 : frac < .70 ? 160 : 270;
        ctx.fillStyle = `hsla(${hue},${70 + v * 30}%,${40 + v * 60}%,${0.5 + v * .5})`;
        ctx.fillRect(x, H - bh, bw - .5, bh);
        if (bh > 2) {
            ctx.fillStyle = `hsla(${hue},90%,92%,.7)`;
            ctx.fillRect(x, H - bh - 1, bw - .5, 2);
        }
    }

    if (audioState.beatDetect > .5) {
        ctx.fillStyle = `rgba(255,107,53,${audioState.beatDetect * .15})`;
        ctx.fillRect(0, 0, W, H);
    }

    const lbls = [
        { x: .02, t: 'SUB' }, { x: .07, t: 'BASS' }, { x: .15, t: 'LO-MID' },
        { x: .30, t: 'MID' }, { x: .55, t: 'HI-MID' }, { x: .82, t: 'AIR' }
    ];
    ctx.font = 'bold 7px monospace';
    for (const l of lbls) {
        ctx.fillStyle = 'rgba(255,255,255,.28)';
        ctx.fillText(l.t, l.x * W + 2, 9);
    }
}

// ── Synthetic signal for when mic is off (keeps motors ticking) ──
// These replicate the original av()/abass()/amid()/ahi() helpers
export function av() { return audioState.micOn ? audioState.sVol : 0.03 * Math.abs(Math.sin(frameCount * .04)); }
export function abass() { return audioState.micOn ? audioState.sBass : 0.025 * Math.abs(Math.sin(frameCount * .025)); }
export function amid() { return audioState.micOn ? audioState.sMid : 0.02 * Math.abs(Math.sin(frameCount * .033)); }
export function ahi() { return audioState.micOn ? audioState.sHi : 0.015 * Math.abs(Math.sin(frameCount * .05)); }
