"use strict";
(() => {
  const canvas = document.createElement("canvas");
  canvas.className = "neural-background";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: -1000, y: -1000, active: false };
  let width = 0;
  let height = 0;
  let scale = 1;
  let nodes = [];
  let edges = [];
  let frame = 0;
  let lastDraw = 0;

  const random = (seed) => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  function resize() {
    scale = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const spacing = width < 600 ? 92 : 118;
    const cols = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;
    nodes = [];
    for (let row = -1; row < rows; row += 1) {
      for (let col = -1; col < cols; col += 1) {
        const id = (row + 2) * 10000 + col + 2;
        nodes.push({
          x: col * spacing + (random(id) - 0.5) * spacing * 0.62,
          y: row * spacing + (random(id + 1) - 0.5) * spacing * 0.62,
          phase: random(id + 2) * Math.PI * 2,
        });
      }
    }

    edges = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (dx * dx + dy * dy < spacing * spacing * 1.85) edges.push([i, j]);
      }
    }
    draw(performance.now());
  }

  function closestPoint(px, py, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / length));
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    return { x, y, distance: Math.hypot(px - x, py - y), t };
  }

  function draw(time) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const t = time / 1000;
    const near = [];

    for (const [ai, bi] of edges) {
      const a = nodes[ai];
      const b = nodes[bi];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      let bendX = 0;
      let bendY = 0;
      let glow = 0;
      if (pointer.active) {
        const p = closestPoint(pointer.x, pointer.y, a, b);
        const influence = Math.max(0, 1 - p.distance / 190);
        if (influence > 0) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          bendX = dx * influence * 0.16;
          bendY = dy * influence * 0.16;
          glow = influence;
          near.push({ x: p.x, y: p.y, amount: influence });
        }
      }
      const wave = reducedMotion.matches ? 0 : Math.sin(t * 0.65 + a.phase) * 0.018;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mid.x + bendX, mid.y + bendY, b.x, b.y);
      ctx.strokeStyle = glow > 0.04
        ? `rgba(226, 89, 59, ${0.12 + glow * 0.55})`
        : `rgba(102, 151, 130, ${0.10 + wave})`;
      ctx.lineWidth = glow > 0.04 ? 0.7 + glow * 1.1 : 0.75;
      if (glow > 0.25) {
        ctx.shadowColor = "rgba(226, 89, 59, 0.65)";
        ctx.shadowBlur = glow * 12;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    for (const node of nodes) {
      let x = node.x;
      let y = node.y;
      let influence = 0;
      if (pointer.active) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const distance = Math.hypot(dx, dy) || 1;
        influence = Math.max(0, 1 - distance / 175);
        x += dx * influence * 0.11;
        y += dy * influence * 0.11;
      }
      const pulse = reducedMotion.matches ? 0 : (Math.sin(t * 1.2 + node.phase) + 1) * 0.5;
      const radius = 1.1 + pulse * 0.65 + influence * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = influence > 0.08
        ? `rgba(226, 89, 59, ${0.35 + influence * 0.6})`
        : `rgba(181, 187, 190, ${0.19 + pulse * 0.15})`;
      ctx.fill();
    }

    if (pointer.active && near.length) {
      const closest = near.reduce((best, item) => item.amount > best.amount ? item : best);
      const grad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 125);
      grad.addColorStop(0, "rgba(226, 89, 59, 0.08)");
      grad.addColorStop(1, "rgba(226, 89, 59, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(pointer.x - 125, pointer.y - 125, 250, 250);
      ctx.beginPath();
      ctx.arc(closest.x, closest.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(243, 241, 234, 0.9)";
      ctx.fill();
    }
  }

  function animate(time) {
    if (time - lastDraw > 32) {
      draw(time);
      lastDraw = time;
    }
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
  }

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    if (reducedMotion.matches) draw(performance.now());
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
    if (reducedMotion.matches) draw(performance.now());
  });
  window.addEventListener("resize", resize, { passive: true });
  reducedMotion.addEventListener?.("change", () => {
    cancelAnimationFrame(frame);
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
    else draw(performance.now());
  });

  resize();
  if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
})();
