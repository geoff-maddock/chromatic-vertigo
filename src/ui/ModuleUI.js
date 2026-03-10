// ═══════════════════════════════════════════════════════
// MODULE UI
// Build the per-instance module cards in the sidebar.
// ═══════════════════════════════════════════════════════

import {
    params, MOD_SPECS, MOD_RANGES, makeModInstance, nextModId,
    getModById, getModIndex, rebuildModRegistry, fmtV
}
    from '../state/params.js';
import { buildHuePicker } from './HuePicker.js';
import { toggleModAov, buildModAovUI } from '../audio/AudioMapping.js';

// Forward-ref (set from Renderer.js via window to avoid circular dep)
function getDoInitSys() { return window._cv_doInitSys || (() => { }); }

export function buildModUI() {
    const c = document.getElementById('modList'); if (!c) return;
    c.innerHTML = '';

    params.moduleList.forEach(m => {
        const k = m.type, id = m.id;
        const spec = MOD_SPECS[k];
        const sameType = params.moduleList.filter(x => x.type === k);
        const instLabel = sameType.length > 1 ? ' #' + (sameType.indexOf(m) + 1) : '';

        const card = document.createElement('div');
        card.className = 'mod-card' + (m.on ? ' active' : ''); card.id = 'card-' + id;

        let head = `<div class="mod-head" onclick="expandMod('${id}')">`;
        head += `<span class="mod-name">${spec.label}${instLabel}</span>`;
        head += `<button class="mod-toggle${m.on ? ' on' : ''}" id="tog-${id}" onclick="event.stopPropagation();toggleMod('${id}')"></button>`;
        head += '</div>';

        let body = '<div class="mod-body">';
        body += `<div class="blend-row"><span>Blend</span><input type="range" min="0" max="1" step=".05" value="${m.blend}" oninput="setModP('${id}','blend',+this.value,'bl-${id}')"><span class="val" id="bl-${id}">${m.blend.toFixed(2)}</span></div>`;
        body += '<div class="mod-params">';

        if (spec.params) {
            spec.params.forEach(p => {
                const pid = id + '__' + p[0], val = m[p[0]] !== undefined ? m[p[0]] : p[5];
                body += `<div class="cg"><label>${p[1]}</label><div class="srow"><input type="range" id="${pid}" min="${p[2]}" max="${p[3]}" step="${p[4]}" value="${val}" oninput="setModP('${id}','${p[0]}',+this.value,'${pid}-v')"><span class="val" id="${pid}-v">${fmtV(val)}</span></div></div>`;
            });
        }
        if (spec.toggles) {
            spec.toggles.forEach(t => {
                const tid = id + '__' + t[0], val = m[t[0]] !== undefined ? m[t[0]] : t[2];
                body += `<div class="cg" style="display:flex;align-items:center;gap:8px;"><label style="margin:0;flex:1;">${t[1]}</label><button class="mod-toggle${val ? ' on' : ''}" id="${tid}" onclick="toggleModBool('${id}','${t[0]}','${tid}')"></button></div>`;
            });
        }
        if (spec.selects) {
            spec.selects.forEach(s => {
                const sid = id + '__' + s[0], val = m[s[0]] !== undefined ? m[s[0]] : s[3];
                let sel = `<div class="cg"><label>${s[1]}</label><select id="${sid}" onchange="setModP('${id}','${s[0]}',+this.value,null)" style="width:100%;padding:4px;border:1px solid var(--lgray);border-radius:5px;font-size:11px;background:var(--light);">`;
                s[2].forEach((opt, i) => { sel += `<option value="${i}"${val == i ? ' selected' : ''}>${opt}</option>`; });
                sel += '</select></div>';
                body += sel;
            });
        }

        body += '</div>'; // mod-params
        body += `<div id="hpick-${id}" class="hue-picker" style="margin-top:4px;padding-top:6px;border-top:1px solid var(--lgray)"></div>`;
        body += `<div class="mod-aov-toggle" onclick="toggleModAov('${id}')">`;
        body += '<span class="amap-slot-dot" style="background:#d97757"></span>';
        body += '<span>Audio Override</span>';
        body += `<button class="mod-toggle" id="aov-tog-${id}"></button>`;
        body += '</div>';
        body += `<div class="mod-aov-body" id="aov-body-${id}"></div>`;
        body += '<div class="mod-footer">';
        body += `<button class="btn sml" style="flex:1" onclick="randomizeMod('${id}')">🎲 Random</button>`;
        body += `<button class="btn sml" style="flex:1" onclick="resetMod('${id}')">↺ Reset</button>`;
        body += `<button class="btn sml" style="flex:1" onclick="duplicateMod('${id}')" title="Duplicate">⊕ Dupe</button>`;
        body += `<button class="btn sml" style="color:#c05a3a;flex:0 0 auto" onclick="deleteMod('${id}')" title="Remove">✕</button>`;
        body += '</div></div>'; // mod-footer / mod-body

        card.innerHTML = head + body;
        c.appendChild(card);
    });

    // Add-module panel
    const addRow = document.createElement('div'); addRow.style.marginTop = '8px';
    addRow.innerHTML = '<div style="font-size:10px;font-weight:600;color:var(--mid);margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">+ Add Module</div>';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px;';
    Object.keys(MOD_SPECS).forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'btn sml';
        btn.style.cssText = 'text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        btn.textContent = MOD_SPECS[type].label;
        btn.onclick = () => addModInstance(type);
        grid.appendChild(btn);
    });
    addRow.appendChild(grid); c.appendChild(addRow);

    // Hue pickers + audio override UIs
    params.moduleList.forEach(m => {
        const el = document.getElementById('hpick-' + m.id);
        if (el) buildHuePicker(el, 'Hue Range', m.hueRange, (s, e) => { m.hueRange.start = s; m.hueRange.end = e; });
        const aovEl = document.getElementById('aov-body-' + m.id);
        if (aovEl) buildModAovUI(aovEl, m);
    });
}

