# Undangan Pernikahan Yunus & Suci

Website undangan digital statis bertema **Modern Romantic Editorial — Elegant Wedding**. Proyek ini merupakan penyempurnaan dari source code asli, bukan proyek baru.

## Data undangan

- **Mempelai pria:** Muhamad Yunus Ramadhan — Putra Kelima dari Bapak Hana Sudrajat dan Ibu Dedeh Jubaedah.
- **Mempelai wanita:** Suci Novi Rahmawati — Putri Ketiga dari Bapak Asep Koswara dan Ibu Elah Nurlaela.
- **Hari/tanggal:** Minggu, 22 November 2026.
- **Lokasi:** Jl. Manglid RT 06 RW 11 (Belakang Rumah No. 22A), Desa Margahayu Selatan, Kecamatan Margahayu, Kabupaten Bandung.
- **Google Maps:** https://maps.app.goo.gl/Swv4zaF4Gb1mTFQDA

## Menjalankan website

1. Ekstrak ZIP.
2. Buka `wedding-yunus-suci/index.html` di browser, atau jalankan folder proyek menggunakan VS Code + Live Server.
3. Tidak memerlukan Node.js, npm, proses build, framework, atau backend.
4. Untuk hosting GitHub Pages, unggah isi folder `wedding-yunus-suci` ke repository (atau jadikan folder tersebut sebagai root publikasi), lalu aktifkan **Settings → Pages**.

## Struktur proyek

```text
wedding-yunus-suci/
├── index.html
├── README.md
├── .nojekyll
├── assets/
│   ├── icons/favicon.svg
│   └── images/
│       ├── cover.webp
│       ├── groom.webp
│       ├── bride.webp
│       ├── closing.webp
│       ├── moment-1.webp ... moment-7.webp
│       └── gallery/
│           ├── 1.jpeg ... 7.jpeg  (foto asli dari yunus.zip)
├── css/style.css
└── js/
    ├── config.js
    └── main.js
```

## Foto dan album

Semua tujuh JPEG asli dari `yunus.zip` disertakan utuh di `assets/images/gallery/`.

Album website menampilkan **lima foto pasangan** yang terverifikasi dari arsip asli: `1.jpeg`, `2.jpeg`, `3.jpeg`, `6.jpeg`, dan `7.jpeg`. Foto individual `4.jpeg` (Suci) dan `5.jpeg` (Yunus) tidak dimasukkan ke album. Foto individual pada profil menggunakan `bride.webp` dan `groom.webp` yang sudah ada di source project. Tidak ada foto stok yang ditambahkan.

Untuk mengubah urutan foto/caption, edit array `gallery` pada `js/config.js`. Pertahankan hanya foto pasangan jika mengubah album.

## Konfigurasi

Edit `js/config.js` untuk memperbarui:
- Nama dan data keluarga mempelai.
- Tanggal pernikahan, zona waktu, dan teks tanggal.
- Jam akad dan resepsi.
- Alamat dan tautan Google Maps.
- Daftar album/caption.
- File musik.

Countdown disetel ke **22 November 2026 pukul 09.00 WIB** (awal akad, `+07:00`). Jam acara: **Akad 09.00 WIB — selesai**, **Resepsi 11.00 WIB — selesai** (diatur di `akadTime` dan `receptionTime`).

## Musik latar

Lagu: Ari Lasso — Cinta Terakhir (`assets/audio/wedding-song.mp3`, diatur di `audio` pada `js/config.js`). Karena aturan browser Android, musik mulai otomatis pada ketukan pertama pengunjung (atau lewat tombol musik di kanan atas), dengan fade-in. Musik berhenti saat aplikasi disembunyikan dan lanjut saat kembali.

## Fitur yang dipertahankan

- Sampul dan tombol buka undangan.
- Ayat QS. Ar-Rum: 21, transliterasi, dan terjemahan.
- Profil THE GROOM dan THE BRIDE terpisah dengan foto portrait dalam bingkai arch.
- Album lima foto pasangan dari arsip asli.
- Lightbox: tutup, foto berikut/sebelumnya, klik area luar, swipe horizontal, tombol Escape dan panah keyboard.
- Countdown real-time pada cover dan section tanggal.
- Musik play/pause (membutuhkan MP3).
- Scroll progress, quick navigation, dan back-to-top.
- Share invitation melalui Web Share API, clipboard, atau fallback salin manual.
- Scroll reveal berbasis `IntersectionObserver` dengan fallback agar konten tetap terlihat.
- Google Maps, tautan Instagram, dan WhatsApp.
- `prefers-reduced-motion`, fokus keyboard, dan layout responsif.

