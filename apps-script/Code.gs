// Backend kasir apotek: Google Apps Script yang membaca/menulis Google Sheet ini.
const SS = SpreadsheetApp.getActiveSpreadsheet();
const API_VERSION = 5;
const HEAD = {
  Obat: [
    "id",
    "nama",
    "kategori",
    "harga",
    "stok",
    "minStok",
    "kadaluarsa",
    "hargaModal",
  ],
  Penjualan: [
    "id",
    "waktu",
    "kasir",
    "pembeli",
    "items",
    "total",
    "bayar",
    "kembali",
    "itemsData",
  ],
  Pembelian: ["id", "waktu", "kasir", "items", "total", "itemsData"],
};
const TEXT_COL = { Obat: "G:G" };
const TRANSACTION_SHEETS = {
  Penjualan: {
    itemColumn: 5,
    dataColumn: 9,
    widths: [280, 190, 120, 160, 520, 120, 120, 120],
    moneyColumns: [6, 7, 8],
  },
  Pembelian: {
    itemColumn: 4,
    dataColumn: 6,
    widths: [280, 190, 120, 520, 120],
    moneyColumns: [5],
  },
};

function sheet(n) {
  let s = SS.getSheetByName(n);
  if (!s) s = SS.insertSheet(n);
  if (s.getLastRow() === 0) {
    s.appendRow(HEAD[n]);
    if (TEXT_COL[n]) s.getRange(TEXT_COL[n]).setNumberFormat("@");
    if (TRANSACTION_SHEETS[n]) formatTransactionSheet_(n, s);
  }
  if (n === "Obat") {
    const headers = s
      .getRange(1, 1, 1, HEAD.Obat.length)
      .getDisplayValues()[0]
      .map((header) => String(header).trim());
    const legacyHeaders = HEAD.Obat.slice(0, -1);
    if (
      legacyHeaders.every((header, index) => headers[index] === header) &&
      !headers[legacyHeaders.length] &&
      s.getLastColumn() <= legacyHeaders.length
    ) {
      s.getRange(1, HEAD.Obat.length).setValue("hargaModal");
      s.getRange(1, HEAD.Obat.length, s.getMaxRows(), 1).setNumberFormat("0");
      headers[legacyHeaders.length] = "hargaModal";
    }
    if (HEAD.Obat.some((header, index) => headers[index] !== header)) {
      throw new Error(
        "Header sheet Obat tidak sesuai. Urutannya harus: " +
          HEAD.Obat.join(", "),
      );
    }
  }
  if (n === "Penjualan" || n === "Pembelian") {
    const config = TRANSACTION_SHEETS[n];
    const headers = s
      .getRange(1, 1, 1, HEAD[n].length)
      .getDisplayValues()[0]
      .map((header) => String(header).trim());
    const visibleHeaders = HEAD[n].slice(0, -1);
    if (
      visibleHeaders.every((header, index) => headers[index] === header) &&
      !headers[config.dataColumn - 1]
    ) {
      s.getRange(1, config.dataColumn).setValue(HEAD[n][config.dataColumn - 1]);
      headers[config.dataColumn - 1] = HEAD[n][config.dataColumn - 1];
    }
    if (HEAD[n].some((header, index) => headers[index] !== header)) {
      throw new Error(
        `Header sheet ${n} tidak sesuai. Urutannya harus: ${HEAD[n].join(", ")}`,
      );
    }
    s.hideColumns(config.dataColumn);
  }
  return s;
}

