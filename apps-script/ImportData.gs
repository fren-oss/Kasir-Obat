/**
 * Script untuk mengimport data obat demo ke Google Sheets
 * 
 * CARA MENGGUNAKAN:
 * 1. Buka Google Sheets yang digunakan untuk kasir apotek
 * 2. Extensions > Apps Script
 * 3. Copy-paste fungsi importDataObat() ini
 * 4. Klik Run > importDataObat
 * 5. Authorize jika diminta
 * 6. Data akan otomatis terisi
 */

function importDataObat() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Pastikan sheet Obat ada
  let sheet = ss.getSheetByName("Obat");
  if (!sheet) {
    sheet = ss.insertSheet("Obat");
    sheet.appendRow(["id", "nama", "kategori", "harga", "stok", "minStok", "kadaluarsa"]);
    sheet.getRange("G:G").setNumberFormat("@"); // Format kolom kadaluarsa sebagai text
  }
  
  // Data obat demo
  const dataObat = [
    ["OBT-001", "Paracetamol 500 mg (strip 10)", "Nyeri & Demam", 4000, 120, 20, "2028-06-30"],
    ["OBT-002", "Panadol Biru (strip 10)", "Nyeri & Demam", 11000, 80, 15, "2028-03-31"],
    ["OBT-003", "Bodrex (strip 4)", "Nyeri & Demam", 3500, 100, 20, "2027-11-30"],
    ["OBT-004", "Paramex (strip 4)", "Nyeri & Demam", 3000, 6, 15, "2027-09-30"],
    ["OBT-005", "Ibuprofen 200 mg (strip 10)", "Nyeri & Demam", 7500, 45, 10, "2027-12-31"],
    ["OBT-006", "Bye Bye Fever Anak (box 5)", "Nyeri & Demam", 21000, 18, 8, "2027-05-31"],
    ["OBT-007", "Neozep Forte (strip 4)", "Batuk & Flu", 3500, 90, 20, "2028-01-31"],
    ["OBT-008", "Decolgen (strip 4)", "Batuk & Flu", 3500, 75, 20, "2027-10-31"],
    ["OBT-009", "OBH Combi Batuk Flu 100 ml", "Batuk & Flu", 14500, 30, 10, "2027-08-31"],
    ["OBT-010", "Woods Peppermint 60 ml", "Batuk & Flu", 19000, 22, 8, "2027-07-31"],
    ["OBT-011", "Komix Herbal (sachet)", "Batuk & Flu", 2500, 150, 30, "2028-02-28"],
    ["OBT-012", "Promag (strip 12)", "Maag & Pencernaan", 9000, 60, 15, "2028-04-30"],
    ["OBT-013", "Mylanta Suspensi 50 ml", "Maag & Pencernaan", 17000, 25, 8, "2028-01-31"],
    ["OBT-014", "Polysilane Tablet (strip 10)", "Maag & Pencernaan", 9500, 4, 10, "2027-10-31"],
    ["OBT-015", "Oralit Sachet", "Maag & Pencernaan", 1500, 200, 40, "2028-05-31"],
    ["OBT-016", "Diapet Kapsul (strip 4)", "Maag & Pencernaan", 6500, 0, 10, "2027-11-30"],
    ["OBT-017", "Entrostop (strip 4)", "Maag & Pencernaan", 6000, 35, 10, "2027-09-30"],
    ["OBT-018", "Vitamin C 500 mg (strip 10)", "Vitamin", 6000, 110, 25, "2028-08-31"],
    ["OBT-019", "Redoxon Effervescent (tube 10)", "Vitamin", 46000, 14, 6, "2027-12-31"],
    ["OBT-020", "Enervon-C (strip 4)", "Vitamin", 4500, 85, 20, "2028-03-31"],
    ["OBT-021", "Becom-C (strip 4)", "Vitamin", 4000, 70, 20, "2027-04-30"],
    ["OBT-022", "Vitamin B Kompleks (botol 100)", "Vitamin", 28000, 12, 5, "2026-09-30"],
    ["OBT-023", "Minyak Ikan (botol 30 kapsul)", "Vitamin", 58000, 9, 5, "2027-06-30"],
    ["OBT-024", "Betadine Antiseptik 30 ml", "Luka & Kulit", 18500, 40, 10, "2028-02-28"],
    ["OBT-025", "Plester Luka (box 10)", "Luka & Kulit", 8500, 65, 15, "2029-01-31"],
    ["OBT-026", "Kassa Steril 16x16 cm (box)", "Luka & Kulit", 12000, 28, 8, "2029-06-30"],
    ["OBT-027", "Salep 88 (tube 15 g)", "Luka & Kulit", 11500, 24, 8, "2027-10-31"],
    ["OBT-028", "Counterpain Cream 30 g", "Luka & Kulit", 33000, 16, 6, "2027-09-30"],
    ["OBT-029", "Koyo Salonpas (isi 5)", "Luka & Kulit", 9500, 55, 12, "2028-07-31"],
    ["OBT-030", "Tolak Angin Cair (sachet)", "Herbal", 3500, 180, 40, "2027-08-31"],
    ["OBT-031", "Antangin JRG (sachet)", "Herbal", 3000, 160, 40, "2027-10-31"],
    ["OBT-032", "Minyak Kayu Putih 60 ml", "Herbal", 17500, 50, 12, "2028-12-31"],
    ["OBT-033", "Termometer Digital", "Alat Kesehatan", 45000, 12, 4, ""],
    ["OBT-034", "Masker Medis (box 50)", "Alat Kesehatan", 35000, 30, 10, "2029-01-31"],
    ["OBT-035", "Hand Sanitizer 100 ml", "Alat Kesehatan", 12000, 40, 10, "2028-09-30"]
  ];
  
  // Cek apakah data sudah ada (cek dari ID pertama)
  const existingData = sheet.getDataRange().getValues();
  const existingIds = existingData.map(row => row[0]);
  
  if (existingIds.includes("OBT-001")) {
    const response = Browser.msgBox(
      "Data Sudah Ada", 
      "Data obat demo sudah ada di sheet. Apakah Anda ingin menghapus data lama dan mengimport ulang?",
      Browser.Buttons.YES_NO
    );
    
    if (response === "yes") {
      // Hapus semua data kecuali header
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    } else {
      Logger.log("Import dibatalkan oleh user");
      return;
    }
  }
  
  // Import data
  const startRow = sheet.getLastRow() + 1;
  const range = sheet.getRange(startRow, 1, dataObat.length, 7);
  range.setValues(dataObat);
  
  // Format styling
  sheet.setFrozenRows(1); // Freeze header
  sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#0F766E").setFontColor("#ffffff");
  
  // Auto-resize columns
  for (let i = 1; i <= 7; i++) {
    sheet.autoResizeColumn(i);
  }
  
  // Conditional formatting untuk stok menipis
  const stokRange = sheet.getRange(2, 5, dataObat.length, 1); // Kolom stok
  const minStokRange = sheet.getRange(2, 6, dataObat.length, 1); // Kolom minStok
  
  // Format cells
  sheet.getRange(2, 4, dataObat.length, 1).setNumberFormat("#,##0"); // Harga
  sheet.getRange(2, 5, dataObat.length, 2).setNumberFormat("0"); // Stok & minStok
  
  Browser.msgBox(
    "Import Berhasil!", 
    `${dataObat.length} data obat berhasil diimport ke sheet "${sheet.getName()}".`,
    Browser.Buttons.OK
  );
  
  Logger.log(`Import selesai: ${dataObat.length} obat diimport`);
}

