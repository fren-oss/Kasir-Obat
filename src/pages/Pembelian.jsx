import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, ShoppingCart, Trash2 } from "lucide-react";
import AmountInput from "../AmountInput";
import { call } from "../api";
import {
  categoryStyle,
  formatGroupedAmount,
  medicineCategories,
  parseGroupedAmount,
  rp,
} from "../lib";
import { enterCard } from "../motion";

const hasHargaModal = (value) =>
  value !== "" &&
  value != null &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0;
const hasAmountInput = (value) =>
  value !== "" &&
  Number.isFinite(parseGroupedAmount(value)) &&
  parseGroupedAmount(value) >= 0;

export default function Pembelian({ data, reload }) {
  const [medicineName, setMedicineName] = useState("");
  const [unit, setUnit] = useState("tablet");
  const [qty, setQty] = useState("1");
  const [hargaModal, setHargaModal] = useState("");
  const [kategoriBaru, setKategoriBaru] = useState("");
  const [hargaJualBaru, setHargaJualBaru] = useState("");
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selected = data.obat.find(
    (obat) =>
      String(obat.nama || "")
        .trim()
        .toLowerCase() === medicineName.trim().toLowerCase(),
  );
  const categories = medicineCategories(data.obat);
  const categoryOptions = categories;
  const total = items.reduce(
    (sum, item) => sum + item.qty * item.hargaModal,
    0,
  );
  const selectedMissingCurrentCost =
    selected &&
    Number(selected.stok) > 0 &&
    !hasHargaModal(selected.hargaModal);
  const isNewMedicine = Boolean(medicineName.trim() && !selected);

  const addItem = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const nama = medicineName.trim();
    if (!nama) {
      setError("Nama obat wajib diisi.");
      return;
    }
    if (!Number.isInteger(Number(qty)) || Number(qty) <= 0) {
      setError("Jumlah harus berupa bilangan bulat lebih dari 0.");
      return;
    }
    if (!hasAmountInput(hargaModal)) {
      setError("Masukkan harga beli per unit.");
      return;
    }
    if (isNewMedicine && !kategoriBaru.trim()) {
      setError("Pilih jenis obat untuk obat baru.");
      return;
    }
    if (
      isNewMedicine &&
      (!hasAmountInput(hargaJualBaru) || parseGroupedAmount(hargaJualBaru) <= 0)
    ) {
      setError("Masukkan harga jual per tablet/strip untuk obat baru.");
      return;
    }
    if (selectedMissingCurrentCost) {
      setError(
        `Isi dulu harga modal stok saat ini untuk ${selected.nama} di menu Stok Obat.`,
      );
      return;
    }
    setItems((current) => [
      ...current,
      {
        ...(selected ? { id: selected.id } : {}),
        nama: selected?.nama || nama,
        kategori: selected?.kategori || kategoriBaru.trim(),
        harga: selected
          ? Number(selected.harga)
          : parseGroupedAmount(hargaJualBaru),
        qty: Number(qty),
        unit,
        hargaModal: parseGroupedAmount(hargaModal),
      },
    ]);
    setQty("1");
  };

  const removeItem = (index) => {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const savePurchase = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await call("purchase", {
        items: items.map(
          ({
            id,
            nama,
            kategori,
            harga,
            qty: itemQty,
            unit: itemUnit,
            hargaModal: itemCost,
          }) => ({
            id,
            nama,
            kategori,
            harga,
            qty: itemQty,
            unit: itemUnit,
            hargaModal: itemCost,
          }),
        ),
      });
      setItems([]);
      setNotice(`Belanja tersimpan. Total ${rp(result.total)}.`);
      await reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="purchase-page">
      <header className="purchase-heading">
        <div>
          <h2>Belanja Obat</h2>
          <p className="muted">
            Catat stok masuk; modal per unit dihitung dengan rata-rata
            tertimbang.
          </p>
        </div>
        <motion.article
          className="history-stat history-stat-accent purchase-total"
          {...enterCard()}
        >
          <span className="history-stat-icon">
            <ShoppingCart size={19} aria-hidden="true" />
          </span>
          <span className="history-stat-label">Total belanja obat</span>
          <strong>{rp(Number(data.totalBelanja) || 0)}</strong>
          <span className="history-stat-foot">Akumulasi semua pembelian</span>
        </motion.article>
      </header>

      <motion.section className="card purchase-card" {...enterCard(1)}>
        <h3>Catat pembelian baru</h3>
        <form className="purchase-fields" onSubmit={addItem}>
          <label>
            Obat
            <span className="purchase-medicine-row">
              <input
                type="text"
                value={medicineName}
                onChange={(event) => {
                  const name = event.target.value;
                  setMedicineName(name);
                  setError("");
                  const normalizedName = name.trim().toLowerCase();
                  const obat = data.obat.find(
                    (item) =>
                      String(item.nama || "")
                        .trim()
                        .toLowerCase() === normalizedName,
                  );
                  setHargaModal(
                    obat && hasHargaModal(obat.hargaModal)
                      ? formatGroupedAmount(
                          Number(obat.hargaModal) * (unit === "box" ? 10 : 1),
                        )
                      : "",
                  );
                }}
                placeholder="Ketik nama obat"
                required
              />
              <select
                aria-label="Satuan pembelian"
                value={unit}
                onChange={(event) => {
                  const nextUnit = event.target.value;
                  if (hasAmountInput(hargaModal)) {
                    const currentMultiplier = unit === "box" ? 10 : 1;
                    const nextMultiplier = nextUnit === "box" ? 10 : 1;
                    setHargaModal(
                      formatGroupedAmount(
                        (parseGroupedAmount(hargaModal) / currentMultiplier) *
                          nextMultiplier,
                      ),
                    );
                  }
                  setUnit(nextUnit);
                }}
              >
                <option value="tablet">Strip</option>
                <option value="box">Box</option>
              </select>
            </span>
            <span className="purchase-medicine-status">
              {medicineName.trim() &&
                (selected ? (
                  <span
                    className="cat-tag"
                    style={categoryStyle(selected.kategori)}
                  >
                    {selected.kategori || "Obat"}
                  </span>
                ) : (
                  <span className="muted purchase-match-hint">
                    Obat baru: pilih jenis obat dan harga jual.
                  </span>
                ))}
            </span>
          </label>
          <label>
            Jenis obat
            <select
              value={selected ? selected.kategori || "" : kategoriBaru}
              onChange={(event) => setKategoriBaru(event.target.value)}
              disabled={Boolean(selected?.kategori)}
              required={isNewMedicine}
            >
              <option value="">Pilih jenis obat</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Jumlah dibeli
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              required
            />
          </label>
          <label>
            Harga beli per {unit === "box" ? "box" : "tablet/strip"} (Rp)
            <AmountInput
              inputMode="decimal"
              value={hargaModal}
              onChange={setHargaModal}
              placeholder="Contoh: 100.000"
              required
            />
          </label>
          {isNewMedicine && (
            <label>
              Harga jual per tablet/strip (Rp)
              <AmountInput
                inputMode="decimal"
                value={hargaJualBaru}
                onChange={setHargaJualBaru}
                placeholder="Contoh: 10.000"
                required
              />
            </label>
          )}
          <button className="btn ghost purchase-add" type="submit">
            <Plus size={17} aria-hidden="true" />
            Tambah obat
          </button>
        </form>

        {selectedMissingCurrentCost && (
          <p className="error" role="alert">
            Isi harga modal stok saat ini untuk obat ini di menu Stok Obat
            sebelum mencatat pembelian.
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="scroll purchase-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama obat</th>
                <th>Jumlah</th>
                <th>Harga beli/unit</th>
                <th>Subtotal</th>
                <th>
                  <span className="sr">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.id}-${index}`}>
                  <td>
                    <div className="ohead-name">
                      <strong>{item.nama}</strong>
                      {item.kategori && (
                        <span
                          className="cat-tag"
                          style={categoryStyle(item.kategori)}
                        >
                          {item.kategori}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.qty} {item.unit === "box" ? "box" : "tablet/strip"}
                  </td>
                  <td>{rp(item.hargaModal)}</td>
                  <td>{rp(item.qty * item.hargaModal)}</td>
                  <td>
                    <button
                      className="icon danger"
                      type="button"
                      aria-label={`Hapus ${item.nama} dari belanja`}
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan="5" className="muted">
                    Belum ada obat di daftar belanja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="purchase-total-row">
          <span>Total belanja saat ini</span>
          <strong>{rp(total)}</strong>
        </div>
        <button
          className="btn primary purchase-submit"
          type="button"
          disabled={!items.length || busy}
          onClick={savePurchase}
        >
          {busy ? "Menyimpan..." : "Simpan pembelian & tambah stok"}
        </button>
        {notice && (
          <p className="ok" role="status">
            {notice}
          </p>
        )}
      </motion.section>

      <motion.section className="scroll card" {...enterCard(2)}>
        <h3>Riwayat belanja obat</h3>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>ID Pembelian</th>
              <th>Obat dibeli</th>
              <th>Kasir</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(data.pembelian || [])
              .filter(
                (purchase) =>
                  purchase.id &&
                  purchase.waktu &&
                  !Number.isNaN(new Date(purchase.waktu).getTime()),
              )
              .map((purchase) => (
              <tr key={purchase.id}>
                <td>
                  <CalendarDays size={14} aria-hidden="true" />{" "}
                  {new Date(purchase.waktu).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>#{String(purchase.id).slice(-8).toUpperCase()}</td>
                <td>
                  {purchase.items
                    .map((item) => {
                      const unitLabel = item.unit
                        ? item.unit === "box"
                          ? ` box (${item.stockQty ?? Number(item.qty) * 10} strip)`
                          : " tablet/strip"
                        : "";
                      return `${item.nama} ×${item.qty}${unitLabel}`;
                    })
                    .join(", ") || "Rincian tidak tersedia"}
                </td>
                <td>{purchase.kasir || "-"}</td>
                <td>
                  <strong>{rp(purchase.total)}</strong>
                </td>
              </tr>
              ))}
            {!(data.pembelian || []).length && (
              <tr>
                <td colSpan="5" className="muted">
                  Belum ada pembelian yang dicatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.section>
    </div>
  );
}