function formatTransactionSheet_(name, target) {
  const config = TRANSACTION_SHEETS[name];
  const columns = config.widths.length;
  const bodyRows = Math.max(target.getMaxRows() - 1, 1);

  target.setFrozenRows(1);
  target
    .getRange(1, 1, 1, columns)
    .setFontWeight("bold")
    .setBackground("#0F766E")
    .setFontColor("#ffffff")
    .setVerticalAlignment("middle");
  target.getRange(2, 1, bodyRows, columns).setVerticalAlignment("top");
  config.widths.forEach((width, index) =>
    target.setColumnWidth(index + 1, width),
  );
  target.getRange(2, 1, bodyRows, 1).setNumberFormat("@");
  target.getRange(2, 2, bodyRows, 1).setNumberFormat("dd/MM/yyyy HH:mm:ss");
  target.getRange(2, config.dataColumn, bodyRows, 1).setNumberFormat("@");
  target
    .getRange(2, config.itemColumn, bodyRows, 1)
    .setWrap(true)
    .setVerticalAlignment("top");
  config.moneyColumns.forEach((column) =>
    target.getRange(2, column, bodyRows, 1).setNumberFormat("#,##0"),
  );
  target.hideColumns(config.dataColumn);
}

function formatSheetCurrency_(value) {
  if (value === "" || value == null || !Number.isFinite(Number(value)))
    return "";
  return `Rp${Math.round(Number(value)).toLocaleString("id-ID")}`;
}

function formatItemSummary_(items, sheetName) {
  return items
    .map((item) => {
      const label = `${String(item.nama || "Obat").trim()} × ${item.qty ?? 0}`;
      if (sheetName === "Pembelian") {
        const unit = String(item.unit || "").trim();
        const stockQty =
          Number(item.stockQty) || (unit === "box" ? Number(item.qty) * 10 : 0);
        const quantity =
          unit === "box"
            ? `${label} box (${stockQty} strip)`
            : `${label}${unit ? ` ${unit}` : ""}`;
        const price = formatSheetCurrency_(item.hargaModal);
        return `${quantity}${price ? ` · Modal ${price}${unit ? `/${unit}` : ""}` : ""}`;
      }

      const details = [];
      const price = formatSheetCurrency_(item.harga);
      const cost = formatSheetCurrency_(item.hargaModal);
      if (price) details.push(`Jual ${price}`);
      if (cost) details.push(`Modal ${cost}`);
      return `${label}${details.length ? ` · ${details.join(" · ")}` : ""}`;
    })
    .join("\n");
}

function formatTransactionSheets() {
  Object.entries(TRANSACTION_SHEETS).forEach(([name, config]) => {
    const target = sheet(name);
    const lastRow = target.getLastRow();
    if (lastRow > 1) {
      const rowCount = lastRow - 1;
      const timeRange = target.getRange(2, 2, rowCount, 1);
      const times = timeRange.getValues().map(([value], index) => {
        if (value instanceof Date || !value) return [value];
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
          Logger.log(`Waktu tidak valid di sheet ${name}, baris ${index + 2}.`);
          return [value];
        }
        return [parsed];
      });
      timeRange.setValues(times);

      const itemsRange = target.getRange(2, config.itemColumn, rowCount, 1);
      const itemsDataRange = target.getRange(2, config.dataColumn, rowCount, 1);
      const visibleItems = itemsRange.getValues();
      const storedItems = itemsDataRange.getValues();
      const summaries = [];
      const serializedItems = [];
      visibleItems.forEach(([value], index) => {
        const source = storedItems[index][0] || value;
        if (typeof source !== "string" || !source.trim()) {
          summaries.push([value]);
          serializedItems.push([storedItems[index][0]]);
          return;
        }
        try {
          let items = JSON.parse(source);
          if (!Array.isArray(items) && items && typeof items === "object") {
            if (Array.isArray(items.items)) items = items.items;
            else if (items.nama && items.qty !== undefined) items = [items];
          }
          if (!Array.isArray(items))
            throw new Error("Items harus berupa daftar.");
          summaries.push([formatItemSummary_(items, name)]);
          serializedItems.push([JSON.stringify(items)]);
        } catch (error) {
          Logger.log(`Items tidak valid di sheet ${name}, baris ${index + 2}.`);
          summaries.push([value]);
          serializedItems.push([storedItems[index][0]]);
        }
      });
      itemsRange.setValues(summaries);
      itemsDataRange.setValues(serializedItems);
    }
    formatTransactionSheet_(name, target);
  });
  Logger.log("Format sheet Penjualan dan Pembelian berhasil diperbarui.");
}

