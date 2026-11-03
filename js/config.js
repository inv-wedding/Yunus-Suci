/*
 * KONFIGURASI UNDANGAN YUNUS & SUCI
 * Ubah data acara di file ini agar pembaruan otomatis di seluruh website.
 */
window.WEDDING_CONFIG = {
  couple: "Yunus & Suci",
  monogram: "Y & S",
  groom: {
    name: "Muhamad Yunus Ramadhan",
    nickname: "Yunus",
    birthOrder: "Putra Kelima",
    father: "Hana Sudrajat",
    mother: "Dedeh Jubaedah",
    portrait: "assets/images/groom.webp"
  },
  bride: {
    name: "Suci Novi Rahmawati",
    nickname: "Suci",
    birthOrder: "Putri Ketiga",
    father: "Asep Koswara",
    mother: "Elah Nurlaela",
    portrait: "assets/images/bride.webp"
  },
  wedding: {
    // Hitung mundur menuju akad: 22 November 2026 pukul 09.00 WIB (UTC+7).
    date: "2026-11-22T09:00:00+07:00",
    displayDate: "Minggu, 22 November 2026",
    timezone: "Asia/Jakarta",
    akadTime: "09.00 WIB — Selesai",
    receptionTime: "11.00 WIB — Selesai"
  },
  venue: {
    address: "Jl. Manglid RT 06 RW 11 (Belakang Rumah No. 22A), Desa Margahayu Selatan, Kecamatan Margahayu, Kabupaten Bandung",
    mapsUrl: "https://maps.app.goo.gl/Swv4zaF4Gb1mTFQDA"
  },
  // focus = titik fokus foto (x y) agar wajah tidak terpotong di tampilan HP.
  gallery: [
    { src: "assets/images/gallery/g1.webp", focus: "50% 38%", alt: "Yunus dan Suci berpose bersama dalam busana serasi", caption: "A moment to remember." },
    { src: "assets/images/gallery/g2.webp", focus: "50% 45%", alt: "Yunus dan Suci duduk berdampingan", caption: "Little moments, endless memories." },
    { src: "assets/images/gallery/g3.webp", focus: "50% 55%", alt: "Yunus dan Suci berdiri bersama", caption: "Every picture holds a story." },
    { src: "assets/images/gallery/g6.webp", focus: "50% 18%", alt: "Yunus dan Suci dalam potret bersama", caption: "Together in this journey." },
    { src: "assets/images/gallery/g7.webp", focus: "50% 25%", alt: "Yunus dan Suci saling menatap", caption: "The beginning of forever." }
  ],
  audio: "assets/audio/wedding-song.mp3", // Ari Lasso — Cinta Terakhir
  developer: {
    name: "Ilmi Restu Firdaus",
    instagram: "https://www.instagram.com/ilmi_rf/",
    whatsapp: "https://wa.me/6285721933469"
  }
};
