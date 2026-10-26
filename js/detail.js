"use strict";
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // 1) Reading progress + parallax hero (satu rAF supaya ringan)
  const bar = document.querySelector(".dt-progress span");
  const heroMedia = document.querySelector(".dt-hero-media");
  const hero = document.querySelector(".dt-hero");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ")";
      if (heroMedia && hero && !reduced.matches && scrollY < hero.offsetHeight) {
        heroMedia.style.setProperty("--py", (scrollY * 0.25).toFixed(1) + "px");
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // 2) Table of contents: highlight the section being read
  const tocLinks = Array.from(document.querySelectorAll(".dt-toc a"));
  const sections = tocLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tocLinks.forEach((link) =>
            link.getAttribute("href") === "#" + entry.target.id
              ? link.setAttribute("aria-current", "true")
              : link.removeAttribute("aria-current"),
          );
        }),
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((section) => spy.observe(section));
  }

  // 3) Card highlight follows the cursor
  document.querySelectorAll(".dt-meta-card, .dt-related-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - rect.left + "px");
      card.style.setProperty("--my", event.clientY - rect.top + "px");
    });
  });

  // 4) Lightbox: click an image to enlarge
  const dialog = document.querySelector(".dt-lightbox");
  const cover = document.querySelector(".dt-cover");
  if (dialog && cover && typeof dialog.showModal === "function") {
    const openers = [cover, ...document.querySelectorAll(".dt-zoom")];
    openers.forEach((el) => el.addEventListener("click", () => dialog.showModal()));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest(".dt-lightbox-close")) dialog.close();
    });
  } else {
    document.querySelectorAll(".dt-zoom").forEach((el) => el.remove());
  }
})();
