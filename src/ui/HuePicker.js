// ═══════════════════════════════════════════════════════
// HUE RANGE PICKER WIDGET
// ═══════════════════════════════════════════════════════

/**
 * Build an interactive hue-range picker into `container`.
 * @param {HTMLElement} container - Host element (cleared first)
 * @param {string}      labelText
 * @param {{start:number, end:number}} rangeObj - Mutated in place
 * @param {function(number, number)} onChange   - Called on every change
 */
export function buildHuePicker(container, labelText, rangeObj, onChange) {
    container.innerHTML = '';

    const lbl = document.createElement('label');
    lbl.textContent = labelText; container.appendChild(lbl);

    const wrap = document.createElement('div'); wrap.className = 'hue-track-wrap'; container.appendChild(wrap);
    const track = document.createElement('div'); track.className = 'hue-track'; wrap.appendChild(track);
    const maskL = document.createElement('div'); maskL.className = 'hue-mask left'; wrap.appendChild(maskL);
    const maskR = document.createElement('div'); maskR.className = 'hue-mask right'; wrap.appendChild(maskR);
    const thumbS = document.createElement('div'); thumbS.className = 'hue-thumb'; thumbS.title = 'Start hue'; wrap.appendChild(thumbS);
    const thumbE = document.createElement('div'); thumbE.className = 'hue-thumb'; thumbE.title = 'End hue'; wrap.appendChild(thumbE);

    const readout = document.createElement('div'); readout.className = 'hue-readout'; container.appendChild(readout);
    const swatchS = document.createElement('span'); swatchS.className = 'hue-swatch';
    const swatchE = document.createElement('span'); swatchE.className = 'hue-swatch';
    const lblS = document.createElement('span');
    const lblE = document.createElement('span');
    const leftSpan = document.createElement('span'); leftSpan.appendChild(swatchS); leftSpan.appendChild(lblS);
    const rightSpan = document.createElement('span'); rightSpan.appendChild(swatchE); rightSpan.appendChild(lblE);
    readout.appendChild(leftSpan); readout.appendChild(rightSpan);

    function hToX(h) { const tw = wrap.offsetWidth || 268; return 6 + (h / 360) * (tw - 12); }
    function xToH(x) { const tw = wrap.offsetWidth || 268; return Math.round(Math.max(0, Math.min(360, (x - 6) / (tw - 12) * 360))); }

    function refresh() {
        const s = rangeObj.start, e = rangeObj.end;
        thumbS.style.left = hToX(s) + 'px';
        thumbE.style.left = hToX(e) + 'px';
        thumbS.style.borderColor = `hsl(${s},80%,45%)`;
        thumbE.style.borderColor = `hsl(${e},80%,45%)`;
        swatchS.style.background = `hsl(${s},85%,55%)`;
        swatchE.style.background = `hsl(${e},85%,55%)`;
        lblS.textContent = s + '°';
        lblE.textContent = e + '°';
        const pS = (s / 360) * 100, pE = (e / 360) * 100;
        maskL.style.width = pS + '%';
        maskR.style.width = e >= s ? (100 - pE) + '%' : '0%';
        if (e < s) maskL.style.width = '0%';
    }

    function drag(isStart) {
        const onMove = ev => {
            const rect = wrap.getBoundingClientRect();
            const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
            const h = xToH(cx);
            if (isStart) rangeObj.start = h; else rangeObj.end = h;
            onChange(rangeObj.start, rangeObj.end); refresh();
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp);
        };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false }); document.addEventListener('touchend', onUp);
    }

    thumbS.addEventListener('mousedown', e => { e.preventDefault(); drag(true); });
    thumbE.addEventListener('mousedown', e => { e.preventDefault(); drag(false); });
    thumbS.addEventListener('touchstart', e => { e.preventDefault(); drag(true); }, { passive: false });
    thumbE.addEventListener('touchstart', e => { e.preventDefault(); drag(false); }, { passive: false });

    track.addEventListener('mousedown', e => {
        const rect = wrap.getBoundingClientRect();
        const h = xToH(e.clientX - rect.left);
        const isStart = Math.abs(h - rangeObj.start) <= Math.abs(h - rangeObj.end);
        if (isStart) rangeObj.start = h; else rangeObj.end = h;
        onChange(rangeObj.start, rangeObj.end); refresh(); drag(isStart);
    });

    setTimeout(refresh, 0);
    container._huePicker = { refresh, rangeObj };
}
