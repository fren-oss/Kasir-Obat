# 📱 Setup PWA (Progressive Web App)

Aplikasi Kasir Obat sekarang bisa diinstall ke home screen seperti aplikasi native!

## 🎯 Fitur PWA yang Sudah Dibuat:
✅ Installable ke home screen (iOS & Android)
✅ Offline-capable dengan service worker
✅ App-like experience (fullscreen, no browser UI)
✅ Custom icon dan splash screen
✅ Fast loading dengan caching

---

## 📋 Langkah Setup

### Step 1: Generate Icon
1. Buka file `generate-icons.html` di browser
2. Klik **"Download 192x192"** → Simpan sebagai `icon-192.png`
3. Klik **"Download 512x512"** → Simpan sebagai `icon-512.png`
4. Copy kedua file ke folder `public/`

**Atau gunakan online tool:**
- Kunjungi: https://www.pwabuilder.com/imageGenerator
- Upload logo Anda
- Download icon pack
- Extract `icon-192.png` dan `icon-512.png` ke folder `public/`

### Step 2: Deploy ke Vercel
```bash
git add .
git commit -m "Add PWA support"
git push origin main
```

Vercel akan otomatis rebuild dengan PWA support!

### Step 3: Test PWA
Buka aplikasi di browser:
- Chrome/Edge: Lihat icon "Install" di address bar
- Safari iOS: Share → "Add to Home Screen"
- Chrome Android: Menu → "Install app"

---

## 📱 Cara Install ke Home Screen

### iOS (iPhone/iPad)
1. Buka aplikasi di **Safari** (harus Safari, bukan Chrome!)
2. Tap tombol **Share** (kotak dengan panah ke atas)
3. Scroll dan pilih **"Add to Home Screen"**
4. Edit nama jika perlu
5. Tap **"Add"**

### Android
1. Buka aplikasi di **Chrome**
2. Tap menu (3 titik) di pojok kanan atas
3. Pilih **"Install app"** atau **"Add to Home Screen"**
4. Tap **"Install"**

### Desktop (Chrome/Edge)
1. Buka aplikasi di browser
2. Lihat icon **Install** (+) di address bar
3. Klik dan pilih **"Install"**

---

## 🔧 Konfigurasi PWA

### manifest.json
File ini mendefinisikan metadata aplikasi:
- Nama aplikasi
- Icon
- Theme color
- Display mode (standalone = fullscreen tanpa browser UI)
- Shortcuts (quick actions)

### Service Worker (sw.js)
Mengatur caching strategy:
- **Network First**: Selalu coba ambil dari network, fallback ke cache
- Assets penting di-cache untuk offline support
- Auto-update cache saat ada versi baru

### Meta Tags (index.html)
- `theme-color`: Warna status bar (iOS/Android)
- `apple-mobile-web-app-capable`: Enable fullscreen di iOS
- `viewport-fit=cover`: Support iPhone dengan notch

---

## 🎨 Customization

### Ubah Warna Theme
Edit `manifest.json` dan `index.html`:
```json
"theme_color": "#3b82f6"  // Ganti dengan warna brand Anda
```

### Ubah Nama Aplikasi
Edit `manifest.json`:
```json
"name": "Kasir Obat",
"short_name": "Kasir"
```

### Tambah Shortcuts
Edit `manifest.json` → `shortcuts`:
```json
{
  "name": "Riwayat",
  "url": "/?page=riwayat",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
}
```

---

## 🧪 Testing PWA

### Chrome DevTools
1. Buka DevTools (F12)
2. Tab **"Application"**
3. Check:
   - **Manifest**: Lihat manifest.json terdeteksi
   - **Service Workers**: Pastikan status "activated"
   - **Cache Storage**: Lihat files yang di-cache

### Lighthouse Audit
1. DevTools → Tab **"Lighthouse"**
2. Categories: pilih **"Progressive Web App"**
3. Click **"Analyze page load"**
4. Target score: 90+

### Online Tools
- PWA Builder: https://www.pwabuilder.com/
- Google PWA Test: https://web.dev/measure/

---

## 🐛 Troubleshooting

### "Install" button tidak muncul
- ✅ Pastikan menggunakan HTTPS (Vercel otomatis HTTPS)
- ✅ Check manifest.json valid (Chrome DevTools → Application)
- ✅ Service worker registered successfully
- ✅ Icon files (192 & 512) tersedia

### App tidak offline
- ✅ Check Service Worker status di DevTools
- ✅ Pastikan sw.js di-deploy ke Vercel
- ✅ Clear cache dan reload (Ctrl+Shift+R)

### Icon tidak muncul di iOS
- ✅ Gunakan Safari (bukan Chrome)
- ✅ Pastikan icon ada di `public/icon-192.png`
- ✅ Check `apple-touch-icon` di index.html

### App keluar dari fullscreen
- ✅ Check manifest display mode: "standalone"
- ✅ iOS: Pastikan buka dari home screen, bukan bookmark

---

## 📊 PWA vs Native App

### Kelebihan PWA:
✅ Tidak perlu app store
✅ Update otomatis (tidak perlu approval)
✅ Single codebase (web + mobile)
✅ Lebih ringan (no install size)
✅ SEO-friendly

### Limitasi:
⚠️ Tidak bisa akses semua hardware
⚠️ Push notification terbatas di iOS
⚠️ Tidak bisa jual di App Store/Play Store
⚠️ Background sync terbatas

---

## 🚀 Next Steps

Setelah PWA setup:
1. ✅ Deploy ke Vercel
2. ✅ Generate dan upload icon
3. ✅ Test install di berbagai device
4. ✅ Share link ke user
5. ✅ Instruksikan cara install

User bisa langsung buka link dan install tanpa perlu Play Store/App Store!

---

## 📱 Marketing Tips

**Promosikan fitur "Add to Home Screen":**
- Buat banner notification di app
- Tutorial video cara install
- Screenshot comparison (browser vs installed)
- Mention di social media: "Install tanpa Play Store!"

**Contoh kalimat:**
> "📱 Install Kasir Obat ke Home Screen untuk pengalaman seperti aplikasi native! Tidak perlu Play Store, cukup buka di browser dan 'Add to Home Screen'. Gratis & update otomatis!"
