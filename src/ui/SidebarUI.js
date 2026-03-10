// ═══════════════════════════════════════════════════════
// SIDEBAR UI — display controls, drag-to-resize, section
//              collapse, sidebar resize, mode switcher
// ═══════════════════════════════════════════════════════

import { rs } from '../renderer/rendererState.js';
import { invalidateFFTCanvas } from '../audio/AudioEngine.js';
import { chainBuffers } from '../chain/ChainEngine.js';
import { params } from '../state/params.js';
import { buildChainUI } from '../chain/ChainUI.js';

// ── Display state ───────────────────────────────────────
export const displayState = { w: 600, h: 600, aspect: 'free', fullscreen: false };
export const ASPECT_RATIOS = { 'free': null, '1:1': [1, 1], '16:9': [16, 9], '4:3': [4, 3], '9:16': [9, 16] };

function applyAspectToHeight(w) { const r = ASPECT_RATIOS[displayState.aspect]; return r ? Math.round(w * r[1] / r[0]) : displayState.h; }

export function doResizeCanvas(w, h) {
    w = Math.max(200, Math.min(1600, Math.round(w)));
    h = Math.max(200, Math.min(1600, Math.round(h)));
    displayState.w = w; displayState.h = h;
    resizeCanvas(w, h);
    rs.pg = createGraphics(w, h);
    rs.pg.colorMode(HSB, 360, 100, 100, 100);
    // Clear chain buffers
    Object.keys(chainBuffers).forEach(k => delete chainBuffers[k]);
    invalidateFFTCanvas();
    if (window._cv_doInitSys) window._cv_doInitSys();
}

export function setAspect(a) {
    displayState.aspect = a;
    document.querySelectorAll('#aspectChips .size-chip').forEach(el => {
        el.classList.toggle('active', el.textContent === a);
    });
    if (a !== 'free') doResizeCanvas(displayState.w, applyAspectToHeight(displayState.w));
}

export function toggleFullscreen() {
    const area = document.querySelector('.canvas-area');
    const btn = document.getElementById('fsBtn');
    if (!displayState.fullscreen) {
        displayState.fullscreen = true;
        area.classList.add('fullscreen-mode');
        if (btn) btn.textContent = '✕ Exit Fullscreen';
        const sw = window.innerWidth, sh = window.innerHeight;
        const r = ASPECT_RATIOS[displayState.aspect];
        let fw, fh;
        if (r) {
            if (sw / sh > r[0] / r[1]) { fh = sh; fw = Math.round(sh * r[0] / r[1]); }
            else { fw = sw; fh = Math.round(sw * r[1] / r[0]); }
        } else { fw = sw; fh = sh; }
        doResizeCanvas(fw, fh);
    } else {
        displayState.fullscreen = false;
        area.classList.remove('fullscreen-mode');
        if (btn) btn.textContent = '⛶ Fullscreen';
        doResizeCanvas(displayState.w, displayState.h);
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && displayState.fullscreen) toggleFullscreen();
});

// ── Render mode ─────────────────────────────────────────
export function setMode(m) {
    window._cv_renderMode = m;
    document.getElementById('modeLayer')?.classList.toggle('active', m === 'layer');
    document.getElementById('modeChain')?.classList.toggle('active', m === 'chain');
    const layerSec = document.getElementById('layerModeSec');
    const chainSec = document.getElementById('chainModeSec');
    if (layerSec) layerSec.style.display = m === 'layer' ? '' : 'none';
    if (chainSec) chainSec.style.display = m === 'chain' ? '' : 'none';
    if (m === 'chain') buildChainUI();
}

// ── Active-module badge ─────────────────────────────────
export function updateModBadge() {
    const badge = document.getElementById('modActiveBadge');
    if (!badge || !params || !params.moduleList) return;
    const on = params.moduleList.filter(m => m.on).length;
    badge.textContent = on + '/' + params.moduleList.length;
}

// ── Drag-to-resize handles ──────────────────────────────
export function initDragHandles() {
    let dragging = false, dir = '', startX = 0, startY = 0, startW = 0, startH = 0;
    let pendingW = 0, pendingH = 0, dirty = false, rafId = 0;
    let badge = null, badgeTimer = 0;

    function showBadge(w, h) {
        if (!badge) badge = document.getElementById('sizeBadge');
        if (badge) { badge.textContent = w + ' × ' + h; badge.classList.add('visible'); }
        clearTimeout(badgeTimer);
    }
    function hideBadge() {
        badgeTimer = setTimeout(() => { if (badge) badge.classList.remove('visible'); }, 600);
    }
    function onMove(cx, cy) {
        if (!dragging) return;
        const dx = cx - startX, dy = cy - startY;
        let newW = startW, newH = startH;
        const r = ASPECT_RATIOS[displayState.aspect];
        if (dir.indexOf('e') >= 0) newW = Math.max(200, Math.min(1600, startW + dx));
        if (dir.indexOf('w') >= 0) newW = Math.max(200, Math.min(1600, startW - dx));
        if (dir.indexOf('s') >= 0) newH = Math.max(200, Math.min(1600, startH + dy));
        if (dir.indexOf('n') >= 0) newH = Math.max(200, Math.min(1600, startH - dy));
        if (r) {
            if (['e', 'w', 'se', 'ne', 'sw', 'nw'].includes(dir)) newH = Math.round(newW * r[1] / r[0]);
            else newW = Math.round(newH * r[0] / r[1]);
            newW = Math.max(200, Math.min(1600, newW));
            newH = Math.max(200, Math.min(1600, newH));
        }
        pendingW = Math.round(newW); pendingH = Math.round(newH);
        showBadge(pendingW, pendingH); dirty = true;
    }
    function flushResize() { rafId = 0; if (!dirty) return; dirty = false; doResizeCanvas(pendingW, pendingH); }
    function onDown(e) {
        const handle = e.target.closest ? e.target.closest('.rh') : null;
        if (!handle || displayState.fullscreen) return;
        e.preventDefault();
        dir = handle.getAttribute('data-dir'); dragging = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        startW = width; startH = height;
        document.body.style.userSelect = 'none'; document.body.style.cursor = handle.style.cursor || 'se-resize';
        showBadge(startW, startH);
    }
    function onUp() {
        if (!dragging) return; dragging = false;
        document.body.style.userSelect = ''; document.body.style.cursor = '';
        if (dirty) { doResizeCanvas(pendingW, pendingH); dirty = false; }
        hideBadge();
    }
    function onMoveThrottled(e) {
        if (!dragging) return; e.preventDefault();
        onMove(e.touches ? e.touches[0].clientX : e.clientX, e.touches ? e.touches[0].clientY : e.clientY);
        if (!rafId) rafId = requestAnimationFrame(flushResize);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMoveThrottled);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('touchmove', onMoveThrottled, { passive: false });
    document.addEventListener('touchend', onUp);
}

