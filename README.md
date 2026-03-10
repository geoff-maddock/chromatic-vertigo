# Chromatic Vertigo — Chaos Engine

A real-time generative art visualizer built as a single self-contained HTML file. Ten independently blendable visual modules run simultaneously on a p5.js canvas, all of them responsive to live microphone input and tunable through a dense but compact sidebar of controls. No build step, no dependencies to install — open the file in a browser and it runs.

---

## Getting Started

Drop `chromatic-vertigo.html` into any folder and open it in a modern browser (Chrome, Edge, or Firefox recommended). No server is required. Everything — rendering, audio analysis, UI, preset storage — is handled entirely in the browser.

To use microphone reactivity, click **Enable Microphone** and grant the browser permission when prompted. The visualizer works without a mic; it falls back to a gentle simulated signal so the art keeps moving.

---

## Interface Overview

The layout is a fixed sidebar on the left and the square art canvas on the right. The sidebar scrolls; the canvas stays centered and scales to fill whatever space remains after the sidebar.

The canvas itself has a semi-transparent FFT spectrum analyzer overlaid at the bottom edge, showing real-time frequency content color-coded by band (sub through air), only visible while the microphone is active.

---

## Sidebar Sections

### Audio Input

Activates or deactivates the microphone. The status badge updates to reflect the current state (inactive / requesting / live). While live, a **BEAT** indicator flashes orange whenever a bass transient is detected.

### Audio → Visual Mapping

Five live meters show the smoothed levels for Volume, Bass, Mids, Highs, and Beat Detection. Each meter has a tag list below it showing which visual parameters it drives. These tags update dynamically based on which modules are active.

The audio analysis uses a 1024-point FFT. Band boundaries are approximately:
- **Bass** — bottom ~6% of bins
- **Mids** — ~6–25%
- **Highs** — ~25–100%
- **Beat** — triggered when bass crosses a threshold at least 8 frames after the previous trigger; decays multiplicatively each frame

When the mic is off, each audio accessor (`av`, `abass`, `amid`, `ahi`) returns a small sinusoidal fake signal at different frequencies so animations remain alive.

### Seed

An integer that initializes both `randomSeed()` and `noiseSeed()` in p5.js, making the layout of pinwheels and particle starting positions fully reproducible. Prev/Next buttons step by 1; the 🎲 button picks a random value between 1 and 999,999. Changing the seed reinitializes all stateful systems (wheel positions, particle locations).

### Global

Parameters that affect the entire composition:

| Parameter | Range | Default | Effect |
|---|---|---|---|
| Spin Speed | 0.001 – 0.06 | 0.012 | Base rotation rate for all spinning elements |
| Audio Reactivity | 0 – 5 | 2.0 | Multiplier applied to all audio-driven modulations |
| Hue Speed | 0 – 4 | 1.0 | Rate at which `globalHue` advances each frame |
| Chaos Amount | 0 – 1 | 0.20 | Controls Perlin noise warp strength across modules |
| Persistence / Trails | 0 – 0.98 | 0.30 | How opaque the per-frame background fade is; higher = longer trails |
| Global Brightness | 0.3 – 1.5 | 1.0 | Multiplied into every brightness value before drawing |
| Color Saturation | 0 – 1.5 | 1.0 | Multiplied into every saturation value before drawing |
| Global Hue Range | 0° – 360° | Full spectrum | Dual-handle rainbow slider constraining all hues globally |

The **Global Hue Range** slider is a custom dual-handle widget. Drag the left thumb to set the start hue and the right thumb to set the end hue. All color output is mapped into the selected arc before drawing. The dimmed regions on the rainbow track show excluded hues. Wrapped ranges (where end < start) are supported.

The 🎲 button next to the section header randomizes all global parameters at once, including the hue range.

### Modules

Ten visual modules, each with its own card. Click a card header to expand it and reveal that module's controls. An orange toggle switch in the header enables or disables the module independently of its expanded state.

Every module card exposes:
- A **Blend** slider (0 – 1) that scales the alpha of everything that module draws
- Its own set of parameter sliders and toggle switches (described per-module below)
- A **Hue Range** dual-handle picker that constrains that module's colors within the global hue range (applied as a second mapping stage)
- 🎲 **Random** button — randomizes all that module's params, toggles, selects, and hue range
- ↺ **Reset** button — restores that module's defaults