export function addModInstance(type) {
    const inst = makeModInstance(type, nextModId());
    inst.on = true;
    params.moduleList.push(inst);
    rebuildModRegistry();
    if (type === 'pinwheels' || type === 'particleStorm') getDoInitSys()();
    buildModUI();
    const card = document.getElementById('card-' + inst.id);
    if (card) { const body = card.querySelector('.mod-body'); if (body) body.style.display = 'block'; }
}

export function duplicateMod(id) {
    const idx = getModIndex(id); if (idx < 0) return;
    const src = params.moduleList[idx];
    const inst = JSON.parse(JSON.stringify(src));
    inst.id = src.type + '_' + nextModId();
    params.moduleList.splice(idx + 1, 0, inst);
    rebuildModRegistry();
    if (inst.type === 'pinwheels' || inst.type === 'particleStorm') getDoInitSys()();
    buildModUI();
    const card = document.getElementById('card-' + inst.id);
    if (card) { const body = card.querySelector('.mod-body'); if (body) body.style.display = 'block'; }
}

export function deleteMod(id) {
    const idx = getModIndex(id); if (idx < 0) return;
    if (params.moduleList.length <= 1) { alert('At least one module instance must remain.'); return; }
    const type = params.moduleList[idx].type;
    params.moduleList.splice(idx, 1);
    rebuildModRegistry();
    if (type === 'pinwheels' || type === 'particleStorm') getDoInitSys()();
    buildModUI();
}

export function expandMod(id) {
    const card = document.getElementById('card-' + id); if (!card) return;
    const body = card.querySelector('.mod-body');
    if (body) body.style.display = body.style.display === 'block' ? 'none' : 'block';
}

export function toggleMod(id) {
    const m = getModById(id); if (!m) return;
    m.on = !m.on;
    document.getElementById('tog-' + id)?.classList.toggle('on');
    document.getElementById('card-' + id)?.classList.toggle('active');
    if (m.type === 'pinwheels' || m.type === 'particleStorm') getDoInitSys()();
}

export function setModP(id, prop, v, dispId) {
    const m = getModById(id); if (!m) return;
    m[prop] = v;
    if (dispId) { const el = document.getElementById(dispId); if (el) el.textContent = fmtV(v); }
    if ((m.type === 'pinwheels' && (prop === 'wheelCount' || prop === 'bladeCount')) ||
        (m.type === 'particleStorm' && prop === 'count')) getDoInitSys()();
}