// ── Collapsible sections ────────────────────────────────
export function initSectionCollapse() {
    const LS = 'cv_sec_';
    document.querySelectorAll('.sec').forEach(sec => {
        const h3 = sec.querySelector(':scope>h3'); if (!h3) return;
        const rawText = Array.from(h3.childNodes)
            .filter(n => n.nodeType === 3)
            .map(n => n.textContent).join('').trim()
            .replace(/[^a-zA-Z0-9]/g, '_').substring(0, 24);
        const key = LS + rawText;
        const body = document.createElement('div'); body.className = 'sec-body';
        Array.from(sec.children).slice(1).forEach(c => body.appendChild(c));
        sec.appendChild(body);
        const firstBtn = h3.querySelector('button');
        const spacer = document.createElement('span'); spacer.className = 'sec-spacer';
        if (firstBtn) h3.insertBefore(spacer, firstBtn); else h3.appendChild(spacer);
        if (sec.id === 'layerModeSec') {
            const badge = document.createElement('span'); badge.className = 'sec-badge'; badge.id = 'modActiveBadge';
            if (firstBtn) h3.insertBefore(badge, firstBtn); else h3.appendChild(badge);
        }
        const chev = document.createElement('span'); chev.className = 'sec-chevron'; chev.textContent = '▾';
        h3.appendChild(chev);
        if (localStorage.getItem(key) === '1') sec.classList.add('collapsed');
        h3.addEventListener('click', e => {
            if (e.target.matches('button') || e.target.closest('button')) return;
            sec.classList.toggle('collapsed');
            localStorage.setItem(key, sec.classList.contains('collapsed') ? '1' : '0');
        });
    });
}

// ── Resizable sidebar ───────────────────────────────────
export function initSidebarResize() {
    const sidebar = document.querySelector('.sidebar'); if (!sidebar) return;
    const LS_W = 'cv_sidebar_w', MIN = 220, MAX = 640;
    const PRESETS = [{ label: 'Compact', w: 240 }, { label: 'Normal', w: 300 }, { label: 'Wide', w: 420 }];
    const saved = parseInt(localStorage.getItem(LS_W));
    if (saved && saved >= MIN && saved <= MAX) sidebar.style.width = saved + 'px';
    const chipsCg = document.getElementById('swChipsCg');
    if (chipsCg) {
        const row = document.createElement('div'); row.className = 'sw-chips'; row.id = 'swChipsRow';
        PRESETS.forEach(p => {
            const chip = document.createElement('span'); chip.className = 'sw-chip'; chip.textContent = p.label;
            chip.onclick = () => { sidebar.style.width = p.w + 'px'; localStorage.setItem(LS_W, p.w); syncChips(p.w); };
            row.appendChild(chip);
        });
        chipsCg.appendChild(row); syncChips(sidebar.offsetWidth || 300);
    }
    function syncChips(w) {
        document.querySelectorAll('.sw-chip').forEach((chip, i) => {
            chip.classList.toggle('active', Math.abs(PRESETS[i].w - w) < 20);
        });
    }
    const handle = document.createElement('div'); handle.className = 'sidebar-drag';
    const bar = document.createElement('div'); bar.className = 'sidebar-drag-bar';
    handle.appendChild(bar); sidebar.appendChild(handle);
    let dragging = false, startX = 0, startW = 0;
    handle.addEventListener('mousedown', e => {
        dragging = true; startX = e.clientX; startW = sidebar.offsetWidth;
        handle.classList.add('dragging'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        const nw = Math.max(MIN, Math.min(MAX, startW + (e.clientX - startX)));
        sidebar.style.width = nw + 'px'; syncChips(nw);
    });
    document.addEventListener('mouseup', () => {
        if (!dragging) return; dragging = false;
        handle.classList.remove('dragging'); document.body.style.cursor = ''; document.body.style.userSelect = '';
        localStorage.setItem(LS_W, sidebar.offsetWidth); syncChips(sidebar.offsetWidth);
    });
}