The 🎲 button next to the Modules section header randomizes all ten modules at once.

Draw order (back to front): Noise Field → Moiré Grid → Spirograph → Lissajous → Chaos Tunnel → Kaleidoscope → Pinwheels → Fracture Web → Pulse Rings → Particle Storm.

---

## Module Reference

### 🌀 Pinwheels
Optical illusion spinning blade wheels. Multiple wheels are arranged in concentric rings around a center wheel, each spinning at its own speed. Each wheel draws concentric rings of pie-slice wedges with alternating color inversions that create the illusion of rotation even when the wheel is technically stationary.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Wheel Count | 1 – 12 | 5 | Triggers full reinitialization |
| Blades | 3 – 20 | 8 | Wedges per ring |
| Rings | 2 – 14 | 6 | Concentric layers per wheel |
| Orbit Drift | 0 – 1 | 0.30 | How much wheels wander from their origin |
| Blade Skew | 0 – 1 | 0 | Angular offset applied per ring |
| Hub Glow | 0 – 1 | 0.50 | Brightness of the center glow dot |
| Alt Coloring | 0 – 1 | 0 | Switches from blade-based to ring-based hue cycling |
| Counter-Rotate | toggle | on | Alternating wheels spin in opposite directions |

Audio: Bass pulses wheel radii; overall volume accelerates spin; beat detection causes burst scaling.

### 🕸 Fracture Web
Recursive branching lines that grow outward from the center like a shattered pane of glass. Each branch splits into two children at a midpoint that is noise-displaced based on audio levels.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Line Count | 10 – 120 | 60 | Number of root branches |
| Branch Depth | 1 – 7 | 4 | Recursion depth (performance-sensitive at high values) |
| Spread Angle | 0 – 2 | 0.50 | How aggressively midpoints are displaced |
| Color Shift | 0° – 180° | 40° | Hue rotation applied at each branch level |
| Spin Speed | 0 – 1 | 0.30 | How fast the web rotates |
| Radiate from Center | toggle | on | Off = branches start further out, creating a ring effect |

Audio: Volume widens spread; bass deepens midpoint displacement; beat multiplies branch chaos.

### ∞ Lissajous
Parametric Lissajous curves drawn as continuous shapes. Multiple layers are drawn with phase offsets, and audio modulates the effective frequency ratios to produce evolving shapes.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Freq A | 1 – 12 | 3 | X-axis frequency |
| Freq B | 1 – 12 | 5 | Y-axis frequency |
| Resolution | 50 – 400 | 150 | Sample points per curve |
| Layers | 1 – 6 | 3 | Number of overlapping curves |
| Phase Speed | 0 – 3 | 1.0 | Rate of phase rotation |
| Stroke Width | 0.5 – 5 | 1.0 | Line thickness |
| Rainbow Mode | toggle | on | Off = each layer uses a single hue offset |

Audio: Volume scales curve amplitude; chaos amount modulates frequency ratios in real time.

### ⭕ Spirograph
Hypotrochoid (spirograph) traces. A virtual pen traces the path of a point on a small circle rolling inside a larger circle. Multiple passes with different gear ratios overlay.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Outer R | 0.2 – 0.8 | 0.45 | Radius of the fixed outer circle (as fraction of canvas) |
| Inner r | 0.05 – 0.4 | 0.15 | Radius of the rolling inner circle |
| Pen Dist | 0.05 – 0.5 | 0.20 | Distance of pen from center of inner circle |
| Passes | 1 – 4 | 2 | Additional gear configurations drawn on top |
| Trace Speed | 0.5 – 3 | 1.0 | How fast the pen traces (affects animation) |
| Stroke Width | 0.5 – 5 | 1.0 | Line thickness |
| Fill Mode | toggle | off | Fills the enclosed area instead of stroking |

Audio: Volume speeds up tracing and scales amplitude; bass modulates inner circle radius.

### ✦ Particle Storm
A field of 50–1,200 particles guided by a time-varying Perlin noise vector field. Each particle leaves a fading trail.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Particle Count | 50 – 1200 | 500 | Triggers full reinitialization |
| Turbulence | 0 – 2 | 0.50 | How strongly the noise field steers particles |
| Trail Length | 0 – 20 | 8 | Number of previous positions kept |
| Gravity | −0.5 – 0.5 | 0 | Constant vertical acceleration |
| Attract to Center | toggle | off | Adds a centripetal force toward canvas center |
| Spawn at Edges | toggle | off | Particles start at canvas edges instead of random positions |

