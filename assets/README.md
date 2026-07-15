# Assets

All imagery is stored locally in this directory (supplied via the UAT_SYSTEM
asset pack), so the site is fully self-contained — no external image CDN.

| Asset | Used in |
| --- | --- |
| hero-main.png | 01 Hero — holographic head artwork |
| dna-bg.png | 02 — panel background DNA strands |
| persona-*.png | 02 — persona cards (labels/dots baked into the art) |
| fob-bg.png, fob-chip-1..6.png | 03 — fob artwork and feature chips |
| room-*.png | 04 — holographic experience tiles |
| globe.png | 05 — network globe |
| timeline-bg.png | 07 — panel background with energy burst |
| arch-tower.png | 08 — architecture disc tower |
| demo-faces.png | 09 — persona transformation strip |
| robot-hand.png | 10 — robotic hand |
| dna_hologram.glb | 02 — animated 3D DNA model (Three.js GLTFLoader) |

Dark-background artwork is composited with `mix-blend-mode: screen` plus
feathered `mask-image` gradients so it melts into the panels without cutouts.
