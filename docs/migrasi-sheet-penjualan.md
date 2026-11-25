# Migrasi Sheet Penjualan

## Masalah
Nama pembeli tidak tersimpan/muncul di riwayat transaksi.

## Penyebab
Sheet "Penjualan" yang lama tidak punya kolom "pembeli" (struktur lama hanya 7 kolom, struktur baru butuh 8 kolom).

---

## ✅ Solusi: Update Sheet Penjualan

### Metode 1: Update Otomatis (RECOMMENDED) ⭐

**Langkah:**
1. Buka **Google Sheets** Anda
2. **Extensions** > **Apps Script**
3. **Buat file baru** (klik + di sebelah Files)
4. **Copy-paste** isi dari [`../apps-script/UpdateSheetPenjualan.gs`](../apps-script/UpdateSheetPenjualan.gs)
5. **Save** (Ctrl+S / Cmd+S)
6. Refresh Google Sheets - **Menu baru** akan muncul: **🔧 Update Sheet**
7. Klik menu **🔧 Update Sheet** > **✅ Update Sheet Penjualan**
8. Konfirmasi "Yes"
9. ✅ **Selesai!** Kolom "pembeli" sudah ditambahkan

**Hasil:**
- Kolom "pembeli" ditambahkan setelah kolom "kasir"
- Data lama tetap aman, pembeli = "-"
- Transaksi baru akan menyimpan nama pembeli

---

### Metode 2: Manual (Alternatif)

**Langkah:**
1. Buka sheet **"Penjualan"**
2. **Klik kolom D** (header "items")
3. **Klik kanan** > **Insert 1 column left**
4. Di header baru (kolom D row 1), ketik: **pembeli**
5. Isi kolom pembeli untuk data lama dengan: **-**
6. ✅ **Selesai!**

**Struktur yang benar:**
```
| A (id) | B (waktu) | C (kasir) | D (pembeli) | E (items) | F (total) | G (bayar) | H (kembali) |
```

---

---

## 🔍 Cek Apakah Sudah Benar

Setelah update, cek dengan cara:

### Opsi A: Via Menu (jika sudah install script)
1. Menu **🔧 Update Sheet** > **🔍 Cek Struktur Sheet**
2. Lihat hasilnya

### Opsi B: Manual
1. Buka sheet "Penjualan"
2. Cek header row 1, pastikan urutannya:
   ```
   id | waktu | kasir | pembeli | items | total | bayar | kembali
   ```
3. Harus ada 8 kolom (bukan 7)

---

## ✅ Test Setelah Fix

1. **Refresh** aplikasi web (F5)
2. Buat **transaksi baru**:
   - Input nama pembeli: "Test Pembeli"
   - Tambah obat ke cart
   - Checkout
3. Cek **tab Riwayat**
4. **Nama pembeli** harus muncul di kolom "Pembeli"

---

## 🐛 Troubleshooting

### Masih tidak muncul setelah update?
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5 / Cmd+Shift+R)
3. Tunggu **30 detik** (auto-reload data)
4. Coba **transaksi baru** lagi

### Error saat update sheet?
1. Pastikan sheet bernama "Penjualan" (bukan "Penjualan ")
2. Pastikan ada data minimal 1 baris (header)
3. Coba **Metode 2 (Manual)** sebagai alternatif

### Kolom "pembeli" ada tapi masih kosong di transaksi baru?
1. **Re-deploy** Apps Script:
   - Buka Apps Script
   - Deploy > Manage deployments
   - Edit > New version
   - Deploy
2. **Update URL** di `.env` jika berubah
3. Restart aplikasi web

### Aplikasi memberi pesan versi Apps Script belum diperbarui
1. Pastikan project Apps Script yang dibuka terhubung ke spreadsheet yang benar.
2. Salin kode terbaru dari [`../apps-script/Code.gs`](../apps-script/Code.gs), lalu simpan.
3. Pilih **Deploy > Manage deployments > Edit > New version > Deploy**. Menyimpan kode saja tidak memperbarui Web App yang sudah di-deploy.
4. Pastikan `VITE_SCRIPT_URL` di `.env` menunjuk ke URL deployment tersebut, lalu restart aplikasi.

Jika muncul pesan header tidak sesuai, pastikan urutannya tepat:
`id | waktu | kasir | pembeli | items | total | bayar | kembali`.

---

## 📝 Notes

- **Data lama** tidak akan punya nama pembeli (akan muncul "-")
- **Transaksi baru** setelah fix akan menyimpan nama pembeli
- Jalankan update hanya setelah memastikan sheet yang benar sedang dipilih.
- Buat salinan spreadsheet sebelum mengubah struktur data.

---

## 🎯 Quick Fix (TL;DR)

```
1. Apps Script → Paste `apps-script/UpdateSheetPenjualan.gs`
2. Run fungsi updateSheetPenjualan
3. Refresh web app
4. Test transaksi baru
5. ✅ Fixed!
```
