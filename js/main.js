(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Safety net: if any script error occurs, CSS forces all content to stay visible.
  window.addEventListener("error", () => document.documentElement.classList.add("fx-failed"));

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
    element.dataset.fx = index % 2 ? "right" : "left";
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

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      let n = 0;
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        const element = entry.target;
        element.style.transitionDelay = `${Math.min(n++, 4) * 120}ms`;
        element.classList.add("visible");
        observer.unobserve(element);
        window.setTimeout(() => { element.style.transitionDelay = ""; }, 2000);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  // Kilauan melayang di cover.
  const cover = document.querySelector(".cover-section");
  if (cover && !reduceMotion) {
    const glyphs = ["✦", "✧", "♡", "✦", "·"];
    for (let i = 0; i < 18; i++) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.setAttribute("aria-hidden", "true");
      sparkle.textContent = glyphs[i % glyphs.length];
      sparkle.style.left = `${Math.random() * 96 + 2}%`;
      sparkle.style.fontSize = `${9 + Math.random() * 13}px`;
      sparkle.style.animationDuration = `${9 + Math.random() * 9}s`;
      sparkle.style.animationDelay = `${-Math.random() * 14}s`;
      sparkle.style.setProperty("--sx", `${Math.round(Math.random() * 90 - 45)}px`);
      cover.appendChild(sparkle);
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

  // Angka tanggal menghitung naik saat terlihat.
  const bigDay = document.querySelector(".date-display strong");
  if (bigDay && "IntersectionObserver" in window && !reduceMotion) {
    const finalDay = parseInt(bigDay.textContent, 10);
    if (Number.isFinite(finalDay)) {
      bigDay.textContent = "00";
      const dayObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        dayObserver.disconnect();
        const start = performance.now();
        const step = (now) => {
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
    $("opening")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Music is never played before the visitor presses the control.
  const music = $("bgMusic");
  const musicButton = $("musicToggle");
  if (music && musicButton) {
    if (config.audio) {
      const source = document.createElement("source");
      source.src = config.audio;
      source.type = "audio/mpeg";
      music.appendChild(source);
    }
    musicButton.addEventListener("click", async () => {
      if (!config.audio) {
        showToast("Musik belum ditambahkan. Simpan MP3 di assets/audio/ lalu atur js/config.js.");
        return;
      }
      if (music.paused) {
        try {
          await music.play();
          musicButton.classList.add("playing");
          musicButton.setAttribute("aria-label", "Jeda musik");
          musicButton.title = "Jeda musik";
        } catch (error) {
          showToast("Musik belum tersedia. Tambahkan wedding-song.mp3 ke assets/audio/.");
        }
      } else {
        music.pause();
        musicButton.classList.remove("playing");
        musicButton.setAttribute("aria-label", "Putar musik");
        musicButton.title = "Putar musik";
      }
    });
    music.addEventListener("error", () => musicButton.classList.remove("playing"));
    music.addEventListener("ended", () => musicButton.classList.remove("playing"));
  }

  // Scroll progress, quick navigation, and back-to-top.
  const progress = $("scrollProgress");
  const quickNav = $("quickNav");
  const topButton = $("backToTop");
  const navLinks = [...document.querySelectorAll(".quick-nav a[href]")];
  let ticking = false;

  // Efek terhubung scroll: parallax cover, foto yang "bergeser" di dalam bingkainya, angka 22 raksasa.
  const coverImage = document.querySelector(".cover-image");
  const coverContent = document.querySelector(".cover-content");
  const bigMark = document.querySelector(".date-background-mark");
  const shifters = [];
  const addShifters = (selector, base, amp, isBackground) => document.querySelectorAll(selector)
    .forEach((el) => shifters.push({ el, base, amp, isBackground }));
  addShifters(".person-photo img", 34, 10, false);
  addShifters(".gallery-photo img", 50, 18, false);
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
  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

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
})();
