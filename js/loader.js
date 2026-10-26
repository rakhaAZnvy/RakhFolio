"use strict";
(() => {
  const root = document.documentElement;
  const loader = document.getElementById("loader");
  if (!loader) return;

  // Sudah pernah tampil di sesi ini → hide immediately
  if (root.classList.contains("no-loader")) {
    loader.remove();
    return;
  }

  const track = loader.querySelector(".loader-track");
  const percent = loader.querySelector(".loader-percent");
  const text = loader.querySelector(".loader-text");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DURATION = reduced ? 600 : 2800; // lama minimal kucing berjalan (ms)
  const HOLD_AT = 92; // hold here until the page has fully loaded
  const start = performance.now();
  let pageLoaded = document.readyState === "complete";
  let progress = 0;

  window.addEventListener("load", () => {
    pageLoaded = true;
  });
  setTimeout(() => {
    pageLoaded = true; // fallback in case a resource gets stuck
  }, 8000);

  function render(value) {
    const rounded = Math.round(value);
    loader.style.setProperty("--p", value.toFixed(2));
    percent.textContent = rounded + "%";
    track.setAttribute("aria-valuenow", rounded);
  }

  function finish() {
    text.textContent = "Ready!";
    text.classList.add("is-ready");
    try {
      sessionStorage.setItem("portfolioLoader", "1");
    } catch (e) {}
    setTimeout(() => {
      loader.classList.add("done");
      root.classList.remove("is-loading");
      root.classList.add("page-entering");
      window.dispatchEvent(new Event("portfolio:loader-finished"));
      setTimeout(() => loader.remove(), 800);
    }, 350);
  }

  function tick(now) {
    const target = Math.min(((now - start) / DURATION) * 100, 100);
    progress = Math.max(progress, pageLoaded ? target : Math.min(target, HOLD_AT));
    render(progress);
    if (progress >= 100) finish();
    else requestAnimationFrame(tick);
  }

  render(0);
  requestAnimationFrame(tick);
})();
