"use strict";
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const blocked = "a, button, input, textarea, select, summary, [role='button'], .track, .loader";
  const logoAsset = new URL("../assets/favicon.png", document.currentScript.src).href;
  const hint = document.createElement("span");
  hint.className = "logo-poof-hint";
  hint.textContent = "Click an empty area to launch my logo";
  hint.setAttribute("aria-hidden", "true");
  if (!reducedMotion.matches) document.body.append(hint);

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || reducedMotion.matches || event.target.closest(blocked)) return;

    const surface = event.target.closest("body, main, section, header, footer, .container");
    if (!surface || event.target.closest("p, h1, h2, h3, li, article, img, svg")) return;
    const x = event.clientX;
    const y = event.clientY;
    const heading = Math.random() * Math.PI * 2;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const vx = Math.cos(heading);
    const vy = Math.sin(heading);
    const edgeDistances = [];
    const edgePadding = 56;
    if (vx > 0) edgeDistances.push((width + edgePadding - x) / vx);
    else if (vx < 0) edgeDistances.push((-edgePadding - x) / vx);
    if (vy > 0) edgeDistances.push((height + edgePadding - y) / vy);
    else if (vy < 0) edgeDistances.push((-edgePadding - y) / vy);
    const distance = Math.min(...edgeDistances) + 44;
    const dx = vx * distance;
    const dy = vy * distance;
    const spin = 1440 + Math.random() * 1800;
    const flightTime = Math.min(4200, Math.max(1500, distance * 1.7));

    const poof = document.createElement("span");
    poof.className = "logo-poof";
    poof.setAttribute("aria-hidden", "true");
    poof.style.left = `${x}px`;
    poof.style.top = `${y}px`;
    poof.style.setProperty("--dx", `${dx}px`);
    poof.style.setProperty("--dy", `${dy}px`);
    poof.style.setProperty("--dx-short", `${dx * 0.08}px`);
    poof.style.setProperty("--dy-short", `${dy * 0.08}px`);
    poof.style.setProperty("--spin", `${spin}deg`);
    poof.style.setProperty("--flight-time", `${flightTime}ms`);

    const ring = document.createElement("i");
    ring.className = "logo-poof-ring";
    poof.append(ring);

    for (let index = 0; index < 9; index += 1) {
      const smoke = document.createElement("i");
      const angle = (Math.PI * 2 * index) / 9 + Math.random() * 0.45;
      const puffDistance = 38 + Math.random() * 48;
      smoke.className = "logo-poof-smoke";
      smoke.style.setProperty("--smoke-x", `${Math.cos(angle) * puffDistance}px`);
      smoke.style.setProperty("--smoke-y", `${Math.sin(angle) * puffDistance}px`);
      smoke.style.setProperty("--smoke-size", `${0.9 + Math.random() * 1.1}`);
      smoke.style.setProperty("--smoke-delay", `${Math.random() * 110}ms`);
      poof.append(smoke);
    }

    for (let index = 0; index < 6; index += 1) {
      const spark = document.createElement("i");
      const angle = (Math.PI * 2 * index) / 6 + Math.random() * 0.3;
      const sparkDistance = 48 + Math.random() * 34;
      spark.className = "logo-poof-spark";
      spark.style.setProperty("--spark-x", `${Math.cos(angle) * sparkDistance}px`);
      spark.style.setProperty("--spark-y", `${Math.sin(angle) * sparkDistance}px`);
      spark.style.setProperty("--spark-delay", `${Math.random() * 100}ms`);
      poof.append(spark);
    }

    const image = document.createElement("img");
    image.src = logoAsset;
    image.alt = "";
    image.draggable = false;
    poof.append(image);
    document.body.append(poof);
    poof.addEventListener("animationend", (animation) => {
      if (animation.target === poof) poof.remove();
    });
  });
})();