Audio: Volume amplifies turbulence; beat detection increases particle size; mids affect velocity spread.

### 💎 Kaleidoscope
Perlin noise segments are drawn in one angular slice and repeated rotationally to create a symmetrical mandala effect.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Segments | 2 – 24 | 8 | Number of rotational copies |
| Morph Speed | 0 – 3 | 1.0 | Rate of noise evolution |
| Noise Scale | 0.1 – 1 | 0.30 | Spatial frequency of the noise pattern |
| Fill Opacity | 0 – 1 | 0.55 | Alpha of the filled triangles |
| Stroke Width | 0.5 – 5 | 1.0 | Edge line thickness (when outlines enabled) |
| Show Outlines | toggle | off | Draws segment edges |

Audio: Bass modulates the radial extent of each segment; volume speeds morphing.

### ⚡ Moiré Grid
Two or more grids of parallel lines overlaid with relative rotation, creating interference (moiré) patterns. Supports both Cartesian and polar (radial/circular) grid types.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Grid Size | 5 – 60 | 20 | Spacing between lines in pixels |
| Layers | 1 – 4 | 2 | Number of independently rotating grids |
| Rotation Speed | 0 – 0.05 | 0.01 | Angular velocity of secondary grids |
| Line Width | 0.3 – 4 | 0.8 | Stroke weight |
| Polar Mode | toggle | off | Switches from Cartesian grids to concentric circles + radial spokes |

Audio: Volume accelerates rotation; mids scale grid spacing dynamically.

### ◎ Pulse Rings
Concentric rings that breathe with the audio. Rings are distorted with Perlin noise, can be made elliptic, and can be filled or stroked.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Ring Count | 3 – 30 | 10 | Number of rings |
| Thickness | 0.2 – 5 | 0.50 | Stroke weight (or fill extent) |
| Spacing | 0.02 – 0.15 | 0.05 | Fractional spacing between ring radii |
| Ellipse Amount | 0 – 1 | 0.50 | Eccentricity when Elliptic Mode is on |
| Noise Warp | 0 – 1 | 0.40 | Strength of Perlin distortion on ring edges |
| Elliptic Mode | toggle | off | Stretches rings into ellipses that rotate |
| Fill Rings | toggle | off | Fills ring interiors instead of stroking |

Audio: Bass drives outward pulse ripples; beat detection snaps all rings outward; volume scales stroke weight.

### 🌌 Chaos Tunnel
Recursive layered polygons that recede toward a vanishing point, creating a sense of infinite depth. Connecting lines between successive layers reinforce the tunnel geometry.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Depth | 4 – 40 | 18 | Number of polygon layers |
| Twist Amount | 0 – 4 | 1.0 | Angular offset between successive layers |
| Base Corners | 3 – 12 | 4 | Sides on the innermost polygon (increases with depth) |
| Zoom Pulse | 0 – 2 | 0.50 | Scale modulation driven by beat detection |
| Connect Layers | toggle | on | Draws lines between corresponding vertices of adjacent layers |
| Fill Faces | toggle | off | Fills polygon interiors with low-alpha color |

Audio: Volume thickens edges; bass scales depth; beat triggers zoom pulse.

### 〰 Noise Field
A grid of short arrows whose direction is determined by a 3D Perlin noise function evolving over time. Optional curl mode rotates all vectors 90°, producing smooth circular flows.

| Parameter | Range | Default | Notes |
|---|---|---|---|
| Noise Scale | 0.001 – 0.03 | 0.008 | Spatial frequency of the noise field |
| Warp Amount | 0 – 4 | 1.5 | How many full rotations the noise maps to |
| Grid Step | 8 – 40 | 20 | Distance between arrow origins in pixels |
| Arrow Length | 0.2 – 1.2 | 0.65 | Arrow length as fraction of grid step |
| Curl Mode | toggle | off | Rotates all vectors 90°, creating fluid-like circulation |
| Color Mode | select | Hue Gradient | One of: Hue Gradient / Mono White / Speed-Based / Band-Based |

Audio: Volume modulates arrow length; mids alter noise time evolution; high frequencies affect directional spread.

---

## Hue System

Colors flow through a two-stage mapping pipeline before reaching the canvas:

