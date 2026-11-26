const URL = import.meta.env.VITE_SCRIPT_URL || 
  "https://script.google.com/macros/s/AKfycbzLS6c4Yz4FRUXB2Job9BSY1xeAGdh6GgiW9IijwuCthZnezLv9rwXpi5wE23Gn_nz9Ow/exec";
const API_VERSION = 5;

// Debug: Log environment variable (akan muncul di Console browser)
console.log('🔍 Debug Environment Variable:');
console.log('  VITE_SCRIPT_URL dari env:', import.meta.env.VITE_SCRIPT_URL);
console.log('  URL yang digunakan:', URL);
console.log('  Pakai fallback?:', !import.meta.env.VITE_SCRIPT_URL);
console.log('  Build time:', new Date().toISOString());

// Alert untuk debugging (akan muncul sebagai popup)
if (!import.meta.env.VITE_SCRIPT_URL) {
  console.warn('⚠️ WARNING: VITE_SCRIPT_URL tidak ada, menggunakan fallback URL');
}

export const session = {
  get: () => JSON.parse(sessionStorage.getItem("kasir") || "null"),
  set: (v) => sessionStorage.setItem("kasir", JSON.stringify(v)),
  clear: () => sessionStorage.removeItem("kasir"),
};

// text/plain menghindari preflight CORS yang tidak didukung Apps Script
export async function call(action, data = {}, options = {}) {
  if (!URL) {
    console.error('❌ VITE_SCRIPT_URL tidak ada!');
    throw new Error("URL Google Apps Script tidak tersedia. Hubungi administrator.");
  }
  
  const s = session.get() || {};
  
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, pass: s.pass, kasir: s.kasir, ...data }),
      signal: options.signal,
      credentials: 'omit',
      keepalive: action !== 'checkout',
    });
    
    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    
    const j = await res.json();
    if (j.error) throw new Error(j.error);
    if (j.apiVersion !== API_VERSION) {
      throw new Error(
        `Versi dari POST Apps Script (${j.apiVersion ?? "tidak dikirim"}) tidak sesuai; aplikasi membutuhkan versi ${API_VERSION}. Pastikan Code.gs lengkap, termasuk doPost, sudah di-deploy ke URL di VITE_SCRIPT_URL.`,
      );
    }
    return j;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
}
