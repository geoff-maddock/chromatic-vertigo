// ═══════════════════════════════════════════════════════
// PRESET UI — save / load / export / import presets
// ═══════════════════════════════════════════════════════

import { params, rebuildModRegistry, fmtV } from '../state/params.js';
import { buildModUI } from './ModuleUI.js';
import { buildHuePicker } from './HuePicker.js';

const STORAGE_KEY = 'chromatic_vertigo_presets';

function loadPresetsFromStorage() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
    catch (e) { return []; }
}
function savePresetsToStorage(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildPresetUI() {
    const list = loadPresetsFromStorage();
    const el = document.getElementById('presetList'); if (!el) return;
    if (list.length === 0) { el.innerHTML = '<div class="preset-empty">No saved presets yet</div>'; return; }
    el.innerHTML = '';
    list.forEach((p, idx) => {
        const item = document.createElement('div'); item.className = 'preset-item';
        const d = new Date(p.savedAt);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        item.innerHTML =
            `<span class="preset-name" onclick="doLoadPreset(${idx})" title="Load '${escHtml(p.name)}'">${escHtml(p.name)}</span>` +
            `<span class="preset-date">${dateStr}</span>` +
            `<div class="preset-btns">` +
            `<button class="preset-btn" onclick="doLoadPreset(${idx})" title="Load">▶</button>` +
            `<button class="preset-btn" onclick="doDeletePreset(${idx})" title="Delete">✕</button>` +
            `</div>`;
        el.appendChild(item);
    });
}

export function doSavePreset() {
    const nameEl = document.getElementById('presetNameIn');
    const name = (nameEl.value || '').trim();
    if (!name) {
        nameEl.focus(); nameEl.placeholder = 'Enter a name first!';
        setTimeout(() => { nameEl.placeholder = 'Name this preset…'; }, 1500);
        return;
    }
    const list = loadPresetsFromStorage();
    const existing = list.findIndex(p => p.name === name);
    if (existing >= 0) {
        if (!confirm(`A preset named "${name}" already exists. Overwrite it?`)) return;
        list.splice(existing, 1);
    }
    list.unshift({ name, savedAt: Date.now(), params: JSON.parse(JSON.stringify(params)) });
    savePresetsToStorage(list);
    nameEl.value = '';
    buildPresetUI();
    const items = document.querySelectorAll('.preset-item');
    if (items[0]) { items[0].style.borderColor = 'var(--orange)'; setTimeout(() => { if (items[0]) items[0].style.borderColor = ''; }, 600); }
}

export function doLoadPreset(idx) {
    const list = loadPresetsFromStorage(); if (!list[idx]) return;
    Object.assign(params, JSON.parse(JSON.stringify(list[idx].params)));
    rebuildModRegistry();
    applyParamsToUI();
}

export function doDeletePreset(idx) {
    const list = loadPresetsFromStorage(); if (!list[idx]) return;
    if (!confirm(`Delete preset "${list[idx].name}"?`)) return;
    list.splice(idx, 1);
    savePresetsToStorage(list);
    buildPresetUI();
}

export function applyParamsToUI() {
    ['spinSpeed', 'audioReact', 'hueSpeed', 'chaos', 'persist', 'brightness', 'saturation'].forEach(k => {
        const el = document.getElementById(k); if (el) el.value = params[k];
        const vel = document.getElementById(k + '-v'); if (vel) vel.textContent = fmtV(params[k]);
    });
    if (window._cv_doUpdateSeedDisp) window._cv_doUpdateSeedDisp();
    buildModUI();
    if (window._cv_doInitSys) window._cv_doInitSys();
    const ghp = document.getElementById('globalHuePicker');
    if (ghp) buildHuePicker(ghp, 'Global Hue Range', params.hueRange, (s, e) => { params.hueRange.start = s; params.hueRange.end = e; });
}

export function doExportPresets() {
    const list = loadPresetsFromStorage();
    if (list.length === 0) { alert('No presets to export. Save some first!'); return; }
    const json = JSON.stringify({ app: 'ChromaticVertigo', version: 1, exportedAt: new Date().toISOString(), presets: list }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'chromatic-vertigo-presets-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

export function doImportClick() {
    const el = document.getElementById('importFile'); if (!el) return;
    el.value = ''; el.click();
}

export function doImportFile(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            let incoming = [];
            if (Array.isArray(data)) { incoming = data; }
            else if (data.presets && Array.isArray(data.presets)) { incoming = data.presets; }
            else { alert('Unrecognized file format.'); return; }
            if (incoming.length === 0) { alert('No presets found in file.'); return; }
            const existing = loadPresetsFromStorage();
            let added = 0, skipped = 0, overwritten = 0;
            incoming.forEach(p => {
                if (!p.name || !p.params) { skipped++; return; }
                const idx = existing.findIndex(e => e.name === p.name);
                if (idx >= 0) { existing[idx] = p; overwritten++; } else { existing.push(p); added++; }
            });
            savePresetsToStorage(existing);
            buildPresetUI();
            alert(`Import complete: ${added} added, ${overwritten} overwritten, ${skipped} skipped.`);
        } catch (err) { alert('Failed to parse JSON: ' + err.message); }
    };
    reader.readAsText(file);
}
