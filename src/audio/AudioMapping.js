// ═══════════════════════════════════════════════════════
// AUDIO MAPPING SYSTEM
// Maps 5 "effect slots" to configurable source bands + gain.
// Draw functions call AR(slot) to get the resolved signal.
// Per-module instances can provide audioOverride:{} to
// reroute individual slots for that instance only.
// ═══════════════════════════════════════════════════════

import { audioState } from './AudioEngine.js';
import { params } from '../state/params.js';
import { rs } from '../renderer/rendererState.js';

export const AMAP_SLOTS = ['vol', 'bass', 'mid', 'hi', 'beat'];

export const AMAP_SLOT_META = {
    vol: { label: 'Drive', desc: 'Overall motion & speed', color: '#788c5d' },
    bass: { label: 'Punch', desc: 'Explosive scale / hit', color: '#d97757' },
    mid: { label: 'Sweep', desc: 'Frequency sweep effects', color: '#6a9bcc' },
    hi: { label: 'Shimmer', desc: 'Fine detail & sparkle', color: '#b07acc' },
    beat: { label: 'Beat Hit', desc: 'Percussive triggers', color: '#ff6b35' }
};

export const AMAP_SRC_META = {
    vol: { label: 'Vol', color: '#788c5d' },
    bass: { label: 'Bass', color: '#d97757' },
    mid: { label: 'Mid', color: '#6a9bcc' },
    hi: { label: 'Hi', color: '#b07acc' },
    beat: { label: 'Beat', color: '#ff6b35' }
};

// Active mapping: each slot has { src, gain }
export const audioMapping = {
    vol: { src: 'vol', gain: 1 },
    bass: { src: 'bass', gain: 1 },
    mid: { src: 'mid', gain: 1 },
    hi: { src: 'hi', gain: 1 },
    beat: { src: 'beat', gain: 1 }
};

export const AMAP_BUILTINS = [
    { name: 'Default', map: { vol: { src: 'vol', gain: 1 }, bass: { src: 'bass', gain: 1 }, mid: { src: 'mid', gain: 1 }, hi: { src: 'hi', gain: 1 }, beat: { src: 'beat', gain: 1 } } },
    { name: 'Bass Heavy', map: { vol: { src: 'bass', gain: 1.6 }, bass: { src: 'bass', gain: 2.2 }, mid: { src: 'bass', gain: 0.9 }, hi: { src: 'mid', gain: 0.5 }, beat: { src: 'beat', gain: 1.4 } } },
    { name: 'Treble Lead', map: { vol: { src: 'hi', gain: 2 }, bass: { src: 'mid', gain: 0.8 }, mid: { src: 'hi', gain: 1.8 }, hi: { src: 'hi', gain: 2.5 }, beat: { src: 'beat', gain: 0.7 } } },
    { name: 'Beat Centric', map: { vol: { src: 'beat', gain: 1.4 }, bass: { src: 'beat', gain: 2.2 }, mid: { src: 'bass', gain: 0.6 }, hi: { src: 'hi', gain: 0.7 }, beat: { src: 'beat', gain: 2.5 } } },
    { name: 'Subtle', map: { vol: { src: 'vol', gain: 0.4 }, bass: { src: 'bass', gain: 0.5 }, mid: { src: 'mid', gain: 0.4 }, hi: { src: 'hi', gain: 0.3 }, beat: { src: 'beat', gain: 0.5 } } },
    { name: 'Inverted', map: { vol: { src: 'hi', gain: 1.4 }, bass: { src: 'hi', gain: 1.8 }, mid: { src: 'mid', gain: 1 }, hi: { src: 'bass', gain: 1.8 }, beat: { src: 'beat', gain: 1 } } },
    { name: 'Mid Focus', map: { vol: { src: 'mid', gain: 1.5 }, bass: { src: 'mid', gain: 1.2 }, mid: { src: 'mid', gain: 2 }, hi: { src: 'hi', gain: 0.8 }, beat: { src: 'beat', gain: 1 } } }
];

export let _amapActivePreset = 'Default';
const AMAP_LS_KEY = 'chromatic_vertigo_audiomaps';

