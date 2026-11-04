/*
 * KONFIGURASI UNDANGAN SUCI & YUNUS
 * Ubah data acara di file ini agar pembaruan otomatis di seluruh website.
 */
window.WEDDING_CONFIG = {
  couple: "Suci & Yunus",
  monogram: "S & Y",
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
    { src: "assets/images/gallery/g1.webp", focus: "50% 38%", alt: "Suci dan Yunus berpose bersama dalam busana serasi", caption: "A moment to remember." },
    { src: "assets/images/gallery/g2.webp", focus: "50% 45%", alt: "Suci dan Yunus duduk berdampingan", caption: "Little moments, endless memories." },
    { src: "assets/images/gallery/g3.webp", focus: "50% 55%", alt: "Suci dan Yunus berdiri bersama", caption: "Every picture holds a story." },
    { src: "assets/images/gallery/g6.webp", focus: "50% 18%", alt: "Suci dan Yunus dalam potret bersama", caption: "Together in this journey." },
    { src: "assets/images/gallery/g7.webp", focus: "50% 25%", alt: "Suci dan Yunus saling menatap", caption: "The beginning of forever." }
  ],
  // Rekening untuk tanda kasih. Tambah rekening lain dengan menyalin satu baris { ... }.
  gift: {
    accounts: [
      { bank: "BCA", number: "3460722241", holder: "Muhamad Yunus Ramadhan" }
    ]
  },
  audio: "assets/audio/wedding-song.mp3", // Ari Lasso — Cinta Terakhir
  developer: {
    name: "Ilmi Restu Firdaus",
    instagram: "https://www.instagram.com/ilmi_rf/",
    whatsapp: "https://wa.me/6285721933469"
  }
};
