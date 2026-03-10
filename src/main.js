// ═══════════════════════════════════════════════════════
// MAIN ENTRY POINT
// Imports every module, wires forward references,
// exposes all onclick= handler names on window,
// then lets p5 (loaded as a CDN global) auto-detect
// window.setup / window.draw for its global-mode sketch.
// ═══════════════════════════════════════════════════════

// ── Renderer lifecycle ──────────────────────────────────
import {
    setup, draw, windowResized,
    doInitSys, gp,
    doUpdateSeedDisp, doUpdateSeed, doPrevSeed, doNextSeed, doRndSeed,
    doResetAll, doSave, toggleSpectrum
} from './renderer/Renderer.js';

// ── Module UI ───────────────────────────────────────────
import {
    buildModUI,
    addModInstance, duplicateMod, deleteMod,
    expandMod, toggleMod,
    setModP, toggleModBool, setBlend,
    randomizeMod, resetMod,
    randomizeAllMods, randomizeGlobal, randomizeEverything
} from './ui/ModuleUI.js';

// ── Preset UI ───────────────────────────────────────────
import {
    buildPresetUI,
    doSavePreset, doLoadPreset, doDeletePreset,
    doExportPresets, doImportClick, doImportFile
} from './ui/PresetUI.js';

// ── Sidebar / display UI ────────────────────────────────
import {
    setMode, setAspect, toggleFullscreen,
    updateModBadge, doResizeCanvas,
    initDragHandles, initSectionCollapse, initSidebarResize
} from './ui/SidebarUI.js';

// ── Chain UI ────────────────────────────────────────────
import {
    buildChainUI,
    addChainLink, removeChainLink,
    setChainProp, setChainStyle, setChainStrength,
    randomizeChain
} from './chain/ChainUI.js';

// ── Audio ───────────────────────────────────────────────
import { toggleMic } from './audio/AudioEngine.js';
import {
    saveAudioMapping, toggleAmapPanel, renderAmapUI, toggleModAov
} from './audio/AudioMapping.js';

// ════════════════════════════════════════════════════════
// Forward references (break circular dependencies)
// These are read lazily by ModuleUI / PresetUI / SidebarUI
// ════════════════════════════════════════════════════════
window._cv_doInitSys = doInitSys;
window._cv_doUpdateSeedDisp = doUpdateSeedDisp;
window._cv_doRndSeed = doRndSeed;
window._cv_renderMode = 'layer';

// ════════════════════════════════════════════════════════
// Expose everything called by HTML onclick= attributes
// p5 global mode also detects window.setup / window.draw
// ════════════════════════════════════════════════════════
Object.assign(window, {
    // p5 sketch lifecycle
    setup,
    draw,
    windowResized,

    // Renderer helpers
    gp,
    doUpdateSeedDisp,
    doUpdateSeed,
    doPrevSeed,
    doNextSeed,
    doRndSeed,
    doResetAll,
    doSave,
    toggleSpectrum,

    // Module UI
    buildModUI,
    addModInstance,
    duplicateMod,
    deleteMod,
    expandMod,
    toggleMod,
    setModP,
    toggleModBool,
    setBlend,
    randomizeMod,
    resetMod,
    randomizeAllMods,
    randomizeGlobal,
    randomizeEverything,

    // Preset UI
    buildPresetUI,
    doSavePreset,
    doLoadPreset,
    doDeletePreset,
    doExportPresets,
    doImportClick,
    doImportFile,

    // Sidebar / display
    setMode,
    setAspect,
    toggleFullscreen,
    doResizeCanvas,

    // Chain UI
    buildChainUI,
    addChainLink,
    removeChainLink,
    setChainProp,
    setChainStyle,
    setChainStrength,
    randomizeChain,

    // Audio
    toggleMic,
    saveAudioMapping,
    toggleAmapPanel,
    toggleModAov,
});

// ════════════════════════════════════════════════════════
// DOM-ready initialisation
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initDragHandles();
    initSectionCollapse();
    initSidebarResize();
    buildChainUI();
    buildModUI();
    setInterval(updateModBadge, 400);
});

window.addEventListener('load', () => {
    doUpdateSeedDisp();
    buildPresetUI();
    renderAmapUI();
});