export function amapLoadUser() {
    try { const r = localStorage.getItem(AMAP_LS_KEY); return r ? JSON.parse(r) : []; }
    catch (e) { return []; }
}
export function amapSaveUser(list) {
    try { localStorage.setItem(AMAP_LS_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

/** Get the raw signal level for a named source band */
export function amapRawSignal(src) {
    switch (src) {
        case 'vol': return audioState.micOn ? audioState.sVol : 0.03 * Math.abs(Math.sin(frameCount * .04));
        case 'bass': return audioState.micOn ? audioState.sBass : 0.025 * Math.abs(Math.sin(frameCount * .025));
        case 'mid': return audioState.micOn ? audioState.sMid : 0.02 * Math.abs(Math.sin(frameCount * .033));
        case 'hi': return audioState.micOn ? audioState.sHi : 0.015 * Math.abs(Math.sin(frameCount * .05));
        case 'beat': return audioState.beatDetect;
        default: return 0;
    }
}

/**
 * Core accessor called from every draw function.
 * slot: 'vol'|'bass'|'mid'|'hi'|'beat'
 * Returns: resolvedSignal * gain * params.audioReact
 */
export function AR(slot) {
    const ov = rs.activeModInst && rs.activeModInst.audioOverride;
    const m = (ov && ov[slot]) || audioMapping[slot] || { src: slot, gain: 1 };
    return amapRawSignal(m.src) * m.gain * params.audioReact;
}

export function applyAmapPreset(mapObj, presetName) {
    Object.assign(audioMapping, JSON.parse(JSON.stringify(mapObj)));
    _amapActivePreset = presetName || '';
    renderAmapSlots();
    renderAmapPresetChips();
}

export function saveAudioMapping() {
    const name = document.getElementById('amapSaveName').value.trim();
    if (!name) return;
    const list = amapLoadUser();
    const idx = list.findIndex(x => x.name === name);
    const entry = { name, map: JSON.parse(JSON.stringify(audioMapping)) };
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    amapSaveUser(list);
    document.getElementById('amapSaveName').value = '';
    _amapActivePreset = name;
    renderAmapUserSection();
    renderAmapPresetChips();
}

export function toggleAmapPanel() {
    const panel = document.getElementById('amapPanel');
    const arrow = document.getElementById('amapArrow');
    const open = panel.style.display === 'none';
    panel.style.display = open ? 'block' : 'none';
    arrow.classList.toggle('open', open);
}

export function renderAmapUI() {
    renderAmapPresetChips();
    renderAmapUserSection();
    renderAmapSlots();
}

export function renderAmapPresetChips() {
    const row = document.getElementById('amapBuiltinRow');
    if (!row) return;
    row.innerHTML = '';
    AMAP_BUILTINS.forEach(p => {
        const chip = document.createElement('span');
        chip.className = 'amap-preset-chip' + (p.name === _amapActivePreset ? ' active' : '');
        chip.textContent = p.name;
        chip.onclick = () => applyAmapPreset(p.map, p.name);
        row.appendChild(chip);
    });
}

export function renderAmapUserSection() {
    const sec = document.getElementById('amapUserSection');
    if (!sec) return;
    const list = amapLoadUser();
    sec.innerHTML = '';
    if (list.length === 0) return;
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:10px;font-weight:600;color:var(--mid);margin:8px 0 5px;text-transform:uppercase;letter-spacing:.5px';
    lbl.textContent = 'Saved Mappings';
    sec.appendChild(lbl);
    list.forEach((um, i) => {
        const row = document.createElement('div'); row.className = 'amap-user-preset';
        const chip = document.createElement('span');
        chip.className = 'amap-preset-chip' + (um.name === _amapActivePreset ? ' active' : '');
        chip.textContent = um.name;
        chip.onclick = () => applyAmapPreset(um.map, um.name);
        const del = document.createElement('button');
        del.className = 'amap-del-btn'; del.textContent = '✕'; del.title = 'Delete';
        del.onclick = () => {
            const l = amapLoadUser(); l.splice(i, 1); amapSaveUser(l);
            if (_amapActivePreset === list[i].name) _amapActivePreset = '';
            renderAmapUserSection();
        };
        row.appendChild(chip); row.appendChild(del);
        sec.appendChild(row);
    });
    const spacer = document.createElement('div'); spacer.style.height = '6px'; sec.appendChild(spacer);
}

export function renderAmapSlots() {
    const container = document.getElementById('amapSlots');
    if (!container) return;
    container.innerHTML = '';
    AMAP_SLOTS.forEach(slot => {
        const meta = AMAP_SLOT_META[slot];
        const m = audioMapping[slot] || { src: slot, gain: 1 };
        const box = document.createElement('div'); box.className = 'amap-slot';

        const head = document.createElement('div'); head.className = 'amap-slot-head';
        const dot = document.createElement('span'); dot.className = 'amap-slot-dot'; dot.style.background = meta.color;
        const name = document.createElement('span'); name.className = 'amap-slot-name'; name.textContent = meta.label;
        const desc = document.createElement('span'); desc.style.cssText = 'font-size:8px;color:var(--mid);'; desc.textContent = meta.desc;
        head.appendChild(dot); head.appendChild(name);
        box.appendChild(head); box.appendChild(desc);

        // Source selector chips
        const srcRow = document.createElement('div'); srcRow.className = 'amap-src-chips'; srcRow.style.marginTop = '5px';
        AMAP_SLOTS.forEach(src => {
            const srcMeta = AMAP_SRC_META[src];
            const chip = document.createElement('span');
            chip.className = 'amap-src-chip' + (m.src === src ? ' active' : '');
            chip.textContent = srcMeta.label;
            chip.onclick = function () {
                audioMapping[slot].src = src;
                _amapActivePreset = '';
                box.querySelectorAll('.amap-src-chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                renderAmapPresetChips(); renderAmapUserSection();
            };
            srcRow.appendChild(chip);
        });
        box.appendChild(srcRow);

        // Gain slider
        const gainRow = document.createElement('div'); gainRow.className = 'amap-gain-row';
        const gainLbl = document.createElement('label'); gainLbl.textContent = 'Gain';
        const gs = document.createElement('input'); gs.type = 'range'; gs.min = '0'; gs.max = '3'; gs.step = '.05'; gs.value = m.gain;
        const gv = document.createElement('span'); gv.className = 'val'; gv.textContent = parseFloat(m.gain).toFixed(2);
        gs.oninput = function () {
            audioMapping[slot].gain = parseFloat(this.value);
            gv.textContent = parseFloat(this.value).toFixed(2);
            _amapActivePreset = '';
            renderAmapPresetChips(); renderAmapUserSection();
        };
        gainRow.appendChild(gainLbl); gainRow.appendChild(gs); gainRow.appendChild(gv);
        box.appendChild(gainRow);
        container.appendChild(box);
    });
}

// ── Per-module audio override UI ──
export function toggleModAov(id) {
    // Imported lazily to avoid circular dep at module evaluation time
    const { getModById } = window._cv_params || {};
    const m = getModById ? getModById(id) : null; if (!m) return;
    if (m.audioOverride) {
        delete m.audioOverride;
        const tog = document.getElementById('aov-tog-' + id); if (tog) tog.classList.remove('on');
        const body = document.getElementById('aov-body-' + id); if (body) { body.classList.remove('open'); body.innerHTML = ''; }
    } else {
        m.audioOverride = JSON.parse(JSON.stringify(audioMapping));
        const tog = document.getElementById('aov-tog-' + id); if (tog) tog.classList.add('on');
        const body = document.getElementById('aov-body-' + id); if (body) { body.classList.add('open'); buildModAovUI(body, m); }
    }
}

export function buildModAovUI(container, inst) {
    container.innerHTML = '';
    if (!inst.audioOverride) return;
    AMAP_SLOTS.forEach(slot => {
        const meta = AMAP_SLOT_META[slot];
        const ov = inst.audioOverride;
        const m = ov[slot] || { src: slot, gain: 1 };

        const slotDiv = document.createElement('div'); slotDiv.className = 'mod-aov-slot';
        const sHead = document.createElement('div'); sHead.className = 'mod-aov-slot-head';
        const dot = document.createElement('span'); dot.className = 'amap-slot-dot';
        dot.style.cssText = `width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${meta.color}`;
        const sName = document.createElement('span'); sName.textContent = meta.label;
        sHead.appendChild(dot); sHead.appendChild(sName);
        slotDiv.appendChild(sHead);

        const srcRow = document.createElement('div'); srcRow.className = 'amap-src-chips';
        AMAP_SLOTS.forEach(src => {
            const sm = AMAP_SRC_META[src];
            const chip = document.createElement('span');
            chip.className = 'amap-src-chip' + (m.src === src ? ' active' : '');
            chip.textContent = sm.label; chip.style.fontSize = '7px'; chip.style.padding = '1px 5px';
            chip.onclick = function () {
                m.src = src;
                srcRow.querySelectorAll('.amap-src-chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
            };
            srcRow.appendChild(chip);
        });
        slotDiv.appendChild(srcRow);

        const gainRow = document.createElement('div'); gainRow.className = 'amap-gain-row'; gainRow.style.marginTop = '2px';
        const gl = document.createElement('label'); gl.textContent = 'Gain';
        const gs = document.createElement('input'); gs.type = 'range'; gs.min = '0'; gs.max = '3'; gs.step = '.05'; gs.value = m.gain;
        const gv = document.createElement('span'); gv.className = 'val'; gv.textContent = parseFloat(m.gain).toFixed(2);
        gs.oninput = function () { m.gain = parseFloat(this.value); gv.textContent = parseFloat(this.value).toFixed(2); };
        gainRow.appendChild(gl); gainRow.appendChild(gs); gainRow.appendChild(gv);
        slotDiv.appendChild(gainRow);
        container.appendChild(slotDiv);
    });
}
