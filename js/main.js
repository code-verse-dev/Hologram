// UAT SYSTEM — Universal AI Transformation
// Three.js animated landing page

import * as THREE from "three";

const CYAN = new THREE.Color("#00d4ff");
const BLUE = new THREE.Color("#0f8dff");
const PURPLE = new THREE.Color("#8b5cf6");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Scene manager: each canvas gets its own renderer, rendered from one  */
/* RAF loop, paused automatically when the canvas is offscreen.         */
/* ------------------------------------------------------------------ */

const scenes = [];

function createScene(canvas, { camera, build, update, fullscreen = false }) {
  if (!canvas) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const entry = { canvas, renderer, scene, camera, update, fullscreen, visible: true };

  const resize = () => {
    const w = fullscreen ? window.innerWidth : canvas.clientWidth;
    const h = fullscreen ? window.innerHeight : canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const io = new IntersectionObserver(([e]) => { entry.visible = e.isIntersecting; });
  io.observe(canvas);

  build(scene, entry);
  scenes.push(entry);
  return entry;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  for (const s of scenes) {
    if (!s.visible) continue;
    if (!prefersReducedMotion) s.update(t, s);
    s.renderer.render(s.scene, s.camera);
  }
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                       */
/* ------------------------------------------------------------------ */

function particleTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(160,220,255,0.7)");
  g.addColorStop(1, "rgba(0,80,160,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

const dotTex = particleTexture();

function makePoints(positions, { size = 0.06, color = CYAN, opacity = 0.9 } = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size,
    map: dotTex,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

/* ------------------------------------------------------------------ */
/* 1. Fixed starfield background                                        */
/* ------------------------------------------------------------------ */

let scrollY = 0;
window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

createScene(document.getElementById("bg-canvas"), {
  fullscreen: true,
  camera: new THREE.PerspectiveCamera(60, 1, 0.1, 100),
  build(scene, entry) {
    entry.camera.position.z = 10;
    const N = 900;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    entry.stars = makePoints(pos, { size: 0.09, color: new THREE.Color("#6fb6ff"), opacity: 0.55 });
    scene.add(entry.stars);

    const pos2 = new Float32Array(N);
    for (let i = 0; i < N / 3; i++) pos2[i] = (Math.random() - 0.5) * 40;
    entry.purple = makePoints(Array.from({ length: 300 * 3 }, () => (Math.random() - 0.5) * 40), {
      size: 0.12, color: PURPLE, opacity: 0.35,
    });
    scene.add(entry.purple);
  },
  update(t, entry) {
    entry.stars.rotation.y = t * 0.012;
    entry.purple.rotation.y = -t * 0.008;
    entry.camera.position.y = -scrollY * 0.0006;
  },
});

/* ------------------------------------------------------------------ */
/* 2. Hero: energy rings + rising particle vortex                       */
/* ------------------------------------------------------------------ */

createScene(document.getElementById("hero-canvas"), {
  camera: new THREE.PerspectiveCamera(50, 1, 0.1, 100),
  build(scene, entry) {
    entry.camera.position.set(0, 1.2, 9);
    entry.camera.lookAt(2, 0, 0);

    entry.rings = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const r = 1.6 + i * 0.75;
      const geo = new THREE.TorusGeometry(r, 0.012 + 0.004 * (4 - i), 8, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 ? BLUE : CYAN,
        transparent: true,
        opacity: 0.5 - i * 0.07,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2.15;
      ring.position.set(2.8, -2.2, 0);
      entry.rings.add(ring);
    }
    scene.add(entry.rings);

    // rising particles around the hologram
    const N = 500;
    const pos = new Float32Array(N * 3);
    entry.speeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1 + Math.random() * 3.4;
      pos[i * 3] = 2.8 + Math.cos(a) * r;
      pos[i * 3 + 1] = -2.5 + Math.random() * 6;
      pos[i * 3 + 2] = Math.sin(a) * r;
      entry.speeds[i] = 0.15 + Math.random() * 0.5;
    }
    entry.parts = makePoints(pos, { size: 0.07, color: CYAN, opacity: 0.8 });
    scene.add(entry.parts);
  },
  update(t, entry) {
    entry.rings.children.forEach((ring, i) => {
      ring.rotation.z = t * (0.1 + i * 0.05) * (i % 2 ? 1 : -1);
      ring.scale.setScalar(1 + Math.sin(t * 1.4 + i) * 0.02);
    });
    const pos = entry.parts.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + entry.speeds[i] * 0.016;
      if (y > 3.8) y = -2.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    entry.parts.rotation.y = t * 0.06;
  },
});

/* ------------------------------------------------------------------ */
/* 3. DNA double helix (section 02 background)                          */
/* ------------------------------------------------------------------ */

createScene(document.getElementById("dna-canvas"), {
  camera: new THREE.PerspectiveCamera(40, 1, 0.1, 100),
  build(scene, entry) {
    entry.camera.position.z = 7;
    entry.helix = new THREE.Group();

    const N = 260, turns = 5, len = 22;
    const a = [], b = [], rungs = [];
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const ang = u * Math.PI * 2 * turns;
      const x = (u - 0.5) * len;
      a.push(x, Math.sin(ang) * 1.1, Math.cos(ang) * 1.1);
      b.push(x, Math.sin(ang + Math.PI) * 1.1, Math.cos(ang + Math.PI) * 1.1);
    }
    entry.helix.add(makePoints(a, { size: 0.14, color: CYAN, opacity: 0.8 }));
    entry.helix.add(makePoints(b, { size: 0.14, color: PURPLE, opacity: 0.8 }));

    for (let i = 0; i < N; i += 8) {
      const u = i / N;
      const ang = u * Math.PI * 2 * turns;
      const x = (u - 0.5) * len;
      for (let k = 0; k <= 6; k++) {
        const f = k / 6;
        rungs.push(
          x,
          THREE.MathUtils.lerp(Math.sin(ang), Math.sin(ang + Math.PI), f) * 1.1,
          THREE.MathUtils.lerp(Math.cos(ang), Math.cos(ang + Math.PI), f) * 1.1,
        );
      }
    }
    entry.helix.add(makePoints(rungs, { size: 0.05, color: new THREE.Color("#6fb6ff"), opacity: 0.5 }));
    entry.helix.rotation.z = -0.08;
    scene.add(entry.helix);
  },
  update(t, entry) {
    entry.helix.rotation.x = t * 0.35;
  },
});

/* ------------------------------------------------------------------ */
/* 4. Fob: orbiting rings + sparks                                      */
/* ------------------------------------------------------------------ */

createScene(document.getElementById("fob-canvas"), {
  camera: new THREE.PerspectiveCamera(50, 1, 0.1, 100),
  build(scene, entry) {
    entry.camera.position.z = 6;
    entry.group = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.9 + i * 0.5, 0.012, 8, 120),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? PURPLE : CYAN,
          transparent: true,
          opacity: 0.45 - i * 0.1,
          blending: THREE.AdditiveBlending,
        }),
      );
      ring.rotation.x = Math.PI / 2.4 + i * 0.16;
      entry.group.add(ring);
    }
    const N = 160;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.4 + Math.random() * 1.6;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.4;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    entry.sparks = makePoints(pos, { size: 0.08, color: CYAN, opacity: 0.8 });
    entry.group.add(entry.sparks);
    scene.add(entry.group);
  },
  update(t, entry) {
    entry.group.children.forEach((child, i) => {
      if (child === entry.sparks) return;
      child.rotation.z = t * (0.25 + i * 0.12) * (i % 2 ? -1 : 1);
    });
    entry.sparks.rotation.y = t * 0.3;
  },
});

