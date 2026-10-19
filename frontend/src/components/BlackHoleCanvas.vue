<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden bg-transparent pointer-events-none">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full"></canvas>
    <canvas ref="fgCanvasRef" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  colors: {
    type: Array,
    default: () => ['#D4BFFF', '#B3F5E1', '#FFD1B3']
  },
  particleCount: {
    type: Number,
    default: 260
  },
  particleSize: {
    type: Number,
    default: 1.4
  },
  orbitSpeed: {
    type: Number,
    default: 1.2
  },
  pullSpeed: {
    type: Number,
    default: 0.15
  },
  tilt: {
    type: Number,
    default: 32
  },
  tiltSideway: {
    type: Number,
    default: 15
  },
  voidRadius: {
    type: Number,
    default: 11
  },
  trailAlpha: {
    type: Number,
    default: 0.18
  }
});

const containerRef = ref(null);
const canvasRef = ref(null);
const fgCanvasRef = ref(null);

let animFrameId = null;
let particles = [];
let size = { w: 100, h: 100 };

const initParticles = () => {
  const pts = [];
  const outerR = Math.min(size.w, size.h) * 0.46;
  const horizonR = props.voidRadius;

  for (let i = 0; i < props.particleCount; i++) {
    const radius = horizonR + Math.pow(Math.random(), 2) * (outerR - horizonR);
    pts.push({
      angle: Math.random() * Math.PI * 2,
      radius,
      height: (Math.random() - 0.5) * 8,
      speedOffset: 0.75 + Math.random() * 0.5,
      colorIdx: Math.floor(Math.random() * props.colors.length)
    });
  }
  particles = pts;
};

let lastTime = 0;

const draw = (now) => {
  if (!lastTime) lastTime = now;
  const dt = Math.min((now - lastTime) / 16.667, 3);
  lastTime = now;

  const canvas = canvasRef.value;
  const fgCanvas = fgCanvasRef.value;
  if (!canvas || !fgCanvas) return;

  const ctx = canvas.getContext('2d');
  const fgCtx = fgCanvas.getContext('2d');
  if (!ctx || !fgCtx) return;

  const w = size.w;
  const h = size.h;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.globalAlpha = 1.0;
  fgCtx.globalAlpha = 1.0;

  // Trail fade (clears canvas transparently)
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = `rgba(0, 0, 0, ${props.trailAlpha})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';

  fgCtx.globalCompositeOperation = 'destination-out';
  fgCtx.fillStyle = `rgba(0, 0, 0, ${props.trailAlpha})`;
  fgCtx.fillRect(0, 0, w, h);
  fgCtx.globalCompositeOperation = 'source-over';

  const voidCx = w / 2;
  const voidCy = h / 2;
  const outerR = Math.min(w, h) * 0.46;
  const tiltRad = (props.tilt * Math.PI) / 180;
  const tiltSidewayRad = (props.tiltSideway * Math.PI) / 180;
  const perspective = 800;

  const backgroundParticles = [];
  const foregroundParticles = [];

  for (let i = 0; i < particles.length; i++) {
    const pt = particles[i];
    const speedFactor = Math.sqrt(props.voidRadius / Math.max(pt.radius, 5));
    const localOrbitSpeed = props.orbitSpeed * speedFactor * pt.speedOffset;
    const localPullSpeed = props.pullSpeed * speedFactor * pt.speedOffset;

    pt.angle += localOrbitSpeed * 0.012 * dt;
    pt.radius -= localPullSpeed * dt;

    if (pt.radius < props.voidRadius) {
      pt.radius = props.voidRadius + 0.6 * (outerR - props.voidRadius) + Math.random() * 0.4 * (outerR - props.voidRadius);
      pt.angle = Math.random() * Math.PI * 2;
      pt.height = (Math.random() - 0.5) * 8;
      continue;
    }

    const cosA = Math.cos(pt.angle);
    const sinA = Math.sin(pt.angle);

    const x_base = pt.radius * cosA;
    const y_base = pt.height;
    const z_base = pt.radius * sinA;

    const x1 = x_base;
    const y1 = y_base * Math.cos(tiltRad) + z_base * Math.sin(tiltRad);
    const z1 = -y_base * Math.sin(tiltRad) + z_base * Math.cos(tiltRad);

    const x3d = x1 * Math.cos(tiltSidewayRad) - y1 * Math.sin(tiltSidewayRad);
    const y3d = x1 * Math.sin(tiltSidewayRad) + y1 * Math.cos(tiltSidewayRad);
    const z3d = z1;

    const scale = perspective / (perspective + z3d);
    const px = voidCx + x3d * scale;
    const py = voidCy + y3d * scale;

    const pSize = Math.max(0.4, props.particleSize * scale);
    const alpha = Math.max(0.35, 1 - ((z3d + outerR) / (2 * outerR)) * 0.45);
    const color = props.colors[pt.colorIdx % props.colors.length] || '#D4BFFF';

    const projected = { x: px, y: py, size: pSize, alpha, z: z3d, color };
    if (z3d >= 0) {
      backgroundParticles.push(projected);
    } else {
      foregroundParticles.push(projected);
    }
  }

  backgroundParticles.sort((a, b) => b.z - a.z);
  foregroundParticles.sort((a, b) => b.z - a.z);

  // Draw background particles (behind black hole void)
  for (let i = 0; i < backgroundParticles.length; i++) {
    const pt = backgroundParticles[i];
    ctx.globalAlpha = pt.alpha;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw central Event Horizon Void (Black Sphere)
  const sphereGrad = ctx.createRadialGradient(
    voidCx - props.voidRadius * 0.25,
    voidCy - props.voidRadius * 0.3,
    props.voidRadius * 0.05,
    voidCx,
    voidCy,
    props.voidRadius
  );
  sphereGrad.addColorStop(0, 'rgba(15, 16, 25, 1)');
  sphereGrad.addColorStop(0.7, 'rgba(10, 10, 15, 1)');
  sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(voidCx, voidCy, props.voidRadius, 0, Math.PI * 2);
  ctx.fill();

  // Outer Rim Glow
  const primaryColor = props.colors[0] || '#D4BFFF';
  const rimGrad = ctx.createRadialGradient(voidCx, voidCy, props.voidRadius * 0.85, voidCx, voidCy, props.voidRadius * 1.3);
  rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  rimGrad.addColorStop(0.7, primaryColor + '33');
  rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(voidCx, voidCy, props.voidRadius * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Draw foreground particles (in front of void)
  for (let i = 0; i < foregroundParticles.length; i++) {
    const pt = foregroundParticles[i];
    fgCtx.globalAlpha = pt.alpha;
    fgCtx.fillStyle = pt.color;
    fgCtx.beginPath();
    fgCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    fgCtx.fill();
  }

  animFrameId = requestAnimationFrame(draw);
};

let resizeObserver = null;

const setupCanvas = () => {
  const container = containerRef.value;
  const canvas = canvasRef.value;
  const fgCanvas = fgCanvasRef.value;
  if (!container || !canvas || !fgCanvas) return;

  const w = container.clientWidth || 100;
  const h = container.clientHeight || 100;
  size = { w, h };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  fgCanvas.width = w * dpr;
  fgCanvas.height = h * dpr;
  fgCanvas.style.width = `${w}px`;
  fgCanvas.style.height = `${h}px`;

  initParticles();
};

onMounted(() => {
  setupCanvas();
  animFrameId = requestAnimationFrame(draw);

  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (resizeObserver) resizeObserver.disconnect();
});

watch(() => props.colors, () => {
  initParticles();
}, { deep: true });
</script>