function rows(n) {
  const v = sheet(n).getDataRange().getValues();
  const h = v.shift();
  const tz = SS.getSpreadsheetTimeZone();
  const dataRows = TRANSACTION_SHEETS[n]
    ? v.filter((r) => String(r[0] ?? "").trim() !== "")
    : v;
  return dataRows.map((r) => {
    const row = Object.fromEntries(
      h.map((k, j) => {
        let x = r[j];
        if (x instanceof Date)
          x =
            k === "kadaluarsa"
              ? Utilities.formatDate(x, tz, "yyyy-MM-dd")
              : x.toISOString();
        return [k, x];
      }),
    );
    if (TRANSACTION_SHEETS[n]) {
      if (row.itemsData) row.items = row.itemsData;
      delete row.itemsData;
    }
    return row;
  });
}

function findRow(s, id) {
  return s.getRange(1, 1, s.getLastRow(), 1).getValues().flat().indexOf(id); // indeks 0-based, header = 0
}

function saleItems(value) {
  if (!value) return { items: [], itemsError: true };
  let items;
  try {
    items = typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return { items: [], itemsError: true };
  }
  if (!Array.isArray(items) && items && typeof items === "object") {
    if (Array.isArray(items.items)) items = items.items;
    else if (items.nama && items.qty !== undefined) items = [items];
  }
  if (!Array.isArray(items)) return { items: [], itemsError: true };
  const validItems = items.filter((item) => item && typeof item === "object");
  return {
    items: validItems,
    itemsError: validItems.length !== items.length,
  };
}

