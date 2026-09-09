# SoraPay - Anonymous Sender

Halaman web statis (HTML/CSS/Vanilla JS, tanpa backend) untuk mengirim **satu pesan anonim**
ke sebuah link NGL, dengan UI glassmorphism, dark/light mode, dan kustomisasi background.

## Cara Pakai

1. Buka `index.html` di browser (bisa langsung dobel klik, atau host lewat static server /
   GitHub Pages / Netlify agar fetch berjalan lebih stabil).
2. Isi kolom **Target NGL Link** dengan format persis:
   ```
   Target: https://ngl.link/username
   ```
   Jika format salah, akan muncul pesan error merah.
3. Tulis pesan di kolom **Pesan**.
4. Klik **Kirim Pesan**. Satu klik = satu pesan terkirim. Tidak ada pengiriman otomatis
   berulang — kamu yang mengontrol setiap pengiriman secara manual.
5. Ganti tampilan lewat toggle 🌙/☀️ di pojok kanan atas, dan atur warna background lewat
   preset warna atau color picker (tersimpan otomatis di `localStorage`).
6. Klik logo **SoraPay** di kiri atas untuk scroll kembali ke atas halaman.

## Catatan Teknis Penting

- **CORS**: NGL tidak menyediakan API publik resmi untuk website pihak ketiga. Permintaan
  `fetch()` dari domain lain ke `ngl.link` bisa saja diblokir oleh browser (CORS) tergantung
  kebijakan server NGL saat itu. Aplikasi ini sudah menangani kondisi tersebut dengan pesan
  error yang jelas, tapi keberhasilan pengiriman **tidak bisa 100% dijamin** karena bergantung
  pada kebijakan pihak NGL, bukan pada kode di sini.
- Tidak ada sistem "jatah kirim otomatis", cooldown timer, atau delay acak untuk menghindari
  deteksi — fitur semacam itu sengaja **tidak** dibuat karena berpotensi disalahgunakan untuk
  spam/harassment massal ke satu target.
- Semua data (tema, warna background) hanya disimpan lokal di browser kamu (`localStorage`),
  tidak dikirim ke server manapun.

## Struktur Folder

```
SoraPay - Bot NGL/
├── index.html
├── README.md
└── assets/
    ├── css/style.css
    ├── js/app.js
    └── logo.svg
```

## Disclaimer

Aplikasi ini dibuat untuk tujuan edukasi (belajar fetch API, DOM, localStorage, dan UI
glassmorphism). Patuhi Terms of Service NGL. **Jangan** gunakan untuk mengirim pesan secara
massal, spam, harassment, atau mengganggu orang lain. Gunakan secara bertanggung jawab dan
wajar.

## Kredit

- Instagram: https://instagram.com/digital_topap_sorapay
- ID: lang.87788
- TikTok: ryuuuuuuuu82
