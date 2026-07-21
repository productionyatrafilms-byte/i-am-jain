document.addEventListener("DOMContentLoaded", () => {
  // ===== Elements =====
  const startBtn = document.querySelector(".video-play-btn button");
  const startBtnImg = document.querySelector(".video-play-btn button img");

  const overlay = document.getElementById("videoOverlay");
  const page = document.querySelector(".page");

  const video = document.getElementById("introVideo");
  const control = document.getElementById("videoControl");

  const playIcon = document.getElementById("videoPlayControlIcon");
  const pauseIcon = document.getElementById("videoPauseControlIcon");

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

  // ===== Open overlay =====
  function openOverlayPaused() {
    overlay.classList.add("active");
    page.classList.add("blur");

    video.pause();
    video.currentTime = 0;

    setStartPause();
    showCenterPlay();
  }

  // ===== Close overlay =====
  function closeOverlay() {
    video.pause();
    video.currentTime = 0;

    overlay.classList.remove("active");
    page.classList.remove("blur");

    showCenterPlay();
    setStartPlay();
  }

  // ===== Toggle play/pause =====
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

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  video.addEventListener("ended", () => {
    showCenterPlay();
    setStartPlay();
  });
});

// =========================
// Language Switcher with selected language persistence + Audio
// Uses: data-lang-key="..."
// =========================
(() => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "en";
  const LANG_JSON_URL = "./assets/lang/lang.json";

  // Add your audio files here
  const LANG_AUDIO = {
    en: "./assets/audio/Eng.mpeg",
    hi: "./assets/audio/Hin.mpeg",
    gu: "./assets/audio/Guj.mpeg",
  };

  let currentAudio = null;
  let LANG_DATA = null;

  function getValidLang(lang) {
    return ["en", "hi", "gu"].includes(lang) ? lang : DEFAULT_LANG;
  }

  const savedLang = getValidLang(
    localStorage.getItem(LANG_KEY) || DEFAULT_LANG,
  );

  // Apply saved language immediately
  document.documentElement.setAttribute("lang", savedLang);
  document.body?.setAttribute("data-lang", savedLang);

  const btnEn = document.querySelector(".lang-btn .english");
  const btnHi = document.querySelector(".lang-btn .hindi");
  const btnGu = document.querySelector(".lang-btn .Gujrati");

  const buttons = [btnEn, btnHi, btnGu].filter(Boolean);

  const langBtnMap = {
    en: btnEn,
    hi: btnHi,
    gu: btnGu,
  };

  function playLanguageAudio(lang) {
    const audioSrc = LANG_AUDIO[lang];
    if (!audioSrc) return;

    // Stop previous language audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(audioSrc);

    currentAudio.play().catch((err) => {
      console.error("Language audio blocked:", err);
    });
  }

  function setActiveByLang(lang) {
    buttons.forEach((b) => b.classList.remove("active"));
    langBtnMap[lang]?.classList.add("active");
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
    if (!res.ok) throw new Error("Language JSON not found");

    LANG_DATA = await res.json();
    return LANG_DATA;
  }

  async function setLanguage(lang, shouldSave = true, shouldPlayAudio = false) {
    lang = getValidLang(lang);

    try {
      document.documentElement.setAttribute("lang", lang);
      document.body.setAttribute("data-lang", lang);

      setActiveByLang(lang);

      if (shouldSave) {
        localStorage.setItem(LANG_KEY, lang);
      }

      const data = await loadAllLangDataOnce();
      const dict = data?.[lang];

      if (dict) {
        applyTranslations(dict);
      }

      // Play audio only when user clicks language button
      if (shouldPlayAudio) {
        playLanguageAudio(lang);
      }
    } catch (err) {
      console.error("Language load failed:", err);
    }
  }

  btnEn?.addEventListener("click", () => setLanguage("en", true, true));
  btnHi?.addEventListener("click", () => setLanguage("hi", true, true));
  btnGu?.addEventListener("click", () => setLanguage("gu", true, true));

  document.addEventListener("DOMContentLoaded", () => {
    const currentLang = getValidLang(
      localStorage.getItem(LANG_KEY) || DEFAULT_LANG,
    );

    // Apply saved language without playing audio
    setLanguage(currentLang, false, false);
  });
})();

// =========================
// Mobile Portrait -> show "Rotate to Landscape" popup
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
    if (isMobile() && isPortrait()) overlay.classList.add("show");
    else overlay.classList.remove("show");
  }

  window.addEventListener("load", checkRotate);
  window.addEventListener("resize", checkRotate);
  window.addEventListener("orientationchange", checkRotate);
})();
