# 📥 Cara Import Data Obat Demo

## Metode 1: Menggunakan Apps Script (RECOMMENDED) ⭐

### Langkah-langkah:

1. **Buka Google Sheets** yang Anda gunakan untuk kasir apotek

2. **Buka Apps Script Editor**
   - Klik menu **Extensions** > **Apps Script**
   - Atau gunakan shortcut: **Alt + Shift + 1** (Windows) / **Option + Shift + 1** (Mac)

3. **Buat File Baru untuk Import**
   - Di Apps Script editor, klik **+** di sebelah "Files"
   - Beri nama: `ImportData` (atau nama lain yang Anda suka)

4. **Copy-Paste Script**
   - Buka [`../apps-script/ImportData.gs`](../apps-script/ImportData.gs)
   - Copy semua isinya
   - Paste ke file yang baru dibuat di Apps Script

5. **Jalankan Fungsi Import**
   - Pilih fungsi `importDataObat` dari dropdown di toolbar
   - Klik tombol **Run** (▶️)
   - **Pertama kali**: Anda akan diminta untuk authorize
     - Klik "Review Permissions"
     - Pilih akun Google Anda
     - Klik "Advanced" > "Go to [Project Name] (unsafe)"
     - Klik "Allow"

6. **Selesai!** ✅
   - Data 35 obat demo akan otomatis terisi di sheet "Obat"
   - Akan muncul pesan konfirmasi

### Fitur Tambahan:

Setelah menjalankan script sekali, Anda akan mendapat **menu custom** di Google Sheets:

**Menu: 🏥 Kasir Apotek**
- 📥 Import Data Demo - Import ulang data obat
- 🗑️ Hapus Semua Data Obat - Clear semua data (hati-hati!)
- 📊 Lihat Statistik - Lihat ringkasan stok obat

---

## Metode 2: Copy-Paste Manual (Alternatif)

### Langkah-langkah:

1. **Buka file CSV**
   - Buka [`../data/obat-demo.csv`](../data/obat-demo.csv) dengan Excel, Google Sheets, atau text editor

2. **Copy Data**
   - Select semua data (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

3. **Paste ke Google Sheets**
   - Buka sheet "Obat"
   - Klik cell A2 (baris pertama di bawah header)
   - Paste (Ctrl+V / Cmd+V)
   - Pilih "Split text to columns" jika muncul prompt

4. **Format Manual**
   - Format kolom "harga" sebagai number
   - Format kolom "kadaluarsa" sebagai text (agar tidak berubah jadi date)

---

## Metode 3: Import CSV Langsung

### Langkah-langkah:

1. **Buka Google Sheets** Anda

2. **Import CSV**
   - Klik **File** > **Import**
   - Upload file [`../data/obat-demo.csv`](../data/obat-demo.csv)
   - Pilih **"Insert new sheet(s)"** atau **"Replace data at selected cell"**
   - Import location: Pilih cell A1 di sheet "Obat"
   - Separator type: **Comma**
   - Convert text: **Yes** (untuk tanggal tetap sebagai text)

3. **Verifikasi Data**
   - Pastikan semua 35 obat terisi dengan benar
   - Cek format harga dan tanggal

---

## ⚠️ Troubleshooting

### Problem: "Sheet 'Obat' tidak ditemukan"
**Solusi:** 
- Pastikan sheet bernama "Obat" sudah ada
- Atau jalankan backend Apps Script dulu (Code.gs) minimal sekali

### Problem: "Authorization required"
**Solusi:**
- Ikuti proses authorization seperti langkah 5 di atas
- Ini normal untuk pertama kali menjalankan script

### Problem: "Data sudah ada"
**Solusi:**
- Script akan mendeteksi data existing
- Anda bisa pilih "Yes" untuk replace atau "No" untuk cancel

### Problem: Tanggal kadaluarsa berubah format
**Solusi:**
- Format kolom G (kadaluarsa) sebagai **Plain Text**:
  - Select kolom G
  - Format > Number > Plain text
- Atau gunakan script import (Metode 1) yang otomatis handle ini

### Problem: Harga tidak terformat
**Solusi:**
- Select kolom D (harga)
- Format > Number > Number dengan separator ribuan

---

## 📊 Data yang Akan Diimport

**Total:** 35 obat
**Kategori:**
- Nyeri & Demam (6 obat)
- Batuk & Flu (5 obat)
- Maag & Pencernaan (6 obat)
- Vitamin (6 obat)
- Luka & Kulit (6 obat)
- Herbal (3 obat)
- Alat Kesehatan (3 obat)

**Status Stok:**
- ✅ Stok Normal: 29 obat
- ⚠️ Stok Menipis: 4 obat (Paramex, Polysilane, OBH Combi, dll)
- ❌ Stok Habis: 1 obat (Diapet)
- ⏰ Mendekati Kadaluarsa: 1 obat (Vitamin B Kompleks)

---

## ✅ Verifikasi Import Berhasil

Setelah import, cek:
1. ✅ Total 35 baris data (tidak termasuk header)
2. ✅ Semua kolom terisi (kecuali kadaluarsa untuk Termometer)
3. ✅ Harga dalam format rupiah
4. ✅ Tanggal dalam format YYYY-MM-DD
5. ✅ ID obat dari OBT-001 sampai OBT-035

---

## 🚀 Setelah Import

1. **Refresh Web App**
   - Buka aplikasi kasir di browser
   - Refresh (F5 atau Cmd+R)
   - Data obat akan muncul dalam 30 detik (auto-reload)

2. **Test Fitur**
   - Coba filter kategori
   - Coba tambah ke cart
   - Cek alert stok menipis (bell icon)

3. **Mulai Transaksi!** 🎉
   - Sistem siap digunakan
   - Semua fitur sudah berfungsi

---

## 💡 Tips

- **Backup Data**: Sebelum import, backup sheet Anda
- **Test Mode**: Gunakan copy sheet untuk testing dulu
- **Custom Data**: Edit langsung di Google Sheets kapan saja
- **Auto-Sync**: Perubahan di sheet otomatis sync ke web (max 30 detik)

---

## 📝 Notes

- Data ini adalah **data demo** untuk testing
- Anda bisa edit/hapus/tambah obat langsung di Google Sheets
- Harga dan stok bisa disesuaikan dengan kebutuhan
- Tanggal kadaluarsa sudah diset untuk 2027-2029

**Enjoy! 🎉**
