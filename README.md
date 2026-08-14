# Illustrations

Procedural animated illustrations built with [Remotion](https://www.remotion.dev/) — a React-based framework for creating videos programmatically.

## Features

- **Amoeba Blob Animation** — Organic, morphing blob shapes using simplex noise for smooth procedural motion
- **Grain/Noise Overlay** — Textured grain effect layered over animations
- **Circle Wave Animations** — Layered wave patterns for dynamic backgrounds
- **Configurable Parameters** — Adjustable radius, point count, noise amplitude/speed, and color palettes

## Tech Stack

- **Remotion** v4 — Programmatic video rendering in React
- **React 19** + **TypeScript**
- **simplex-noise** — Procedural shape generation
- **Zod** — Input prop validation

## Project Structure

```
remotion-amoeba/
├── src/
│   ├── Composition.tsx       # Root composition (1920×1080, 30fps, 10s)
│   ├── Blob/
│   │   ├── AmoebaBlob.tsx    # Main amoeba animation component
│   │   └── Grain.tsx         # Grain overlay effect
│   └── CircleWave.tsx        # Circle wave animation
assets/                       # SVG illustrations & reference PNGs
docs/                         # Design specs
```

## Getting Started

```bash
cd remotion-amoeba
npm install

# Preview in browser
npx remotion studio

# Render to video
npx remotion render src/index.ts AmoebaBlobAnimation out/video.mp4
```

## Output

Renders at **1920×1080** resolution, **30fps**, **300 frames** (10 seconds).