## Responsive design

Layout disusun mobile-first dan breakpoint disiapkan untuk lebar 360, 375, 390, 412, dan 430 piksel, kemudian ditingkatkan untuk tablet/desktop. Galeri, profil, navigasi bawah, lightbox, dan jarak antarbagian menyesuaikan ukuran layar.

## Catatan pengujian

Pemeriksaan source, struktur aset, referensi gambar, sintaks JavaScript, dan pemeriksaan overflow berbasis CSS dilakukan pada hasil revisi. Pengujian interaksi visual lintas browser/perangkat nyata perlu dilakukan di browser; jangan menganggap pemeriksaan statis sebagai pengujian browser. Musik tidak dapat diuji karena file MP3 tidak tersedia di arsip sumber.

## Pembaruan: pengalaman scroll interaktif

- Latar halaman 1 (cover) memakai foto nomor 3 (`assets/images/cover-3.webp`, versi ringan dari `gallery/3.jpeg`). Foto cover lama (`cover.webp`) dipakai di section lokasi.
- Teks dan foto muncul bergantian dari kiri, kanan, bawah, atau zoom saat di-scroll (`data-fx` diatur otomatis di `js/main.js`, gaya di akhir `css/style.css`).
- Parallax cover, foto yang bergeser di dalam bingkainya, angka "22" raksasa yang bergerak, dan tanggal yang menghitung naik.
- Kilauan melayang di cover, hati/kilau saat nama atau monogram diketuk, dan angka countdown yang berdenyut saat berganti.
- Semua efek mati otomatis jika perangkat memakai `prefers-reduced-motion`.

## Pembaruan v3 (fokus Android)

- Galeri disusun simetris: 1 foto utama + 2 x 2, bingkai seragam, tanpa kemiringan; memakai WebP ringan (`gallery/g*.webp`).
- Sprinkle/kilauan kini ada di semua section (hemat baterai: hanya berjalan pada section yang terlihat).
- Navigator pindah ke sisi kanan (vertikal, transparan, memudar saat tidak digunakan).
- Teks kecil dinaikkan, target sentuh minimal 44px, foto lokasi tidak lagi memotong pasangan.

## Pembaruan v4 (mode per-halaman)

- Setiap section kini menjadi satu halaman penuh (`100svh`) dengan efek snap (`scroll-snap-type: y mandatory`). Section yang lebih tinggi dari layar (mis. galeri) tetap bisa di-scroll bebas, lalu snap ke halaman berikutnya. Halaman mempelai wanita punya titik snap sendiri.
- Animasi teks dan foto kini dua arah: muncul saat halaman masuk, hilang ke atas saat ditinggalkan, dan muncul lagi saat di-scroll naik (`js/main.js` → `revealObserver`, gaya di akhir `css/style.css`).
- Angka tanggal "22" menghitung naik setiap kali halaman Save the Date terlihat.
- Untuk mematikan snap: hapus baris `html{scroll-snap-type:y mandatory...}` di blok "MODE PER-HALAMAN"; ganti `mandatory` menjadi `proximity` jika ingin snap yang lebih longgar.

## Pembaruan v4.2

- Scroll manual bebas, tanpa snap/tarikan otomatis. Animasi meluncur lambat (1,1–2,2 detik, easing halus) hanya dipakai saat menekan tombol di `js/main.js` bagian "Perpindahan halaman". Ubah kecepatan pada baris `const duration = Math.max(1100, Math.min(2200, ...))`. Tombol Buka Undangan, navigator, dan tombol ke atas memakai animasi yang sama.
- Musik dicoba diputar sejak halaman dibuka; jika diblokir browser, mulai pada interaksi pertama (sentuhan, ketukan, atau tombol Buka Undangan).

## Pembaruan: nama tamu otomatis

- Buka `generator.html`, isi alamat website undangan, tempel daftar tamu (satu per baris, nomor WhatsApp opsional setelah `|` atau koma), lalu klik **Buat Link**.
- Tiap tamu mendapat link personal, contoh `.../index.html?to=Bapak+Ahmad`. Sampul undangan otomatis menampilkan "Kepada Yth. Bapak Ahmad — di Tempat".
- Tombol **Kirim WA** membuka WhatsApp dengan pesan siap kirim (teks pesan bisa diubah). Tersedia juga **Salin Semua** dan **Unduh CSV**.
- Link tanpa `?to=` tetap normal (tanpa blok nama tamu). Tombol Share tidak membawa nama tamu.
- `generator.html` tidak ditautkan dari undangan dan berisi `noindex`; daftar tamu diproses di browser dan tidak dikirim ke server.