export function toggleModBool(id, prop, btnId) {
    const m = getModById(id); if (!m) return;
    m[prop] = !m[prop];
    document.getElementById(btnId)?.classList.toggle('on');
}

export function setBlend(id, v) { setModP(id, 'blend', v, 'bl-' + id); }

// ── Randomize / reset ───────────────────────────────────
export function randomizeMod(id) {
    const m = getModById(id); if (!m) return;
    const k = m.type;
    const ranges = MOD_RANGES[k]; if (!ranges) return;
    const spec = MOD_SPECS[k];
    Object.keys(ranges).forEach(prop => {
        const r = ranges[prop];
        const pSpec = spec.params ? spec.params.find(p => p[0] === prop) : null;
        const step = pSpec ? pSpec[4] : null;
        m[prop] = rndBetween(r[0], r[1], step);
    });
    if (spec.toggles) spec.toggles.forEach(t => { m[t[0]] = Math.random() > .5; });
    if (spec.selects) spec.selects.forEach(s => { m[s[0]] = Math.floor(Math.random() * s[2].length); });
    const s = Math.floor(Math.random() * 360);
    m.hueRange = { start: s, end: (s + 60 + Math.floor(Math.random() * 240)) % 360 };
    buildModUI();
    if (k === 'pinwheels' || k === 'particleStorm') getDoInitSys()();
    const card = document.getElementById('card-' + id);
    if (card) { const body = card.querySelector('.mod-body'); if (body) body.style.display = 'block'; }
}

export function resetMod(id) {
    const m = getModById(id); if (!m) return;
    const k = m.type;
    const fresh = makeModInstance(k, m.id.split('_').pop());
    fresh.id = m.id; fresh.on = m.on;
    const idx = getModIndex(id);
    if (idx >= 0) params.moduleList[idx] = fresh;
    rebuildModRegistry();
    buildModUI();
    if (k === 'pinwheels' || k === 'particleStorm') getDoInitSys()();
}

export function randomizeAllMods() {
    params.moduleList.forEach(m => randomizeMod(m.id));
}

export function randomizeGlobal() {
    const gRanges = { spinSpeed: [.001, .05], audioReact: [0, 5], hueSpeed: [0, 4], chaos: [0, 1], persist: [0, .9], brightness: [.4, 1.5], saturation: [0, 1.5] };
    const gSteps = { spinSpeed: .001, audioReact: .1, hueSpeed: .1, chaos: .01, persist: .01, brightness: .05, saturation: .05 };
    Object.keys(gRanges).forEach(k => {
        const r = gRanges[k]; const v = rndBetween(r[0], r[1], gSteps[k]);
        params[k] = v;
        const el = document.getElementById(k); if (el) el.value = v;
        const vel = document.getElementById(k + '-v'); if (vel) vel.textContent = fmtV(v);
    });
    const s = Math.floor(Math.random() * 360);
    params.hueRange = { start: s, end: (s + 60 + Math.floor(Math.random() * 240)) % 360 };
    const ghp = document.getElementById('globalHuePicker');
    if (ghp && ghp._huePicker) {
        ghp._huePicker.rangeObj.start = params.hueRange.start;
        ghp._huePicker.rangeObj.end = params.hueRange.end;
        ghp._huePicker.refresh();
    }
}

export function randomizeEverything() {
    if (window._cv_doRndSeed) window._cv_doRndSeed();
    randomizeGlobal();
    const types = Object.keys(MOD_SPECS);
    const shuffled = types.slice().sort(() => Math.random() - .5);
    const nOn = 2 + Math.floor(Math.random() * 5);
    params.moduleList = [];
    for (let i = 0; i < Math.min(nOn, shuffled.length); i++) {
        const inst = makeModInstance(shuffled[i], nextModId());
        inst.on = true;
        params.moduleList.push(inst);
    }
    rebuildModRegistry();
    buildModUI();
    params.moduleList.forEach(m => randomizeMod(m.id));
    getDoInitSys()();
}

function rndBetween(a, b, step) {
    let v = a + Math.random() * (b - a);
    if (step) v = Math.round(v / step) * step;
    return parseFloat(v.toFixed(4));
}
