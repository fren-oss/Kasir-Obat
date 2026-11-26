const URL = import.meta.env.VITE_SCRIPT_URL;
const API_VERSION = 5;

// Debug: Log environment variable
console.log('🔍 Debug Environment Variable:');
console.log('  VITE_SCRIPT_URL:', URL);
console.log('  Exists:', !!URL);
console.log('  All env keys:', Object.keys(import.meta.env));

export const session = {
  get: () => JSON.parse(sessionStorage.getItem("kasir") || "null"),
  set: (v) => sessionStorage.setItem("kasir", JSON.stringify(v)),
  clear: () => sessionStorage.removeItem("kasir"),
};

// text/plain menghindari preflight CORS yang tidak didukung Apps Script
export async function call(action, data = {}, options = {}) {
  if (!URL) throw new Error("VITE_SCRIPT_URL belum diisi. Isi URL Web App Apps Script di file .env, lalu restart server.");
  const s = session.get() || {};
  
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, pass: s.pass, kasir: s.kasir, ...data }),
    // Support untuk AbortController timeout
    signal: options.signal,
    // Tambahkan credentials jika diperlukan
    credentials: 'omit',
    // Keep-alive untuk koneksi lebih cepat
    keepalive: action !== 'checkout', // Hindari keepalive pada checkout untuk reliability
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
}
