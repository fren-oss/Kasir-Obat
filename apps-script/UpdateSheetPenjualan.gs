/**
 * Script untuk update sheet Penjualan yang sudah ada
 * Menambahkan kolom "pembeli" di antara "kasir" dan "items"
 * 
 * CARA MENGGUNAKAN:
 * 1. Buka Google Sheets → Extensions > Apps Script
 * 2. Copy-paste fungsi ini
 * 3. Run fungsi updateSheetPenjualan
 * 4. Sheet akan ter-update otomatis
 */

function updateSheetPenjualan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Penjualan");
  
  if (!sheet) {
    Browser.msgBox("Sheet 'Penjualan' tidak ditemukan. Sheet akan dibuat otomatis saat checkout pertama.");
    return;
  }
  
  // Cek header yang ada
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log("Header saat ini: " + headers.join(", "));
  
  // Cek apakah kolom "pembeli" sudah ada
  if (headers.includes("pembeli")) {
    Browser.msgBox("Sheet sudah up-to-date!", "Kolom 'pembeli' sudah ada di sheet Penjualan.", Browser.Buttons.OK);
    return;
  }
  
  // Struktur header lama: ["id", "waktu", "kasir", "items", "total", "bayar", "kembali"]
  // Struktur header baru: ["id", "waktu", "kasir", "pembeli", "items", "total", "bayar", "kembali"]
  
  const response = Browser.msgBox(
    "Update Sheet Penjualan", 
    "Sheet akan diupdate untuk menambahkan kolom 'pembeli'. Data lama akan tetap aman. Lanjutkan?",
    Browser.Buttons.YES_NO
  );
  
  if (response !== "yes") {
    Logger.log("Update dibatalkan oleh user");
    return;
  }
  
  // Insert kolom baru setelah "kasir" (kolom D)
  sheet.insertColumnAfter(3); // Insert setelah kolom C (kasir)
  
  // Set header kolom baru
  sheet.getRange(1, 4).setValue("pembeli");
  
  // Isi data lama dengan "-" untuk kolom pembeli
  if (sheet.getLastRow() > 1) {
    const dataRange = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1);
    const fillData = Array(sheet.getLastRow() - 1).fill(["-"]);
    dataRange.setValues(fillData);
  }
  
  formatTransactionSheets();
  
  Browser.msgBox(
    "Update Berhasil!", 
    "Sheet 'Penjualan' berhasil diupdate dengan kolom 'pembeli'.\n\n" +
    "Data lama: pembeli = '-'\n" +
    "Transaksi baru akan menyimpan nama pembeli.",
    Browser.Buttons.OK
  );
  
  Logger.log("Sheet Penjualan berhasil diupdate");
}

/**
 * Fungsi untuk reset sheet Penjualan (jika ingin mulai dari awal)
 * HATI-HATI: Ini akan menghapus semua data transaksi!
 */
function resetSheetPenjualan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Penjualan");
  
  if (!sheet) {
    Browser.msgBox("Sheet 'Penjualan' tidak ditemukan.");
    return;
  }
  
  const response = Browser.msgBox(
    "⚠️ PERINGATAN", 
    "Ini akan MENGHAPUS SEMUA data transaksi dan membuat ulang sheet dengan struktur baru!\n\n" +
    "Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan!",
    Browser.Buttons.YES_NO
  );
  
  if (response !== "yes") {
    Logger.log("Reset dibatalkan");
    return;
  }
  
  // Hapus sheet lama
  ss.deleteSheet(sheet);
  
  // Buat sheet baru dengan struktur yang benar
  const newSheet = ss.insertSheet("Penjualan");
  const headers = ["id", "waktu", "kasir", "pembeli", "items", "total", "bayar", "kembali", "itemsData"];
  newSheet.appendRow(headers);
  
  formatTransactionSheet_("Penjualan", newSheet);
  
  Browser.msgBox(
    "Reset Berhasil!", 
    "Sheet 'Penjualan' telah direset dengan struktur baru.",
    Browser.Buttons.OK
  );
  
  Logger.log("Sheet Penjualan berhasil direset");
}

/**
 * Fungsi untuk menghapus seluruh riwayat pembelian tanpa menghapus header.
 */
function resetSheetPembelian() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pembelian");

  if (!sheet) {
    Browser.msgBox("Sheet 'Pembelian' tidak ditemukan.");
    return;
  }

  const response = Browser.msgBox(
    "⚠️ PERINGATAN",
    "Ini akan MENGHAPUS SEMUA riwayat belanja obat pada sheet Pembelian.\n\n" +
      "Data obat, stok, dan penjualan tidak akan dihapus.\n\n" +
      "Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan!",
    Browser.Buttons.YES_NO,
  );

  if (response !== "yes") {
    Logger.log("Reset Pembelian dibatalkan");
    return;
  }

  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getMaxColumns())
      .clearContent();
  }
  formatTransactionSheet_("Pembelian", sheet);

  Browser.msgBox(
    "Reset Berhasil!",
    "Seluruh riwayat belanja obat telah dihapus. Header sheet Pembelian tetap dipertahankan.",
    Browser.Buttons.OK,
  );
  Logger.log("Sheet Pembelian berhasil direset");
}

/**
 * Fungsi untuk cek struktur sheet
 */
function cekStrukturSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Penjualan");
  
  if (!sheet) {
    Browser.msgBox("Sheet 'Penjualan' tidak ditemukan.");
    return;
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const totalRows = sheet.getLastRow() - 1; // exclude header
  
  const strukturBenar = ["id", "waktu", "kasir", "pembeli", "items", "total", "bayar", "kembali", "itemsData"];
  const sudahBenar = JSON.stringify(headers) === JSON.stringify(strukturBenar);
  
  const message = 
    "📊 STRUKTUR SHEET PENJUALAN\n\n" +
    "Header saat ini:\n" + headers.join(", ") + "\n\n" +
    "Header yang seharusnya:\n" + strukturBenar.join(", ") + "\n\n" +
    "Status: " + (sudahBenar ? "✅ SUDAH BENAR" : "❌ PERLU UPDATE") + "\n" +
    "Total transaksi: " + totalRows;
  
  Browser.msgBox("Cek Struktur Sheet", message, Browser.Buttons.OK);
  Logger.log(message);
}

/**
 * Menambahkan menu custom
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Update Sheet')
    .addItem('✅ Update Sheet Penjualan', 'updateSheetPenjualan')
    .addItem('🔍 Cek Struktur Sheet', 'cekStrukturSheet')
    .addSeparator()
    .addItem('⚠️ Reset Sheet Penjualan', 'resetSheetPenjualan')
    .addItem('⚠️ Reset Riwayat Pembelian', 'resetSheetPembelian')
    .addToUi();
}