1. **Global Hue Range** — the master palette constraint. All raw hue values (computed as offsets from `globalHue`) are remapped linearly into the selected arc.
2. **Module Hue Range** — applied on top of the global range. Each module's hue range is a second narrowing, so a module with a 60°–120° range inside a global range of 180°–360° will draw only that sliver of warm-to-cool greens.

`globalHue` itself advances each frame at Hue Speed × audio modulation, cycling through all 360° continuously.

When both range handles are at 0° and 360° (the defaults), the mapping is a no-op and all hues are available.

---

## Preset System

Presets capture the complete state of `params` — every global value, every module's parameters and hue range, and the seed — and store them by name in the browser's `localStorage`.

### Saving

Type a name in the text field and click **Save**. If a preset with that name already exists, you will be asked to confirm overwriting. The newest preset appears at the top of the list.

### Loading

Click the preset name or the ▶ button. All sliders, toggles, module cards, hue pickers, and the canvas state are restored immediately.

### Deleting

Click the ✕ button on any preset and confirm.

### Exporting

**⬇ Export JSON** downloads all saved presets as a `.json` file named `chromatic-vertigo-presets-YYYY-MM-DD.json`. The file is human-readable:

```json
{
  "app": "ChromaticVertigo",
  "version": 1,
  "exportedAt": "2026-03-08T00:00:00.000Z",
  "presets": [
    {
      "name": "My Preset",
      "savedAt": 1741392000000,
      "params": { ... }
    }
  ]
}
```

### Importing

**⬆ Import JSON** opens a file picker. The importer accepts either the full envelope format above or a raw JSON array of preset objects. New presets are added; name collisions are overwritten; malformed entries are skipped. A summary dialog confirms what changed.

> **Note:** Presets are stored in the browser's `localStorage` for the origin the file was opened from. If you open the file from `file://` on one machine, those presets are not accessible when the file is opened on a different machine or from a web server — use Export/Import to move presets between environments.

---

## Chain Modulation Mode

A pill switcher at the top of the sidebar toggles between **⊞ Layer** mode (the default) and **⛓ Chain** mode. Switching is instant and does not alter any module parameters.

### How It Works

In chain mode, each frame:
1. Any module that is a *source* in a chain link renders its output into a private offscreen `p5.Graphics` buffer.
2. That buffer is pixel-sampled to extract a live signal — average brightness, overall energy, and average hue.
3. The signal is passed through the chosen **modulation style**, which computes overrides for specific destination-module parameters.
4. The destination module draws using those overridden values, producing output it could never achieve alone.

Modules not involved in any chain link draw normally on top of any chain output.

### Chain Links

Each link has:
- **Source** dropdown — the module whose rendered output is analysed
- **Destination** dropdown — the module whose parameters are overridden
- **Style chips** — selects one of 8 modulation styles (see below)
- **Strength** slider (0 – 1) — scales how aggressively the source signal overrides destination params
- **✕ Delete** button — removes the link

Click **+ Add Link** to append a new link. The 🎲 button next to the Chain section header generates 2–5 random links with random routing and styles and enables all involved modules.

### Modulation Styles

| Style | What the source signal does to the destination |
|---|---|
| **Displace** | Source brightness amplifies chaos, warp, spread, and orbit drift — geometrically destabilising the destination |
| **Mask** | Source energy gates the destination's blend and opacity — busier sources reveal or suppress |
| **Hue Warp** | Source average hue rotates the destination's hue range, creating colour entrainment |
| **Scale** | Source energy multiplies size parameters — wheel count, ring depth, tunnel depth, segment count |
| **Time Warp** | Source energy drives the destination's speed params — phase, trace, morph, and spin speeds |
| **Kaleid** | Source energy multiplies the destination's symmetry count — pinwheel blades, kaleidoscope segments, tunnel corners |
| **Invert** | Source inverts the destination's hue range by 180° and toggles alt-coloring modes |
| **Ripple** | Source brightness pulsates warp, thickness, spread, and turbulence in the destination |

---

## Display

The Display section in the sidebar controls canvas geometry and visibility.

### Aspect Lock

Five chips select the canvas aspect ratio: **Free** (default — unconstrained drag), **1:1**, **16:9**, **4:3**, and **9:16**. Selecting a locked ratio constrains canvas resizing to that proportion.

