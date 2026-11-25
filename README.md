# Kasir Apotek

Aplikasi kasir apotek berbasis React dan Vite dengan Google Sheets sebagai penyimpanan data melalui Google Apps Script.

## Fitur

- Transaksi penjualan dengan keranjang, jumlah bayar, dan kembalian.
- Pencarian serta filter obat berdasarkan kategori.
- Pengelolaan stok obat dan peringatan stok menipis atau kedaluwarsa.
- Riwayat transaksi, ringkasan penjualan, dan grafik.
- Sinkronisasi data berkala tanpa menutupi halaman dengan spinner.
- Tampilan responsif untuk desktop, tablet, dan ponsel.

## Menjalankan aplikasi

1. Instal dependensi: `npm install`
2. Salin `.env.example` menjadi `.env`.
3. Isi `VITE_SCRIPT_URL` di `.env` dengan URL Web App Apps Script.
4. Jalankan `npm run dev`.

Panduan setup lengkap ada di [docs/setup.md](./docs/setup.md).

## Backend dan data demo

- Backend utama untuk deployment Apps Script: [apps-script/Code.gs](./apps-script/Code.gs).
- Import data demo: [apps-script/ImportData.gs](./apps-script/ImportData.gs).
- Migrasi sheet Penjualan lama: [apps-script/UpdateSheetPenjualan.gs](./apps-script/UpdateSheetPenjualan.gs).
- Contoh data obat: [data/obat-demo.csv](./data/obat-demo.csv).

Lihat [panduan import data](./docs/import-data.md) sebelum memasukkan data demo. Panduan migrasi lama tersedia di [docs/migrasi-sheet-penjualan.md](./docs/migrasi-sheet-penjualan.md).

## Struktur proyek

```text
.
├── apps-script/          # Backend dan utilitas Google Apps Script
├── data/                 # Data contoh
├── docs/                 # Panduan penggunaan dan migrasi
├── src/
│   ├── pages/            # Layar Kasir, Stok, dan Riwayat
│   ├── App.jsx           # Login, navigasi, dan pemuatan data
│   ├── api.js            # Komunikasi dengan Apps Script
│   ├── lib.js            # Utilitas bersama
│   ├── motion.js         # Pengaturan animasi kartu
│   └── styles.css        # Gaya dan layout responsif
├── .env.example          # Template konfigurasi lokal
├── index.html
├── package.json
└── vite.config.js
```

## Build

```bash
npm run build
```

Hasil build dibuat di `dist/`. Folder tersebut merupakan output yang dapat dibuat ulang dan tidak perlu diedit manual.
