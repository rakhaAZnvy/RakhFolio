"use strict";
(() => {
  const brand = document.querySelector(".brand");
  if (!brand) return;

  const nameNode = Array.from(brand.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
  );
  if (!nameNode) return;

  const fullText = nameNode.textContent.trim();
  const accent = Array.from(brand.children).find((node) => node.tagName === "SPAN");
  const typedBox = document.createElement("i");
  typedBox.className = "brand-typed-name";
  typedBox.setAttribute("aria-hidden", "true");
  const typedText = document.createElement("b");
  typedText.className = "brand-typed-content";
  typedBox.append(typedText);
  nameNode.replaceWith(typedBox);
  brand.setAttribute("aria-label", fullText + (accent ? accent.textContent : ""));

  const font = getComputedStyle(brand);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) context.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
  const letterSpacing = parseFloat(font.letterSpacing) || 0;
  const measure = (value) =>
    (context ? context.measureText(value).width : value.length * parseFloat(font.fontSize) * 0.58) +
    Math.max(0, value.length - 1) * letterSpacing;
  typedBox.style.width = `${Math.ceil(measure(fullText) + 5)}px`;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let started = false;
  function startTyping() {
    if (started) return;
    started = true;
    if (reducedMotion.matches) {
      typedText.textContent = fullText;
      typedText.style.width = `${measure(fullText) + 3}px`;
      return;
    }

    const chars = Array.from(fullText);
    let index = 0;
    let deleting = false;
    function step() {
      typedText.textContent = chars.slice(0, index).join("");
      typedText.style.width = `${measure(typedText.textContent) + 3}px`;

      if (!deleting && index === chars.length) {
        deleting = true;
        setTimeout(step, 1250);
        return;
      }
      if (deleting && index === 0) {
        deleting = false;
        setTimeout(step, 450);
        return;
      }

      index += deleting ? -1 : 1;
      setTimeout(step, deleting ? 48 : 88);
    }
    step();
  }

  const root = document.documentElement;
  if (!root.classList.contains("is-loading")) startTyping();
  else window.addEventListener("portfolio:loader-finished", startTyping, { once: true });
})();
