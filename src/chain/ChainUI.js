// ═══════════════════════════════════════════════════════
// CHAIN UI
// ═══════════════════════════════════════════════════════

import { params, MOD_SPECS } from '../state/params.js';
import { CHAIN_STYLES, chainLinks } from './ChainEngine.js';
import { buildModUI } from '../ui/ModuleUI.js';

export function buildChainUI() {
    const container = document.getElementById('chainList'); if (!container) return;
    container.innerHTML = '';

    function modOptions(selectedId) {
        return params.moduleList.map(m => {
            const sameType = params.moduleList.filter(x => x.type === m.type);
            const instNum = sameType.indexOf(m) + 1;
            const lbl = MOD_SPECS[m.type].label + (sameType.length > 1 ? ' #' + instNum : '');
            return `<option value="${m.id}"${m.id === selectedId ? ' selected' : ''}>${lbl}</option>`;
        }).join('');
    }

    chainLinks.forEach((lnk, idx) => {
        const div = document.createElement('div');
        div.className = 'chain-link'; div.id = 'chain-link-' + idx;

        const srcSel = `<select class="chain-select" onchange="setChainProp(${idx},'src',this.value)">${modOptions(lnk.src)}</select>`;
        const dstSel = `<select class="chain-select" onchange="setChainProp(${idx},'dst',this.value)">${modOptions(lnk.dst)}</select>`;

        let html = `<div class="chain-row">${srcSel}<span class="chain-arrow">→</span>${dstSel}`;
        html += `<button class="chain-del" onclick="removeChainLink(${idx})" title="Remove">✕</button></div>`;

        html += '<div class="chain-style-row">';
        Object.keys(CHAIN_STYLES).forEach(s => {
            html += `<span class="style-chip${lnk.style === s ? ' active' : ''}" onclick="setChainStyle(${idx},'${s}')" title="${CHAIN_STYLES[s].desc}">${CHAIN_STYLES[s].label}</span>`;
        });
        html += '</div>';

        html += `<div class="chain-strength-row"><span>Strength</span>`;
        html += `<input type="range" min="0" max="1" step=".05" value="${lnk.strength}" oninput="setChainStrength(${idx},+this.value)" style="flex:1">`;
        html += `<span class="val" id="cstr-${idx}">${lnk.strength.toFixed(2)}</span></div>`;
        html += `<div style="font-size:9px;color:var(--mid);margin-top:4px;font-style:italic" id="cdesc-${idx}">${CHAIN_STYLES[lnk.style].desc}</div>`;

        div.innerHTML = html;
        container.appendChild(div);
    });
}

export function setChainProp(idx, prop, val) {
    if (chainLinks[idx]) chainLinks[idx][prop] = val;
}

export function setChainStyle(idx, style) {
    if (!chainLinks[idx]) return;
    chainLinks[idx].style = style;
    const card = document.getElementById('chain-link-' + idx); if (!card) return;
    card.querySelectorAll('.style-chip').forEach(el => {
        el.classList.toggle('active', el.textContent === CHAIN_STYLES[style].label);
    });
    const desc = card.querySelector('#cdesc-' + idx);
    if (desc) desc.textContent = CHAIN_STYLES[style].desc;
}

export function setChainStrength(idx, v) {
    if (!chainLinks[idx]) return;
    chainLinks[idx].strength = v;
    const el = document.getElementById('cstr-' + idx); if (el) el.textContent = v.toFixed(2);
}

export function addChainLink() {
    const ids = params.moduleList.map(m => m.id);
    let src = ids[0] || '', dst = ids[1] || ids[0] || '';
    if (chainLinks.length > 0) {
        const last = chainLinks[chainLinks.length - 1];
        src = last.dst;
        const lastIdx = ids.indexOf(last.dst);
        dst = ids[(lastIdx + 1) % ids.length] || src;
    }
    chainLinks.push({ src, dst, style: 'displace', strength: 0.5 });
    buildChainUI();
}

export function removeChainLink(idx) {
    chainLinks.splice(idx, 1);
    buildChainUI();
}

export function randomizeChain() {
    const n = 2 + Math.floor(Math.random() * 4);
    const styleKeys = Object.keys(CHAIN_STYLES);
    const shuffled = params.moduleList.slice().sort(() => Math.random() - .5);
    chainLinks.length = 0;
    for (let i = 0; i < Math.min(n, shuffled.length - 1); i++) {
        shuffled[i].on = true;
        shuffled[i + 1].on = true;
        chainLinks.push({
            src: shuffled[i].id,
            dst: shuffled[i + 1].id,
            style: styleKeys[Math.floor(Math.random() * styleKeys.length)],
            strength: Math.round((0.3 + Math.random() * 0.7) * 20) / 20
        });
    }
    buildChainUI();
    buildModUI();
}
