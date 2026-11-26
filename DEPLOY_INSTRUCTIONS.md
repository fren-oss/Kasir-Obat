# 📦 Panduan Deploy ke Vercel

## Cara 1: Deploy via Terminal (Recommended)

### Step 1: Login ke Vercel
```bash
vercel login
```

### Step 2: Deploy
```bash
cd "/Users/user/Documents/kasir-obat 2"
vercel
```

Jawab pertanyaan:
- **Set up and deploy?** → `Y`
- **Which scope?** → Pilih team/account Anda
- **Link to existing project?** → `N` (untuk project baru) atau `Y` (jika sudah ada)
- **What's your project's name?** → `kasir-obat`
- **In which directory is your code located?** → `.` (tekan Enter)
- **Want to override the settings?** → `N` (Vite sudah terdeteksi otomatis)

### Step 3: Set Environment Variable
Setelah deploy pertama kali, tambahkan environment variable:

```bash
vercel env add VITE_SCRIPT_URL production
```

Paste value berikut saat diminta:
```
https://script.google.com/macros/s/AKfycbzLS6c4Yz4FRUXB2Job9BSY1xeAGdh6GgiW9IijwuCthZnezLv9rwXpi5wE23Gn_nz9Ow/exec
```

### Step 4: Redeploy dengan Environment Variable
```bash
vercel --prod
```

---

## Cara 2: Deploy via Vercel Dashboard (GUI)

### Step 1: Buka Vercel
1. Kunjungi: https://vercel.com
2. Login dengan GitHub

### Step 2: Import Project
1. Klik **"Add New"** → **"Project"**
2. Import repository: **fren-oss/Kasir-Obat**

### Step 3: Configure
Settings akan otomatis terdeteksi:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variable
Sebelum deploy, klik **"Environment Variables"**:
- **Name**: `VITE_SCRIPT_URL`
- **Value**: `https://script.google.com/macros/s/AKfycbzLS6c4Yz4FRUXB2Job9BSY1xeAGdh6GgiW9IijwuCthZnezLv9rwXpi5wE23Gn_nz9Ow/exec`
- **Environment**: Production

### Step 5: Deploy
Klik **"Deploy"** dan tunggu 2-3 menit.

---

## ✅ Verifikasi Deployment

Setelah deploy berhasil:
1. Buka URL yang diberikan (contoh: `https://kasir-obat.vercel.app`)
2. Test semua fitur:
   - ✅ Halaman Kasir
   - ✅ Halaman Stok
   - ✅ Halaman Pembelian
   - ✅ Halaman Riwayat
   - ✅ Koneksi ke Google Sheets

---

## 🔄 Auto Deployment

Setelah setup awal, setiap kali Anda push ke branch `main`:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel akan otomatis rebuild dan redeploy! 🚀

---

## 🛠️ Troubleshooting

### Error: Build Failed
```bash
# Test build locally dulu
npm run build
```

### Error: Environment Variable Not Found
```bash
# List environment variables
vercel env ls

# Pull environment variables
vercel env pull
```

### Redeploy Manually
```bash
vercel --prod --force
```

---

## 📱 Custom Domain (Opsional)

Jika ingin custom domain:
1. Buka project di Vercel Dashboard
2. Settings → Domains
3. Add domain Anda
4. Update DNS sesuai instruksi
