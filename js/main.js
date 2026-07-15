// UAT SYSTEM — Universal AI Transformation
// Three.js starfield background + page interactivity

import * as THREE from "three";

const PURPLE = new THREE.Color("#8b5cf6");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Starfield background                                                 */
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

function makePoints(count, spread, { size, color, opacity }) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size,
    map: particleTexture(),
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

const canvas = document.getElementById("bg-canvas");
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 10;

  const stars = makePoints(900, 40, { size: 0.09, color: new THREE.Color("#6fb6ff"), opacity: 0.55 });
  const purple = makePoints(300, 40, { size: 0.12, color: PURPLE, opacity: 0.35 });
  scene.add(stars, purple);

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  let scrollY = 0;
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    if (!prefersReducedMotion) {
      const t = clock.getElapsedTime();
      stars.rotation.y = t * 0.012;
      purple.rotation.y = -t * 0.008;
      camera.position.y = -scrollY * 0.0006;
    }
    renderer.render(scene, camera);
  })();
}

/* ------------------------------------------------------------------ */
/* Reveal-on-scroll + demo interactivity                                */
/* ------------------------------------------------------------------ */

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const demoInput = document.getElementById("demo-input");
document.querySelectorAll(".demo-chip").forEach((chip) => {
  chip.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".demo-chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    demoInput.value = chip.textContent.replace(/^\S+\s/, "");
  });
});
document.querySelector(".demo__form")?.addEventListener("submit", (e) => e.preventDefault());

/* Fallback for any image that fails to load: swap in a holographic
   silhouette placeholder so the layout never shows a broken icon. */
const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <rect width="300" height="400" fill="#060b16"/>
    <circle cx="150" cy="150" r="58" fill="none" stroke="#00d4ff" stroke-opacity="0.55" stroke-width="2"/>
    <path d="M60 340 q90 -120 180 0" fill="none" stroke="#00d4ff" stroke-opacity="0.55" stroke-width="2"/>
    <circle cx="150" cy="150" r="90" fill="none" stroke="#8b5cf6" stroke-opacity="0.25" stroke-width="1"/>
  </svg>`);

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => {
    if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
  }, { once: true });
  if (img.complete && img.naturalWidth === 0 && img.src && img.src !== FALLBACK_SVG) {
    img.src = FALLBACK_SVG;
  }
});