const ACTIONS = {
  login: () => ({ ok: true }),

  list: () => {
    const penjualan = rows("Penjualan").map((r) => ({
      ...r,
      ...saleItems(r.items),
    }));
    const pembelian = rows("Pembelian").map((r) => ({
      ...r,
      ...saleItems(r.items),
    }));
    const calculatedProfit = penjualan.reduce(
      (total, transaksi) =>
        total +
        transaksi.items.reduce((transactionProfit, item) => {
          if (item.hargaModal === "" || item.hargaModal == null) {
            return transactionProfit;
          }
          const harga = Number(item.harga);
          const hargaModal = Number(item.hargaModal);
          const qty = Number(item.qty);
          if (
            !Number.isFinite(harga) ||
            !Number.isFinite(hargaModal) ||
            !Number.isFinite(qty)
          ) {
            return transactionProfit;
          }
          return transactionProfit + (harga - hargaModal) * qty;
        }, 0),
      0,
    );
    const totalProfit = Math.max(0, calculatedProfit);
    const timezone = SS.getSpreadsheetTimeZone();
    const trendKeys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return Utilities.formatDate(date, timezone, "yyyy-MM-dd");
    });
    const trendIndexes = new Map(trendKeys.map((key, index) => [key, index]));
    const products = new Map();
    penjualan.forEach((transaksi) => {
      const saleDate = new Date(transaksi.waktu);
      const trendIndex = Number.isNaN(saleDate.getTime())
        ? undefined
        : trendIndexes.get(
            Utilities.formatDate(saleDate, timezone, "yyyy-MM-dd"),
          );
      transaksi.items.forEach((item) => {
        const name = String(item.nama || "").trim();
        const units = Number(item.qty) || 0;
        if (!name || units <= 0) return;
        const key = item.id ? `id:${item.id}` : `name:${name.toLowerCase()}`;
        const product = products.get(key) || {
          id: item.id || "",
          name,
          units: 0,
          transactions: 0,
          weeklyUnits: Array(7).fill(0),
        };
        product.units += units;
        product.transactions += 1;
        if (trendIndex !== undefined) product.weeklyUnits[trendIndex] += units;
        products.set(key, product);
      });
    });
    const bestSeller =
      [...products.values()].sort(
        (a, b) => b.units - a.units || b.transactions - a.transactions,
      )[0] || null;
    const totalBelanja = pembelian.reduce(
      (total, transaksi) => total + (Number(transaksi.total) || 0),
      0,
    );

    return {
      obat: rows("Obat"),
      penjualan: penjualan
        .slice()
        .sort(
          (a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime(),
        )
        .slice(0, 50),
      pembelian: pembelian
        .slice()
        .sort(
          (a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime(),
        )
        .slice(0, 50),
      bestSeller,
      totalProfit,
      totalBelanja,
    };
  },

  saveObat: (b) => {
    const o = b.obat,
      s = sheet("Obat");
    if (!o.nama) throw new Error("Nama obat wajib diisi.");
    if (
      o.hargaModal === "" ||
      o.hargaModal == null ||
      !Number.isFinite(Number(o.hargaModal)) ||
      Number(o.hargaModal) < 0
    ) {
      throw new Error("Harga modal wajib diisi dengan angka 0 atau lebih.");
    }
    const id = o.id || Utilities.getUuid();
    const line = [
      id,
      o.nama,
      o.kategori || "",
      +o.harga,
      +o.stok,
      +o.minStok,
      o.kadaluarsa || "",
      Number(o.hargaModal),
    ];
    const at = findRow(s, id);
    if (at > 0) s.getRange(at + 1, 1, 1, line.length).setValues([line]);
    else s.appendRow(line);
    return { ok: true };
  },

  deleteObat: (b) => {
    const s = sheet("Obat"),
      at = findRow(s, b.id);
    if (at > 0) s.deleteRow(at + 1);
    return { ok: true };
  },

  purchase: (b) => {
    if (!Array.isArray(b.items) || !b.items.length) {
      throw new Error("Tambahkan minimal satu obat ke daftar belanja.");
    }

    const stockSheet = sheet("Obat");
    const purchaseSheet = sheet("Pembelian");
    const data = stockSheet.getDataRange().getValues();
    const items = b.items.map((item) => {
      const nama = String(item.nama || "").trim();
      const qty = Number(item.qty);
      const unit = item.unit || "tablet";
      const multiplier = unit === "box" ? 10 : unit === "tablet" ? 1 : 0;
      const hargaModal = Number(item.hargaModal);
      if (!nama) throw new Error("Nama obat wajib diisi.");
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error(
          "Jumlah pembelian harus berupa bilangan bulat lebih dari 0.",
        );
      }
      if (!multiplier) {
        throw new Error("Satuan pembelian tidak valid.");
      }
      if (
        item.hargaModal === "" ||
        item.hargaModal == null ||
        !Number.isFinite(hargaModal) ||
        hargaModal < 0
      ) {
        throw new Error("Harga beli harus berupa angka 0 atau lebih.");
      }

      const hasId = Boolean(
        item.id !== undefined && item.id !== null && String(item.id).trim(),
      );
      const rowIndex = data.findIndex((row, index) => {
        if (index === 0) return false;
        if (hasId) return row[0] === item.id;
        return (
          String(row[1] || "")
            .trim()
            .toLowerCase() === nama.toLowerCase()
        );
      });
      if (hasId && rowIndex < 0) throw new Error("Obat tidak ditemukan.");

      const isNew = rowIndex < 0;
      const kategori = String(item.kategori || "").trim();
      const harga = Number(item.harga);
      if (isNew && !kategori) {
        throw new Error(`Kategori obat baru ${nama} wajib diisi.`);
      }
      if (
        isNew &&
        (item.harga === "" ||
          item.harga == null ||
          !Number.isFinite(harga) ||
          harga <= 0)
      ) {
        throw new Error(`Harga jual obat baru ${nama} harus lebih dari 0.`);
      }

      const namaItem = isNew ? nama : data[rowIndex][1];
      const groupKey = isNew ? `new:${nama.toLowerCase()}` : `row:${rowIndex}`;
      return {
        id: isNew ? "" : data[rowIndex][0],
        nama: namaItem,
        kategori,
        harga,
        isNew,
        groupKey,
        qty,
        unit,
        stockQty: qty * multiplier,
        hargaModal,
        totalCost: qty * hargaModal,
        rowIndex,
      };
    });

    const grouped = new Map();
    items.forEach((item) => {
      const current = grouped.get(item.groupKey) || {
        groupKey: item.groupKey,
        rowIndex: item.rowIndex,
        id: item.id,
        nama: item.nama,
        kategori: item.kategori,
        harga: item.harga,
        isNew: item.isNew,
        stockQty: 0,
        totalCost: 0,
      };
      if (
        item.isNew &&
        (current.kategori.toLowerCase() !== item.kategori.toLowerCase() ||
          current.harga !== item.harga)
      ) {
        throw new Error(
          `Kategori dan harga jual untuk ${item.nama} harus sama dalam satu pembelian.`,
        );
      }
      current.stockQty += item.stockQty;
      current.totalCost += item.totalCost;
      grouped.set(item.groupKey, current);
    });

    const updates = [...grouped.values()].map((purchase) => {
      if (purchase.isNew) {
        return {
          ...purchase,
          id: Utilities.getUuid(),
          newStock: purchase.stockQty,
          newCost: purchase.totalCost / purchase.stockQty,
        };
      }

      const product = data[purchase.rowIndex];
      const stock = Number(product[4]);
      const rawCurrentCost = product[7];
      const currentCost = Number(rawCurrentCost);
      if (!Number.isFinite(stock) || stock < 0) {
        throw new Error(`Stok ${product[1]} tidak valid.`);
      }
      if (
        stock > 0 &&
        (rawCurrentCost === "" ||
          rawCurrentCost == null ||
          !Number.isFinite(currentCost) ||
          currentCost < 0)
      ) {
        throw new Error(
          `Isi dulu harga modal stok saat ini untuk ${product[1]} di menu Stok Obat.`,
        );
      }

      const newStock = stock + purchase.stockQty;
      const newCost =
        stock > 0
          ? (stock * currentCost + purchase.totalCost) / newStock
          : purchase.totalCost / purchase.stockQty;
      return { ...purchase, id: product[0], newStock, newCost };
    });

    const total = items.reduce((sum, item) => sum + item.totalCost, 0);
    const waktu = new Date();
    const savedByKey = new Map(
      updates.map((purchase) => [purchase.groupKey, purchase]),
    );
    const logItems = items.map((item) => {
      const saved = savedByKey.get(item.groupKey);
      return {
        id: saved.id,
        nama: item.nama,
        qty: item.qty,
        unit: item.unit,
        stockQty: item.stockQty,
        hargaModal: item.hargaModal,
      };
    });

    updates.forEach((update) => {
      if (update.isNew) {
        stockSheet.appendRow([
          update.id,
          update.nama,
          update.kategori,
          update.harga,
          update.newStock,
          0,
          "",
          update.newCost,
        ]);
      } else {
        stockSheet.getRange(update.rowIndex + 1, 5).setValue(update.newStock);
        stockSheet.getRange(update.rowIndex + 1, 8).setValue(update.newCost);
      }
    });
    purchaseSheet.insertRowAfter(1);
    purchaseSheet
      .getRange(2, 1, 1, HEAD.Pembelian.length)
      .setValues([
        [
          Utilities.getUuid(),
          waktu,
          b.kasir || "-",
          formatItemSummary_(logItems, "Pembelian"),
          total,
          JSON.stringify(logItems),
        ],
      ]);
    purchaseSheet
      .getRange(2, 1, 1, HEAD.Pembelian.length)
      .setBackground("#ffffff")
      .setFontColor("#1f2937")
      .setFontWeight("normal")
      .setVerticalAlignment("top");
    purchaseSheet.getRange(2, 2).setNumberFormat("dd/MM/yyyy HH:mm:ss");
    purchaseSheet.getRange(2, 4).setWrap(true);
    purchaseSheet.getRange(2, 5).setNumberFormat("#,##0");

    return { ok: true, total };
  },

  checkout: (b) => {
    const s = sheet("Obat"),
      salesSheet = sheet("Penjualan"),
      data = s.getDataRange().getValues();
    let total = 0;
    const items = b.items.map((i) => {
      const k = data.findIndex((r, n) => n > 0 && r[0] === i.id);
      if (k < 0) throw new Error("Obat tidak ditemukan: " + i.nama);
      const r = data[k];
      if (r[4] < i.qty)
        throw new Error(`Stok ${r[1]} tidak cukup (sisa ${r[4]}).`);
      const hargaModal = Number(r[7]);
      if (
        r[7] === "" ||
        r[7] == null ||
        !Number.isFinite(hargaModal) ||
        hargaModal < 0
      ) {
        throw new Error(`Harga modal ${r[1]} belum diisi di menu Stok Obat.`);
      }
      // Gunakan harga custom dari item jika ada, fallback ke harga asli
      const harga = i.harga !== undefined ? +i.harga : r[3];
      total += harga * i.qty;
      return { k, id: i.id, nama: r[1], harga, hargaModal, qty: i.qty };
    });
    if (b.bayar < total) throw new Error("Uang yang diterima kurang.");
    items.forEach((i) => s.getRange(i.k + 1, 5).setValue(data[i.k][4] - i.qty));
    salesSheet.insertRowAfter(1);
    salesSheet.getRange(2, 1, 1, HEAD.Penjualan.length).setValues([
      [
        Utilities.getUuid(),
        new Date(),
        b.kasir || "-",
        b.pembeli || "-",
        formatItemSummary_(items, "Penjualan"),
        total,
        b.bayar,
        b.bayar - total,
        JSON.stringify(
          items.map(({ id, nama, harga, hargaModal, qty }) => ({
            id,
            nama,
            harga,
            hargaModal,
            qty,
          })),
        ),
      ],
    ]);
    salesSheet
      .getRange(2, 1, 1, HEAD.Penjualan.length)
      .setBackground("#ffffff")
      .setFontColor("#1f2937")
      .setFontWeight("normal")
      .setVerticalAlignment("top");
    salesSheet.getRange(2, 2).setNumberFormat("dd/MM/yyyy HH:mm:ss");
    salesSheet.getRange(2, 5).setWrap(true);
    [6, 7, 8].forEach((column) =>
      salesSheet.getRange(2, column).setNumberFormat("#,##0"),
    );
    return { ok: true, total, kembali: b.bayar - total };
  },
};

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      service: "Kasir Apotek API",
      apiVersion: API_VERSION,
      message: "Endpoint aktif. Aplikasi menggunakan POST.",
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const out = (o) =>
    ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
      ContentService.MimeType.JSON,
    );
  try {
    const b = JSON.parse(e.postData.contents);
    const pw = PropertiesService.getScriptProperties().getProperty("PASSWORD");
    if (!pw || b.pass !== pw) return out({ error: "Kata sandi salah." });
    if (!ACTIONS[b.action]) return out({ error: "Aksi tidak dikenal." });
    const lock = LockService.getScriptLock(); // cegah dua kasir menjual stok yang sama bersamaan
    lock.waitLock(20000);
    try {
      return out({ ...ACTIONS[b.action](b), apiVersion: API_VERSION });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return out({ error: err.message });
  }
}

function resetSheetPembelian() {
  const purchaseSheet = SS.getSheetByName("Pembelian");
  if (!purchaseSheet) {
    Browser.msgBox("Sheet 'Pembelian' tidak ditemukan.");
    return;
  }

  const response = Browser.msgBox(
    "Peringatan",
    "Hapus semua riwayat belanja obat? Data stok dan penjualan tidak akan dihapus.",
    Browser.Buttons.YES_NO,
  );
  if (response !== "yes") return;

  if (purchaseSheet.getLastRow() > 1) {
    purchaseSheet
      .getRange(
        2,
        1,
        purchaseSheet.getLastRow() - 1,
        purchaseSheet.getMaxColumns(),
      )
      .clearContent();
  }
  formatTransactionSheet_("Pembelian", purchaseSheet);
  Browser.msgBox("Riwayat belanja obat berhasil direset.");
}
