"use strict";
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".site-header");
  const resizeNav = () =>
    document.documentElement.style.setProperty(
      "--nav-height",
      (header ? header.getBoundingClientRect().height : 0) + "px",
    );
  resizeNav();
  if ("ResizeObserver" in window && header) new ResizeObserver(resizeNav).observe(header);
  else window.addEventListener("resize", resizeNav);
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  let observer;
  function motion() {
    if (observer) observer.disconnect();
    document.documentElement.classList.remove("motion-ready");
    reveals.forEach((el) => el.classList.add("is-visible"));
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.classList.toggle("is-visible", entry.isIntersecting),
        );
      },
      { threshold: 0.08 },
    );
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      el.classList.toggle("is-visible", rect.bottom > 0 && rect.top < innerHeight);
      observer.observe(el);
    });
    document.documentElement.classList.add("motion-ready");
  }
  motion();
  reduced.addEventListener?.("change", motion);
  document.querySelectorAll(".slider").forEach((slider) => {
    const track = slider.querySelector(".track");
    const previous = slider.querySelector('[data-direction="-1"]');
    const next = slider.querySelector('[data-direction="1"]');
    const update = () => {
      const end = track.scrollWidth - track.clientWidth;
      previous.disabled = track.scrollLeft <= 3;
      next.disabled = track.scrollLeft >= end - 3;
    };
    slider.querySelectorAll("[data-direction]").forEach((button) =>
      button.addEventListener("click", () => {
        const card = track.querySelector(".card");
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        track.scrollBy({
          left:
            Number(button.dataset.direction) *
            ((card ? card.offsetWidth : track.clientWidth) + gap),
          behavior: reduced.matches ? "auto" : "smooth",
        });
      }),
    );
    track.addEventListener("keydown", (event) => {
      if (event.target !== track) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        (event.key === "ArrowRight" ? next : previous).click();
      }
    });
    let down = false,
      startX = 0,
      startScroll = 0,
      dragged = false,
      suppressUntil = 0;
    track.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      down = true;
      dragged = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
    });
    window.addEventListener(
      "pointermove",
      (event) => {
        if (!down) return;
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 6) {
          dragged = true;
          track.classList.add("dragging");
        }
        if (dragged) {
          event.preventDefault();
          track.scrollLeft = startScroll - delta;
        }
      },
      { passive: false },
    );
    const stop = () => {
      if (!down) return;
      down = false;
      track.classList.remove("dragging");
      if (dragged) suppressUntil = Date.now() + 350;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    track.addEventListener(
      "click",
      (event) => {
        if (Date.now() < suppressUntil) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true,
    );
    track.addEventListener("dragstart", (event) => event.preventDefault());
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
  const links = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  if ("IntersectionObserver" in window && sections.length) {
    const active = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) =>
            link.hash === "#" + entry.target.id
              ? link.setAttribute("aria-current", "location")
              : link.removeAttribute("aria-current"),
          );
        }),
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((section) => active.observe(section));
  }
})();
