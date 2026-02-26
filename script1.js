// =========================
// 0) Elements
// =========================
const circleContainer = document.querySelector(".circle-container"); // parent of circle + subtitle
const container = document.querySelector(".scripture-scroll-container");
const roll = document.querySelector(".roll");
const p1 = document.querySelector(".perchment-1");

const circleContainerEl = document.querySelector(".circle-container"); // for open-controls class
const parchmentEl = document.querySelector(".parchment-content");
const paginationEl = document.querySelector(".left-pagination");
const starMaskEl = document.querySelector(".star-mask");
const characterEl = document.querySelector(
  ".right .right-img-container .character",
);

let hasOpened = false;

// =========================
// 1) Open function
// =========================
function openScrollOnce() {
  if (hasOpened) return;
  hasOpened = true;

  // start opening animation
  if (container) container.classList.add("open");

  // show page navigation buttons (prev/next)
  if (circleContainerEl) circleContainerEl.classList.add("open-controls");

  // wait for roll transition to finish
  if (!roll) return;

  const onDone = (e) => {
    if (e.propertyName !== "max-width") return;

    if (p1) p1.style.display = "block";
    if (parchmentEl) parchmentEl.classList.add("show");
    if (paginationEl) paginationEl.classList.add("show");
    if (starMaskEl) starMaskEl.classList.add("show");
    if (characterEl) characterEl.style.display = "none";

    document.querySelectorAll(".star-video").forEach((v) => {
      v.play().catch(() => {});
    });

    roll.removeEventListener("transitionend", onDone);
  };

  roll.addEventListener("transitionend", onDone);
}

// =========================
// 2) Click handling (circle + subtitle) using delegation
// =========================
if (circleContainer) {
  circleContainer.addEventListener("click", (e) => {
    // click on circle OR subtitle OR subtitle span
    if (e.target.closest(".circle") || e.target.closest(".sub-title")) {
      openScrollOnce();
    }
  });
}

// =========================
// 3) Star mask build (canvas hard-edge mask)
// =========================
(() => {
  const src = "./assets/image/star-img.png";
  const TH = 235;

  async function buildMaskFor(el) {
    const img = new Image();
    img.src = src;
    await img.decode();

    const rect = el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(rect.width * dpr));
    c.height = Math.max(1, Math.round(rect.height * dpr));

    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, c.width, c.height);

    const im = ctx.getImageData(0, 0, c.width, c.height);
    const d = im.data;

    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      d[i + 3] = a >= TH ? 255 : 0;
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
    }

    ctx.putImageData(im, 0, 0);
    el.style.setProperty("--starMask", `url("${c.toDataURL("image/png")}")`);
  }

  async function rebuildAll() {
    const els = document.querySelectorAll(".star-mask");
    for (const el of els) await buildMaskFor(el);
  }

  window.addEventListener("load", rebuildAll);
  window.addEventListener("resize", () => {
    clearTimeout(window.__maskT);
    window.__maskT = setTimeout(rebuildAll, 150);
  });
})();

// =========================
// 4) Swipers (text + media synced)
// =========================
const textSwiperInstance = new Swiper(".textSwiper", {
  loop: false,
  speed: 400,
  allowTouchMove: true,
  navigation: { nextEl: ".p-next", prevEl: ".p-prev" },
  pagination: { el: ".left-pagination", clickable: true },
});

const mediaSwiperInstance = new Swiper(".mediaSwiper", {
  loop: false,
  speed: 400,
  allowTouchMove: true,
});

textSwiperInstance.controller.control = mediaSwiperInstance;
mediaSwiperInstance.controller.control = textSwiperInstance;

// =========================
// 5) Hide Swiper arrows only (NOT circle-controls)
// =========================
const prevBtnEls = document.querySelectorAll(".p-prev, .p-prev i");
const nextBtnEls = document.querySelectorAll(".p-next , .p-next i");

function syncSwiperArrows(swiper) {
  prevBtnEls.forEach((b) =>
    b.classList.toggle("is-hidden", swiper.isBeginning),
  );
  nextBtnEls.forEach((b) => b.classList.toggle("is-hidden", swiper.isEnd));
}