/**
 * Fungsi untuk menambahkan menu custom di Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏥 Kasir Apotek')
    .addItem('📥 Import Data Demo', 'importDataObat')
    .addItem('🗑️ Hapus Semua Data Obat', 'clearDataObat')
    .addSeparator()
    .addItem('📊 Lihat Statistik', 'showStatistics')
    .addToUi();
}

/**
 * Fungsi untuk menghapus semua data obat (hati-hati!)
 */
function clearDataObat() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Obat");
  
  if (!sheet) {
    Browser.msgBox("Sheet 'Obat' tidak ditemukan!");
    return;
  }
  
  const response = Browser.msgBox(
    "Konfirmasi Hapus Data", 
    "Apakah Anda yakin ingin menghapus SEMUA data obat? Tindakan ini tidak dapat dibatalkan!",
    Browser.Buttons.YES_NO
  );
  
  if (response === "yes") {
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
      Browser.msgBox("Data obat berhasil dihapus!");
    } else {
      Browser.msgBox("Tidak ada data untuk dihapus.");
    }
  }
}

/**
 * Fungsi untuk menampilkan statistik obat
 */
function showStatistics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Obat");
  
  if (!sheet || sheet.getLastRow() <= 1) {
    Browser.msgBox("Tidak ada data obat!");
    return;
  }
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  
  const totalObat = data.length;
  const totalStok = data.reduce((sum, row) => sum + row[4], 0);
  const stokMenipis = data.filter(row => row[4] <= row[5]).length;
  const stokHabis = data.filter(row => row[4] === 0).length;
  
  const kategoris = [...new Set(data.map(row => row[2]))];
  const totalKategori = kategoris.length;
  
  const message = `
📊 STATISTIK OBAT

📦 Total Obat: ${totalObat}
📊 Total Stok: ${totalStok}
⚠️ Stok Menipis: ${stokMenipis}
❌ Stok Habis: ${stokHabis}
🏷️ Total Kategori: ${totalKategori}

Kategori: ${kategoris.join(", ")}
  `;
  
  Browser.msgBox("Statistik Obat", message, Browser.Buttons.OK);
}
