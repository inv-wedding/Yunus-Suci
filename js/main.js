(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Safety net: if any script error occurs, CSS forces all content to stay visible.
  window.addEventListener("error", () => document.documentElement.classList.add("fx-failed"));

  // Fungsi perpindahan halaman; diganti dengan animasi lambat di bagian "Perpindahan halaman".
  let goToEl = (el) => el && el.scrollIntoView({ behavior: "smooth", block: "start" });
  let goToY = (y) => window.scrollTo({ top: y, behavior: "smooth" });

  const config = window.WEDDING_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const wedding = config.wedding || {};
  const galleryItems = Array.isArray(config.gallery) ? config.gallery : [];
  const toast = $("toastMessage");
  let toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // Date and countdown: the configured timestamp includes the Jakarta UTC+7 offset.
  const targetDate = new Date(wedding.date || "").getTime();
  const countdownIds = [
    ["days", "daysLarge"], ["hours", "hoursLarge"],
    ["minutes", "minutesLarge"], ["seconds", "secondsLarge"]
  ];
  const countdownMessage = $("countdownMessage");

  function updateCountdown() {
    if (!Number.isFinite(targetDate)) {
      countdownIds.flat().forEach((id) => { if ($(id)) $(id).textContent = "—"; });
      if (countdownMessage) countdownMessage.textContent = "Tanggal pernikahan belum diatur.";
      return;
    }
    const remaining = targetDate - Date.now();
    if (remaining <= 0) {
      countdownIds.flat().forEach((id) => { if ($(id)) $(id).textContent = "00"; });
      if (countdownMessage) countdownMessage.textContent = "Hari bahagia telah tiba. Mohon doa restu untuk Yunus & Suci.";
      return;
    }
    const seconds = Math.floor(remaining / 1000);
    const values = [
      Math.floor(seconds / 86400),
      Math.floor(seconds / 3600) % 24,
      Math.floor(seconds / 60) % 60,
      seconds % 60
    ];
    countdownIds.forEach((pair, index) => pair.forEach((id) => {
      const element = $(id);
      if (!element) return;
      const text = String(values[index]).padStart(2, "0");
      if (element.textContent === text) return;
      const firstPaint = /^-+$/.test(element.textContent);
      element.textContent = text;
      if (!firstPaint && !reduceMotion) {
        element.classList.remove("tick");
        void element.offsetWidth;
        element.classList.add("tick");
      }
    }));
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // Centralized display date and optional event times.
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: wedding.timezone || "Asia/Jakarta"
  });
  if (wedding.date && Number.isFinite(targetDate)) {
    const dateLabel = dateFormatter.format(new Date(targetDate));
    if ($("coverDate")) $("coverDate").textContent = dateLabel;
  }
  function setEventTime(id, value) {
    const element = $(id);
    if (!element) return;
    element.textContent = value && String(value).trim()
      ? String(value).trim()
      : "Waktu akan diinformasikan";
  }
  setEventTime("akadTime", wedding.akadTime);
  setEventTime("receptionTime", wedding.receptionTime);
  if (config.venue?.mapsUrl && $("mapsLink")) $("mapsLink").href = config.venue.mapsUrl;

  // Wedding gift: kartu rekening dibuat dari config.gift.accounts, lengkap dengan tombol salin.
  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch (error) { /* lanjut ke cara cadangan */ }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:-100px;opacity:0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
    area.remove();
    return ok;
  }
  const giftList = $("giftList");
  const giftAccounts = Array.isArray(config.gift?.accounts) ? config.gift.accounts : [];
  if (giftList) {
    if (!giftAccounts.length) giftList.closest(".gift-section")?.setAttribute("hidden", "");
    giftAccounts.forEach((account) => {
      const card = document.createElement("article");
      card.className = "gift-card reveal";
      const bank = document.createElement("p");
      bank.className = "gift-bank";
      bank.textContent = account.bank || "";
      const number = document.createElement("p");
      number.className = "gift-number";
      number.textContent = account.number || "";
      const holder = document.createElement("p");
      holder.className = "gift-holder";
      holder.textContent = `a.n. ${account.holder || ""}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.setAttribute("aria-label", `Salin nomor rekening ${account.bank || ""}`);
      button.innerHTML = '<span class="copy-label">SALIN NOMOR</span><b aria-hidden="true">❐</b>';
      button.addEventListener("click", async () => {
        const ok = await copyText(String(account.number || "").replace(/\s/g, ""));
        const label = button.querySelector(".copy-label");
        showToast(ok ? `Nomor rekening ${account.bank} berhasil disalin.` : "Belum dapat menyalin. Silakan salin nomor secara manual.");
        if (ok && label) {
          label.textContent = "TERSALIN ✓";
          button.classList.add("copied");
          window.setTimeout(() => { label.textContent = "SALIN NOMOR"; button.classList.remove("copied"); }, 2200);
        }
      });
      card.append(bank, number, holder, button);
      giftList.appendChild(card);
    });
  }

  // Build all gallery tiles from the single configuration array.
  const gallery = $("photoGallery");
  if (gallery) {
    galleryItems.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-photo reveal";
      button.dataset.galleryIndex = String(index);
      button.setAttribute("aria-label", `Lihat foto ${index + 1}: ${item.alt || "Yunus dan Suci"}`);
      const image = document.createElement("img");
      image.src = item.src;
      image.alt = item.alt || `Foto Yunus dan Suci ${index + 1}`;
      image.loading = "lazy";
      image.decoding = "async";
      if (item.focus) image.style.objectPosition = item.focus;
      image.addEventListener("error", () => {
        button.classList.add("image-unavailable");
        button.setAttribute("aria-label", "Foto tidak dapat dimuat");
      }, { once: true });
      button.appendChild(image);
      gallery.appendChild(button);
    });
  }

  // Scroll reveal: teks & foto masuk dari kiri, kanan, bawah, atau zoom.
  const fxRules = [
    [".person-groom .person-photo", "left"],
    [".person-groom .person-copy", "stagger-right"],
    [".person-bride .person-photo", "right"],
    [".person-bride .person-copy", "stagger-left"],
    [".section-heading", "stagger-alt"],
    [".event-item:nth-child(odd)", "left"],
    [".event-item:nth-child(even)", "right"],
    [".gold-rule, .cover-monogram, .closing-monogram, .couple-divider, .location-pin, .date-display, .arabic-verse", "zoom"],
    [".cover-countdown, .date-countdown, .open-invitation, .maps-button", "up"]
  ];
  fxRules.forEach(([selector, fx]) => document.querySelectorAll(selector).forEach((element) => {
    if (element.classList.contains("reveal")) element.dataset.fx = fx;
  }));
  document.querySelectorAll(".gallery-photo.reveal").forEach((element, index) => {
    element.dataset.fx = index === 0 ? "zoom" : (index % 2 ? "left" : "right");
  });
  // Elemen lainnya bergantian kiri / kanan di dalam tiap section.
  document.querySelectorAll("main > section").forEach((section) => {
    let n = 0;
    section.querySelectorAll(".reveal:not([data-fx])").forEach((element) => {
      element.dataset.fx = n++ % 2 ? "right" : "left";
    });
  });
  document.querySelectorAll('.reveal[data-fx^="stagger"]').forEach((element) => {
    [...element.children].forEach((child, i) => child.style.setProperty("--i", String(i)));
  });

  // Reveal DUA ARAH: muncul saat masuk layar; saat keluar (ke atas / ke bawah) hilang,
  // lalu muncul lagi dengan animasi yang sama ketika di-scroll kembali.
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      let n = 0;
      // Urutkan agar elemen di bagian atas halaman muncul lebih dulu (efek berurutan).
      entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach((entry) => {
        const element = entry.target;
        if (entry.isIntersecting) {
          element.style.transitionDelay = `${Math.min(n++, 6) * 200}ms`;
          element.classList.remove("out-up");
          element.classList.add("visible");
        } else {
          // Keluar lewat atas layar -> terbang ke atas; lewat bawah -> kembali ke posisi awal.
          const exitedTop = entry.boundingClientRect.top < 0;
          element.style.transitionDelay = "0ms";
          element.classList.toggle("out-up", exitedTop);
          element.classList.remove("visible");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  // Kilauan (sprinkle) melayang di SELURUH halaman: satu lapisan per section.
  const sparkleLayers = [];
  if (!reduceMotion) {
    const glyphs = ["✦", "✧", "♡", "✦", "·", "✧"];
    const darkSections = ["home", "date", "location", "closing"];
    const lowEnd = (navigator.hardwareConcurrency || 4) <= 4;
    const buildSparkles = (section) => {
      const layer = document.createElement("div");
      layer.className = "sparkle-layer" + (darkSections.includes(section.id) ? "" : " on-light");
      layer.setAttribute("aria-hidden", "true");
      const height = section.offsetHeight || 700;
      const count = Math.max(8, Math.min(lowEnd ? 14 : 20, Math.round(height / 85)));
      for (let i = 0; i < count; i++) {
        const sparkle = document.createElement("span");
        sparkle.className = "sparkle";
        sparkle.textContent = glyphs[i % glyphs.length];
        sparkle.style.left = `${Math.random() * 94 + 3}%`;
        sparkle.style.fontSize = `${12 + Math.random() * 13}px`;
        sparkle.style.animationDuration = `${10 + Math.random() * 10}s`;
        sparkle.style.animationDelay = `${-Math.random() * 18}s`;
        sparkle.style.setProperty("--sx", `${Math.round(Math.random() * 70 - 35)}px`);
        layer.appendChild(sparkle);
      }
      section.insertBefore(layer, section.firstChild);
      sparkleLayers.push({ section, layer });
    };
    document.querySelectorAll("main > section").forEach(buildSparkles);
    const setRise = () => sparkleLayers.forEach(({ section, layer }) =>
      layer.style.setProperty("--rise", `${section.offsetHeight + 50}px`));
    setRise();
    window.addEventListener("resize", setRise);
    window.addEventListener("load", setRise);
    // Hemat baterai: animasi hanya berjalan pada section yang sedang terlihat.
    if ("IntersectionObserver" in window) {
      const sparkleObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        const found = sparkleLayers.find((item) => item.section === entry.target);
        if (found) found.layer.classList.toggle("paused", !entry.isIntersecting);
      }), { rootMargin: "80px 0px" });
      sparkleLayers.forEach(({ section, layer }) => { layer.classList.add("paused"); sparkleObserver.observe(section); });
    }
  }

  // Ketuk nama / monogram untuk menebar hati.
  function burstHearts(x, y) {
    if (reduceMotion) return;
    for (let i = 0; i < 12; i++) {
      const heart = document.createElement("span");
      heart.className = `heart-pop${i % 3 === 0 ? " rose" : ""}`;
      heart.setAttribute("aria-hidden", "true");
      heart.textContent = i % 4 === 0 ? "✦" : "♥";
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.fontSize = `${12 + Math.random() * 18}px`;
      heart.style.setProperty("--hx", `${Math.round(Math.random() * 180 - 90)}px`);
      heart.style.setProperty("--hy", `${-Math.round(70 + Math.random() * 130)}px`);
      heart.style.setProperty("--hr", `${Math.round(Math.random() * 80 - 40)}deg`);
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 1400);
    }
  }
  document.querySelectorAll(".cover-names, .closing-monogram, .closing-names, .couple-divider").forEach((element) => {
    element.addEventListener("click", (event) => {
      const rect = element.getBoundingClientRect();
      burstHearts(event.clientX || rect.left + rect.width / 2, event.clientY || rect.top + rect.height / 2);
    });
  });

  // Angka tanggal menghitung naik setiap kali halaman "Save the Date" terlihat.
  const bigDay = document.querySelector(".date-display strong");
  if (bigDay && "IntersectionObserver" in window && !reduceMotion) {
    const finalDay = parseInt(bigDay.textContent, 10);
    if (Number.isFinite(finalDay)) {
      bigDay.textContent = "00";
      let runId = 0;
      const dayObserver = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        const id = ++runId;
        if (!entry.isIntersecting) { bigDay.textContent = "00"; return; }
        const start = performance.now();
        const step = (now) => {
          if (id !== runId) return;
          const t = Math.min((now - start) / 1500, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          bigDay.textContent = String(Math.round(finalDay * eased)).padStart(2, "0");
          if (t < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      }, { threshold: 0.5 });
      dayObserver.observe(bigDay);
    }
  }

  // Open invitation and in-page navigation.
  const openButton = $("openInvitation");
  if (openButton) openButton.addEventListener("click", () => {
    goToEl($("opening"));
  });

  // Musik latar: Ari Lasso — Cinta Terakhir. Browser Android hanya mengizinkan suara
  // setelah ada sentuhan, jadi musik dimulai otomatis pada ketukan pertama pengunjung.
  const music = $("bgMusic");
  const musicButton = $("musicToggle");
  if (music && musicButton) {
    let userPaused = false;
    let resumeAfterHidden = false;
    let fadeTimer = 0;
    if (config.audio) {
      const source = document.createElement("source");
      source.src = config.audio;
      source.type = "audio/mpeg";
      music.appendChild(source);
      music.preload = "metadata";
      music.load();
    }
    const setPlayingUI = (playing) => {
      musicButton.classList.toggle("playing", playing);
      musicButton.classList.remove("hint");
      musicButton.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
      musicButton.title = playing ? "Jeda musik" : "Putar musik";
    };
    const fadeIn = () => {
      window.clearInterval(fadeTimer);
      music.volume = 0;
      fadeTimer = window.setInterval(() => {
        music.volume = Math.min(0.85, music.volume + 0.05);
        if (music.volume >= 0.85) window.clearInterval(fadeTimer);
      }, 140);
    };
    const startMusic = async () => {
      if (!config.audio) return false;
      try {
        fadeIn();
        await music.play();
        setPlayingUI(true);
        return true;
      } catch (error) {
        window.clearInterval(fadeTimer);
        return false;
      }
    };
    musicButton.classList.add("hint");
    let autoStarted = false;
    const gestureEvents = ["pointerdown", "pointerup", "touchstart", "touchend", "click", "keydown", "wheel", "scroll"];
    const removeGestureListeners = () =>
      gestureEvents.forEach((name) => document.removeEventListener(name, firstTouch, true));
    async function firstTouch(event) {
      if (autoStarted || userPaused) return;
      if (event && event.target && musicButton.contains(event.target)) return;
      if (await startMusic()) {
        autoStarted = true;
        showToast("♫ Ari Lasso — Cinta Terakhir");
        removeGestureListeners();
      }
    }
    // Coba langsung putar saat halaman dibuka (berhasil di sebagian browser/desktop).
    // Jika diblokir, musik otomatis mulai pada sentuhan/ketukan/tombol pertama pengunjung.
    gestureEvents.forEach((name) => document.addEventListener(name, firstTouch, { passive: true, capture: true }));
    const tryAutoplay = () => firstTouch();
    if (document.readyState === "complete") tryAutoplay();
    else window.addEventListener("load", tryAutoplay, { once: true });

    musicButton.addEventListener("click", async () => {
      autoStarted = true;
      if (!config.audio) { showToast("Musik belum tersedia."); return; }
      if (music.paused) {
        userPaused = false;
        if (!(await startMusic())) showToast("Musik belum dapat diputar. Coba ketuk sekali lagi.");
      } else {
        userPaused = true;
        music.pause();
        setPlayingUI(false);
      }
    });
    music.addEventListener("error", () => setPlayingUI(false));
    music.addEventListener("ended", () => setPlayingUI(false));
    // Jeda saat tab/aplikasi disembunyikan, lanjutkan saat kembali.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        resumeAfterHidden = !music.paused;
        if (resumeAfterHidden) music.pause();
      } else if (resumeAfterHidden && !userPaused) {
        resumeAfterHidden = false;
        music.play().catch(() => setPlayingUI(false));
      }
    });
  }

  // Scroll progress, quick navigation, and back-to-top.
  const progress = $("scrollProgress");
  const quickNav = $("quickNav");
  const topButton = $("backToTop");
  const navLinks = [...document.querySelectorAll(".quick-nav a[href]")];
  let ticking = false;
  let idleTimer = 0;

  // Efek terhubung scroll: parallax cover, foto yang "bergeser" di dalam bingkainya, angka 22 raksasa.
  const coverImage = document.querySelector(".cover-image");
  const coverContent = document.querySelector(".cover-content");
  const bigMark = document.querySelector(".date-background-mark");
  const shifters = [];
  const addShifters = (selector, base, amp, isBackground) => document.querySelectorAll(selector)
    .forEach((el) => shifters.push({ el, base, amp, isBackground }));
  addShifters(".person-photo img", 34, 10, false);
  addShifters(".closing-image", 37, 10, false);
  addShifters(".location-photo", 36, 14, true);

  function applyScrollFx() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    const y = window.scrollY;
    if (y < vh * 1.3) {
      if (coverImage) {
        coverImage.style.setProperty("--cy", `${(y * 0.28).toFixed(1)}px`);
        coverImage.style.setProperty("--cs", (1.06 + Math.min(y / vh, 1) * 0.1).toFixed(3));
      }
      if (coverContent) {
        const t = Math.min(y / (vh * 0.75), 1);
        coverContent.style.opacity = String((1 - t).toFixed(3));
        coverContent.style.transform = `translate3d(0,${(-y * 0.12).toFixed(1)}px,0)`;
      }
    }
    const progressOf = (rect) => {
      const p = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      return Math.max(-1, Math.min(1, p));
    };
    shifters.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > vh + 120) return;
      const value = (item.base + progressOf(rect) * item.amp).toFixed(1);
      if (item.isBackground) item.el.style.backgroundPosition = `center ${value}%`;
      else item.el.style.objectPosition = `50% ${value}%`;
    });
    if (bigMark) {
      const rect = bigMark.getBoundingClientRect();
      if (rect.bottom > -200 && rect.top < vh + 200) {
        bigMark.style.transform = `translate(-50%, calc(-53% + ${(progressOf(rect) * 90).toFixed(1)}px))`;
      }
    }
  }

  function updateScrollUI() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0;
    if (progress) progress.style.width = `${percent}%`;
    if (quickNav) quickNav.classList.toggle("visible", window.scrollY > window.innerHeight * 0.45);
    if (topButton) topButton.classList.toggle("show", window.scrollY > 500);
    applyScrollFx();
    if (quickNav) {
      quickNav.classList.remove("idle");
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => quickNav.classList.add("idle"), 2200);
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("resize", updateScrollUI);
  updateScrollUI();
  topButton?.addEventListener("click", () => goToY(0));

  if ("IntersectionObserver" in window) {
    const sections = ["home", "couple", "gallery", "event", "location"]
      .map((id) => $(id)).filter(Boolean);
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-38% 0px -48% 0px", threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Share via Web Share API, clipboard, or a manual-copy fallback.
  $("shareInvitation")?.addEventListener("click", async () => {
    const shareData = {
      title: "Yunus & Suci — The Beginning of Forever",
      text: "Dengan penuh rasa syukur, kami mengundang Anda untuk hadir pada hari pernikahan kami, Minggu 22 November 2026.",
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link undangan berhasil disalin.");
      } else {
        window.prompt("Salin link undangan berikut:", window.location.href);
      }
    } catch (error) {
      if (error.name !== "AbortError") showToast("Link belum dapat dibagikan. Silakan salin alamat website.");
    }
  });

  // Accessible gallery lightbox with previous/next and keyboard support.
  const lightbox = $("lightbox");
  const lightboxImage = $("lightboxImage");
  const lightboxCaption = $("lightboxCaption");
  const lightboxCount = $("lightboxCount");
  const closeButton = $("closeLightbox");
  let activePhoto = 0;
  let lastFocusedElement = null;

  function showPhoto(index) {
    if (!galleryItems.length || !lightbox) return;
    activePhoto = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activePhoto];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt || `Foto Yunus dan Suci ${activePhoto + 1}`;
    lightboxCaption.textContent = item.caption || "";
    lightboxCount.textContent = `${String(activePhoto + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
  }
  function openLightbox(index, trigger) {
    lastFocusedElement = trigger || document.activeElement;
    showPhoto(index);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeButton?.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lightboxImage.src = "";
    lastFocusedElement?.focus?.();
  }
  gallery?.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-photo");
    if (!button) return;
    openLightbox(Number(button.dataset.galleryIndex), button);
  });
  closeButton?.addEventListener("click", closeLightbox);
  $("previousPhoto")?.addEventListener("click", () => showPhoto(activePhoto - 1));
  $("nextPhoto")?.addEventListener("click", () => showPhoto(activePhoto + 1));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  // Touch swipe: horizontal movement changes the photo; vertical movement is ignored.
  let touchStartX = 0;
  let touchStartY = 0;
  lightbox?.addEventListener("touchstart", (event) => {
    if (!lightbox.classList.contains("open") || !event.touches.length) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  lightbox?.addEventListener("touchend", (event) => {
    if (!lightbox.classList.contains("open") || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      showPhoto(activePhoto + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
    if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
    if (event.key === "Tab") {
      const controls = [...lightbox.querySelectorAll("button:not([disabled])")];
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });

  // Perpindahan halaman lewat tombol (Buka Undangan, navigator, ke atas): meluncur LAMBAT dan halus.
  // Scroll manual sepenuhnya bebas, tidak ada tarikan otomatis.
  if (!reduceMotion) {
    const root = document.documentElement;
    let animId = 0, animating = false;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
    const snapPoints = () => [...document.querySelectorAll("main > section[id], .couple-divider")]
      .map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY - (el.classList.contains("couple-divider") ? 12 : 0)))
      .map((y) => Math.max(0, Math.min(y, maxY())));
    const stopAnim = () => {
      if (!animating) return;
      animId++; animating = false; root.style.scrollBehavior = "";
    };
    const animateTo = (target) => {
      const from = window.scrollY;
      const dist = target - from;
      if (Math.abs(dist) < 2) return;
      const id = ++animId;
      animating = true;
      root.style.scrollBehavior = "auto";
      const duration = Math.max(1100, Math.min(2200, 700 + Math.abs(dist) * 0.6));
      const start = performance.now();
      const step = (now) => {
        if (id !== animId) return;
        const t = Math.min((now - start) / duration, 1);
        window.scrollTo(0, from + dist * ease(t));
        if (t < 1) window.requestAnimationFrame(step);
        else { animating = false; root.style.scrollBehavior = ""; }
      };
      window.requestAnimationFrame(step);
    };
    // Pengguna menyentuh / memutar roda saat meluncur: hentikan animasi, kendali kembali ke pengguna.
    window.addEventListener("wheel", stopAnim, { passive: true });
    window.addEventListener("touchstart", stopAnim, { passive: true });
    window.addEventListener("keydown", stopAnim);

    const toElement = (el) => el && animateTo(Math.max(0, Math.min(Math.round(el.getBoundingClientRect().top + window.scrollY), maxY())));
    goToEl = toElement;
    goToY = (y) => animateTo(y);
    document.querySelectorAll('.quick-nav a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.getElementById(link.getAttribute("href").slice(1));
        if (!target) return;
        event.preventDefault();
        toElement(target);
      });
    });
  }
})();