syncSwiperArrows(textSwiperInstance);
textSwiperInstance.on("slideChange", () =>
  syncSwiperArrows(textSwiperInstance),
);

// =========================
// Language Switcher (single JSON file)
// Uses: data-lang-key="..."
// English default active on every load
// =========================
(() => {
  const btnEn = document.querySelector(".lang-btn .english");
  const btnHi = document.querySelector(".lang-btn .hindi");
  const btnGu = document.querySelector(".lang-btn .Gujrati"); // your class

  const buttons = [btnEn, btnHi, btnGu].filter(Boolean);

  const LANG_JSON_URL = "./assets/lang/lang.json";
  let LANG_DATA = null;

  function setActive(btn) {
    buttons.forEach((b) => b.classList.remove("active"));
    btn?.classList.add("active");
  }

  function setText(el, value) {
    if (typeof value !== "string") return;
    el.innerHTML = value.replace(/\n/g, "<br>");
  }

  function applyTranslations(dictForLang) {
    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.getAttribute("data-lang-key");
      if (!key) return;

      const value = dictForLang?.[key];
      if (value == null) return;

      setText(el, value);
    });
  }

  async function loadAllLangDataOnce() {
    if (LANG_DATA) return LANG_DATA;
    const res = await fetch(LANG_JSON_URL, { cache: "no-store" });
    LANG_DATA = await res.json();
    return LANG_DATA;
  }

  async function setLanguage(lang) {
    try {
      const data = await loadAllLangDataOnce();
      const dict = data?.[lang];
      if (!dict) return;

      document.body.setAttribute("data-lang", lang); // ✅ add this

      applyTranslations(dict);
    } catch (err) {
      console.error("Language load failed:", err);
    }
  }
  btnEn?.addEventListener("click", () => {
    setActive(btnEn);
    setLanguage("en");
  });

  btnHi?.addEventListener("click", () => {
    setActive(btnHi);
    setLanguage("hi");
  });

  btnGu?.addEventListener("click", () => {
    setActive(btnGu);
    setLanguage("gu");
  });

  // ✅ Default every time page loads: English
  window.addEventListener("DOMContentLoaded", () => {
    setActive(btnEn);
    setLanguage("en");
  });
})();

// =========================
// Mobile Portrait -> show "Rotate to Landscape" popup
// Paste this at the END of your who-am-i.js
// =========================
(() => {
  const overlay = document.createElement("div");
  overlay.id = "rotateOverlay";
  overlay.innerHTML = `
    <div class="rotate-box">
      <div class="rotate-icon">📱↻</div>
      <div class="rotate-title">Please rotate your phone</div>
      <div class="rotate-sub">View this page in <b>Landscape</b> mode for best experience.</div>
      <button class="rotate-btn" type="button">OK</button>
    </div>
  `;

  // style (no extra CSS file needed)
  const style = document.createElement("style");
  style.textContent = `
    #rotateOverlay{
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(0,0,0,.75);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    #rotateOverlay.show{ display: flex; }

    #rotateOverlay .rotate-box{
      max-width: 420px;
      width: 100%;
      border-radius: 16px;
      padding: 18px 18px 14px;
      background: #fff;
      text-align: center;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }
    #rotateOverlay .rotate-icon{ font-size: 34px; margin-bottom: 6px; }
    #rotateOverlay .rotate-title{ font-size: 18px; font-weight: 700; margin-bottom: 6px; }
    #rotateOverlay .rotate-sub{ font-size: 14px; line-height: 1.4; color: #333; margin-bottom: 12px; }
    #rotateOverlay .rotate-btn{
      width: 100%;
      border: none;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      background: #81019d;
      color: #fff;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const okBtn = overlay.querySelector(".rotate-btn");
  okBtn.addEventListener("click", () => overlay.classList.remove("show"));

  function isMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function isPortrait() {
    return window.matchMedia("(orientation: portrait)").matches;
  }

  function checkRotate() {
    // show only on mobile + portrait
    if (isMobile() && isPortrait()) overlay.classList.add("show");
    else overlay.classList.remove("show");
  }

  window.addEventListener("load", checkRotate);
  window.addEventListener("resize", checkRotate);
  window.addEventListener("orientationchange", checkRotate);
})();
