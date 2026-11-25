# Panduan Setup

## Prasyarat

- Node.js 18 atau lebih baru.
- Spreadsheet Google dan URL Web App Google Apps Script.

## Menyiapkan backend

1. Buat atau buka Google Sheets untuk aplikasi.
2. Buka **Extensions > Apps Script**.
3. Salin isi [`../apps-script/Code.gs`](../apps-script/Code.gs) ke Apps Script.
4. Di **Project Settings > Script Properties**, tambahkan `PASSWORD` dengan kata sandi kasir.
5. Deploy sebagai **Web App**, jalankan sebagai pemilik spreadsheet, lalu salin URL deployment.

Backend menambahkan kolom `hargaModal` di sheet **Obat** bila sheet masih memakai struktur lama. Isi harga modal obat di menu **Stok Obat** sebelum checkout; transaksi tanpa harga modal tidak dapat diselesaikan. Total keuntungan di Riwayat mencakup transaksi yang menyimpan snapshot harga modal, sehingga perhitungan dimulai setelah harga modal diisi.

Transaksi tetap dapat disimpan meskipun harga jual lebih rendah daripada harga modal. Kartu total keuntungan menampilkan minimal **Rp0** jika hasil perhitungan belum menghasilkan keuntungan. Untuk mendapatkan profit, pastikan harga jual per strip/tablet lebih tinggi daripada harga modal per strip/tablet.

Untuk merapikan sheet transaksi yang sudah ada, salin versi terbaru `Code.gs`, lalu deploy versi baru terlebih dahulu. Setelah deployment aktif, pilih fungsi `formatTransactionSheets` di Apps Script dan klik **Run** satu kali. Fungsi ini mengubah waktu ISO menjadi format tanggal lokal, menampilkan `items` sebagai ringkasan yang mudah dibaca, dan mengatur lebar kolom. Data rinci transaksi tetap disimpan di kolom `itemsData` yang disembunyikan agar aplikasi tetap dapat membacanya.

Menu **Belanja Obat** mencatat pembelian, menambah stok, dan memperbarui harga modal dengan rata-rata tertimbang. Nama obat boleh baru; untuk obat baru, pilih jenis obat yang sama dengan kategori di menu **Kasir** dan isi harga jual per strip. Stok awal dan harga modal dihitung dari pembelian, stok minimum dimulai dari 0, dan tanggal kedaluwarsa dapat diisi kemudian di menu **Stok Obat**. Satu box dihitung sebagai 10 strip. Riwayat pembelian disimpan di sheet **Pembelian** yang dibuat otomatis; total belanja menjumlahkan pembelian yang dicatat melalui fitur ini.

Untuk menghapus seluruh riwayat belanja tanpa menghapus stok atau penjualan, salin [`../apps-script/UpdateSheetPenjualan.gs`](../apps-script/UpdateSheetPenjualan.gs) ke Apps Script, jalankan `resetSheetPembelian`, lalu konfirmasi dialog. Fungsi ini hanya menghapus baris data di sheet **Pembelian** dan mempertahankan headernya.

## Menjalankan frontend

1. Dari folder proyek, jalankan `npm install`.
2. Salin `.env.example` menjadi `.env`.
3. Isi `VITE_SCRIPT_URL` di `.env` dengan URL Web App.
4. Jalankan `npm run dev`, lalu buka URL yang ditampilkan Vite.

Untuk membuat versi produksi, jalankan `npm run build`. Hasilnya ada di folder `dist/`.

## Troubleshooting

- **URL belum diisi:** pastikan `VITE_SCRIPT_URL` ada di `.env`, lalu mulai ulang Vite.
- **Kata sandi salah:** cocokkan kata sandi dengan Script Property `PASSWORD`.
- **Data gagal dimuat:** periksa status deployment Apps Script, koneksi internet, dan respons API.
- **Perubahan Apps Script belum terlihat:** buat deployment versi baru dan pastikan `VITE_SCRIPT_URL` mengarah ke URL yang benar.
- **URL dibuka langsung di browser:** setelah versi terbaru di-deploy, URL menampilkan status endpoint dalam JSON. Aplikasi tetap memakai POST untuk login dan transaksi; pesan `Script function not found: doGet` berarti versi deployment yang dibuka belum memiliki pemeriksaan GET ini.

Jangan bagikan file `.env`; file tersebut berisi konfigurasi deployment lokal.