### Canvas Resize Handles

Small drag handles appear on all four corners and four edges of the canvas. Dragging any handle resizes the canvas live. A size badge (`W × H px`) fades in while dragging and disappears afterwards. In a locked aspect mode the opposite dimension adjusts automatically.

### Fullscreen

**⛶ Fullscreen** expands the canvas area to fill the entire viewport over a dark background. The sidebar remains accessible. Clicking again (or pressing Escape) returns to normal layout.

### Spectrum Overlay

**📊 Spectrum: On/Off** toggles the FFT frequency visualiser overlay at the bottom of the canvas. When shown it displays a real-time bar graph colour-coded by frequency region (sub → bass → lo-mid → mid → hi-mid → highs → air) with labelled zones. Individual bars show a peak-hold cap dot. The entire overlay flashes orange on beat hits.

---

## Technical Architecture

### Stack
- **p5.js v1.7.0** (loaded from cdnjs CDN) — canvas rendering, noise, random, trigonometry helpers
- **Web Audio API** (native browser) — microphone capture, FFT analysis
- **Vanilla JS (ES5-compatible)** — all application logic
- **CSS custom properties + flexbox** — layout and theming
- **localStorage** — preset persistence

### Canvas Architecture
The main canvas is an off-screen `p5.Graphics` buffer (`pg`) that is drawn to each frame, then composited to the visible canvas with `image(pg, 0, 0)`. This allows the persistence/trails effect: each frame begins by painting a semi-transparent black rectangle over the previous frame rather than clearing it.

Canvas size is `min(windowWidth − 330, windowHeight − 28, 820)` pixels square.

### Audio Pipeline
```
getUserMedia → MediaStreamSource → AnalyserNode (fftSize 1024)
→ getByteFrequencyData each frame
→ smoothed band averages (sVol, sBass, sMid, sHi)
→ peak hold with multiplicative decay
→ beat detection (threshold + minimum inter-beat gap)
```

### Randomness
Two separate random streams:
- `randomSeed(params.seed)` — used for wheel placement and fracture web branching; deterministic from seed
- `noiseSeed(params.seed)` — used for Perlin noise field; deterministic from seed

Math.random() (unseeded) is used only for UI interactions like "Random Seed" and "Randomize Everything."

### Color Architecture
All drawing uses p5.js HSB color mode with a 0–360 hue range. The `GH(h)` function applies the global hue range mapping; `MH(moduleKey, h)` applies the global mapping first and then the module mapping. Brightness and saturation multipliers (`BS()`, `SS()`) are applied at every draw call.

### File Structure

The repository root:
```
chromatic-vertigo.html   ← main file (latest, ~2800 lines)
README.md
data/
  chromatic-vertigo-presets-*.json   ← exported preset files
versions/
  pinwheel-1.html … pinwheel-5.html  ← iterative development snapshots
  pinwheel-latest.html
context/
  prompts/initial-prompts.md         ← original generation prompt log
```

`chromatic-vertigo.html` is entirely self-contained:
- CSS (inline `<style>`) — ~160 lines
- HTML (sidebar + canvas area) — ~90 lines
- JavaScript (inline `<script>`) — ~1100 lines
  - Audio engine and FFT display
  - Params object and module spec definitions
  - UI builders (module cards, hue pickers)
  - Randomize/reset logic
  - Chain modulation engine
  - Canvas resize and fullscreen handlers
  - Pinwheel class and Particle class
  - p5.js `setup()`/`draw()` loop
  - Ten module draw functions
  - UI event handlers
  - Preset system (save/load/export/import)

---

## Actions

| Button | Effect |
|---|---|
| ↺ Reset All | Restores all parameters to defaults and reinitialises the canvas |
| 💾 Save PNG | Saves the current canvas frame as a PNG named `vertigo-{seed}.png` |
| 🎲 Randomize Everything | Picks a new random seed, randomises all global params and all module params, then enables a random subset of 2–6 modules |

---

## Browser Compatibility

Requires a browser with support for:
- Canvas 2D API
- Web Audio API (`AudioContext`, `AnalyserNode`)
- `getUserMedia` (for microphone; HTTPS or `localhost` required in some browsers when served over a network)
- `localStorage`
- ES5 JavaScript
- CSS flexbox and custom properties

Works without a web server when opened as a local file (`file://`). Microphone access may require a local server in some configurations.