/* ------------------------------------------------------------------ */
/* 5. Particle globe (section 05)                                       */
/* ------------------------------------------------------------------ */

createScene(document.getElementById("globe-canvas"), {
  camera: new THREE.PerspectiveCamera(45, 1, 0.1, 100),
  build(scene, entry) {
    entry.camera.position.z = 5.4;
    entry.globe = new THREE.Group();

    const N = 1100, R = 1.75;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // even-ish sphere distribution
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = i * 2.39996; // golden angle
      pos[i * 3] = Math.cos(theta) * rad * R;
      pos[i * 3 + 1] = y * R;
      pos[i * 3 + 2] = Math.sin(theta) * rad * R;
    }
    entry.globe.add(makePoints(pos, { size: 0.055, color: new THREE.Color("#59a7ff"), opacity: 0.9 }));

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.99, 24, 16),
      new THREE.MeshBasicMaterial({ color: BLUE, wireframe: true, transparent: true, opacity: 0.07 }),
    );
    entry.globe.add(wire);

    // orbiting connection arcs
    for (let i = 0; i < 3; i++) {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(R + 0.25 + i * 0.16, 0.006, 6, 100),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? PURPLE : CYAN,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
        }),
      );
      orbit.rotation.x = Math.PI / 2 - 0.35 + i * 0.35;
      orbit.rotation.y = i * 0.7;
      entry.globe.add(orbit);
    }
    scene.add(entry.globe);
  },
  update(t, entry) {
    entry.globe.rotation.y = t * 0.18;
  },
});

