document.addEventListener("DOMContentLoaded", () => {
  // ===== Elements =====
  const startBtn = document.querySelector(".video-play-btn button");
  const startBtnImg = document.querySelector(".video-play-btn button img");

  const overlay = document.getElementById("videoOverlay");
  const page = document.querySelector(".page");

  const video = document.getElementById("introVideo");
  const control = document.getElementById("videoControl");

  const playIcon = document.getElementById("videoPlayControlIcon"); // ./assets/image/video-play-btn.png
  const pauseIcon = document.getElementById("videoPauseControlIcon"); // ./assets/image/pause-btn.png

  const closeBtn = document.getElementById("videoClose");

  // ===== Safety check =====
  if (
    !startBtn ||
    !startBtnImg ||
    !overlay ||
    !page ||
    !video ||
    !control ||
    !playIcon ||
    !pauseIcon ||
    !closeBtn
  ) {
    console.error("Missing elements. Check your IDs/classes in HTML.");
    return;
  }

  // ===== UI helpers =====
  function showCenterPlay() {
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  }

  function showCenterPause() {
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
  }

  function setStartPlay() {
    startBtnImg.src = "./assets/image/play-btn.png";
  }

  function setStartPause() {
    startBtnImg.src = "./assets/image/pause-btn.png";
  }

  // ===== Initial state =====
  video.pause();
  video.currentTime = 0;
  showCenterPlay();
  setStartPlay();

  // ===== Open overlay (video stays paused + thumbnail shows) =====
  function openOverlayPaused() {
    overlay.classList.add("active");
    page.classList.add("blur");

    // ensure paused + thumbnail visible (poster)
    video.pause();
    video.currentTime = 0;

    // requirement: START icon becomes PAUSE on click
    setStartPause();

    // center control should show PLAY
    showCenterPlay();
  }

  // ===== Close overlay (reset) =====
  function closeOverlay() {
    video.pause();
    video.currentTime = 0;

    overlay.classList.remove("active");
    page.classList.remove("blur");

    showCenterPlay();
    setStartPlay();
  }

  // ===== Toggle play/pause from center control or video click =====
  function togglePlayPause() {
    if (video.paused) {
      video.play().catch((err) => console.error("Video play blocked:", err));
      showCenterPause();
      setStartPause();
    } else {
      video.pause();
      showCenterPlay();
      setStartPlay();
    }
  }

  // ===== Events =====
  startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openOverlayPaused();
  });

  control.addEventListener("click", (e) => {
    e.preventDefault();
    togglePlayPause();
  });

  video.addEventListener("click", (e) => {
    e.preventDefault();
    togglePlayPause();
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeOverlay();
  });

  // click outside video closes
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // if video ends, reset buttons to play state (overlay stays open)
  video.addEventListener("ended", () => {
    showCenterPlay();
    setStartPlay();
  });
});

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