/* ------------------------------------------------------------------ */
/* 6. Timeline particles (section 07 background)                        */
/* ------------------------------------------------------------------ */

createScene(document.getElementById("timeline-canvas"), {
  camera: new THREE.PerspectiveCamera(45, 1, 0.1, 100),
  build(scene, entry) {
    entry.camera.position.z = 8;
    const N = 320;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    entry.dust = makePoints(pos, { size: 0.06, color: new THREE.Color("#7aa7ff"), opacity: 0.5 });
    scene.add(entry.dust);

    // purple energy burst on the right, matching the 2045 node
    const M = 240;
    const bpos = new Float32Array(M * 3);
    entry.bs = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.5) * 1.6;
      bpos[i * 3] = 6.5 + Math.cos(a) * r;
      bpos[i * 3 + 1] = 0.4 + Math.sin(a) * r * 0.7;
      bpos[i * 3 + 2] = (Math.random() - 0.5);
      entry.bs[i] = Math.random() * Math.PI * 2;
    }
    entry.burst = makePoints(bpos, { size: 0.1, color: PURPLE, opacity: 0.85 });
    scene.add(entry.burst);
  },
  update(t, entry) {
    entry.dust.rotation.y = Math.sin(t * 0.12) * 0.2;
    const s = 1 + Math.sin(t * 2.2) * 0.07;
    entry.burst.scale.setScalar(s);
    entry.burst.rotation.z = t * 0.4;
  },
});

/* ------------------------------------------------------------------ */
/* 7. System architecture: holographic disc tower (section 08)          */
/* ------------------------------------------------------------------ */

createScene(document.getElementById("arch-canvas"), {
  camera: new THREE.PerspectiveCamera(45, 1, 0.1, 100),
  build(scene, entry) {
    entry.camera.position.set(0, 2.2, 7.0);
    entry.camera.lookAt(0, 0, 0);
    entry.tower = new THREE.Group();

    const layers = [
      { r: 1.9, color: CYAN },
      { r: 1.55, color: BLUE },
      { r: 1.25, color: PURPLE },
      { r: 1.0, color: new THREE.Color("#22c55e") },
      { r: 1.25, color: BLUE },
      { r: 1.5, color: CYAN },
      { r: 1.8, color: PURPLE },
    ];
    const H = 3.6;
    layers.forEach((l, i) => {
      const y = H / 2 - (i / (layers.length - 1)) * H;
      const disc = new THREE.Group();

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(l.r, 0.015, 8, 100),
        new THREE.MeshBasicMaterial({ color: l.color, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }),
      );
      ring.rotation.x = Math.PI / 2;
      disc.add(ring);

      const fill = new THREE.Mesh(
        new THREE.CircleGeometry(l.r * 0.92, 48),
        new THREE.MeshBasicMaterial({ color: l.color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
      );
      fill.rotation.x = -Math.PI / 2;
      disc.add(fill);

      const M = 60;
      const ppos = new Float32Array(M * 3);
      for (let k = 0; k < M; k++) {
        const a = Math.random() * Math.PI * 2;
        const rr = l.r * (0.4 + Math.random() * 0.6);
        ppos[k * 3] = Math.cos(a) * rr;
        ppos[k * 3 + 1] = (Math.random() - 0.5) * 0.08;
        ppos[k * 3 + 2] = Math.sin(a) * rr;
      }
      disc.add(makePoints(ppos, { size: 0.05, color: l.color, opacity: 0.8 }));

      disc.position.y = y;
      disc.userData.speed = (0.2 + i * 0.07) * (i % 2 ? -1 : 1);
      entry.tower.add(disc);
    });

    // central beam
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, H + 1, 12),
      new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }),
    );
    entry.tower.add(beam);

    scene.add(entry.tower);
  },
  update(t, entry) {
    entry.tower.children.forEach((disc) => {
      if (disc.userData.speed) disc.rotation.y = t * disc.userData.speed;
    });
    entry.tower.rotation.y = t * 0.08;
  },
});

/* ------------------------------------------------------------------ */
/* Reveal-on-scroll + demo interactivity                                */
/* ------------------------------------------------------------------ */

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const demoInput = document.getElementById("demo-input");
const demoFaces = document.querySelectorAll(".demo__faces img");
document.querySelectorAll(".demo-chip").forEach((chip) => {
  chip.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".demo-chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    demoInput.value = chip.textContent.replace(/^\S+\s/, "");
    demoFaces.forEach((f) => f.classList.remove("is-active"));
    const face = demoFaces[Number(chip.dataset.face) || 0];
    if (face) face.classList.add("is-active");
  });
});
document.querySelector(".demo__form")?.addEventListener("submit", (e) => e.preventDefault());

animate();
