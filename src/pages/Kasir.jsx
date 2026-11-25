import { useMemo, useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronRight, Minus, Pill, Plus, X } from "lucide-react";
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

const day = (d) => new Date(d).toDateString();
const LOW_STOCK_LIMIT = 15;
const hasHargaModal = (value) =>
  value !== "" &&
  value != null &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0;
const ago = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 6e4);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  if (m < 1440) return `${Math.floor(m / 60)} jam lalu`;
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};

const Stepper = memo(function Stepper({ qty, onMinus, onPlus, plusOff }) {
  return (
    <div className="step">
      <button className="rb" aria-label="Kurangi" disabled={!qty} onClick={onMinus}><Minus size={16} /></button>
      <output>{qty}</output>
      <button className="rb" aria-label="Tambah" disabled={!qty || plusOff} onClick={onPlus}><Plus size={16} /></button>
    </div>
  );
});

export default function Kasir({ data, reload, q, go }) {
  const reduceMotion = useReducedMotion();
  const obat = data?.obat || [];
  const penjualan = data?.penjualan || [];
  const [cat, setCat] = useState("Semua");
  const [txTab, setTxTab] = useState("hari");
  const [cart, setCart] = useState([]);
  const [pembeli, setPembeli] = useState("");
  const [bayar, setBayar] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const groups = useMemo(() => {
    const t = new Date().toDateString();
    const y = new Date(Date.now() - 864e5).toDateString();
    return {
      hari: penjualan.filter((r) => day(r.waktu) === t),
      kemarin: penjualan.filter((r) => day(r.waktu) === y),
      semua: penjualan,
    };
  }, [penjualan]);
  const totalHariIni = groups.hari.reduce((s, r) => s + r.total, 0);

  const cats = ["Semua", ...medicineCategories(obat)];
  const list = useMemo(
    () => obat.filter((o) => (cat === "Semua" || o.kategori === cat) && o.nama.toLowerCase().includes((q || "").toLowerCase())),
    [obat, cat, q]
  );
  const countOf = (c) => obat.filter((o) => c === "Semua" || o.kategori === c).length;

  const qtyOf = (id) => cart.find((i) => i.id === id)?.qty || 0;
  const total = cart.reduce((s, i) => s + i.harga * i.qty, 0);
  const nItem = cart.reduce((s, i) => s + i.qty, 0);
  const missingHargaModal = cart.some((item) => !hasHargaModal(item.hargaModal));
  const bayarN = parseGroupedAmount(bayar) || 0;
  const kurang = bayarN < total;

  const add = (o) => {
    setMsg(null);
    setCart((c) => {
      const f = c.find((i) => i.id === o.id);
      if (f) return c.map((i) => (i.id === o.id ? { ...i, qty: Math.min(i.qty + 1, o.stok), stok: o.stok } : i));
      return [...c, { id: o.id, nama: o.nama, kategori: o.kategori, harga: o.harga, hargaModal: o.hargaModal, qty: 1, stok: o.stok }];
    });
  };
  const step = (id, d) =>
    setCart((c) => c.flatMap((i) => (i.id !== id ? [i] : i.qty + d < 1 ? [] : [{ ...i, qty: Math.min(i.stok, i.qty + d) }])));
  const remove = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const clear = () => { setCart([]); setBayar(""); setPembeli(""); };

  const checkout = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await call("checkout", { 
        items: cart.map(({ id, nama, qty }) => ({ id, nama, qty })), 
        bayar: bayarN,
        pembeli: pembeli.trim() || "Umum"
      });
      setMsg({ ok: true, text: `Transaksi tersimpan. Kembalian ${rp(r.kembali)}.` });
      clear();
      reload();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <main className="main">
        <section aria-labelledby="h-tx">
          <div className="sechead">
            <h2 id="h-tx">Transaksi Terbaru</h2>
            <div className="seg tx-tabs seg-animated" role="group" aria-label="Filter transaksi">
            {[["hari", "Hari ini"], ["kemarin", "Kemarin"], ["semua", "Semua"]].map(([k, l]) => (
              <motion.button
                key={k}
                className="chip"
                aria-pressed={txTab === k}
                onClick={() => setTxTab(k)}
              >
                <AnimatePresence initial={false}>
                  {txTab === k && (
                    <motion.span
                      className="seg-active-pill"
                      layoutId="active-tx-indicator"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 440, damping: 36 }
                      }
                    />
                  )}
                </AnimatePresence>
                <span className="tx-label">
                  {l}
                  <motion.span
                    className="count"
                    aria-hidden={txTab !== k}
                    initial={false}
                    animate={{ opacity: txTab === k ? 1 : 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {groups[k].length}
                  </motion.span>
                </span>
              </motion.button>
            ))}
            </div>
            <span className="grow" />
            <button className="link" onClick={() => go("riwayat")}>Semua Riwayat <ChevronRight size={16} aria-hidden="true" /></button>
          </div>
          <p className="muted">Total penjualan hari ini <strong>{rp(totalHariIni)}</strong></p>
          <div className="ocards">
            {groups[txTab].slice(0, 4).map((r, index) => (
              <motion.div
                className="ocard"
                key={`${txTab}-${r.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.22,
                  delay: Math.min(index * 0.04, 0.12),
                  ease: "easeOut",
                }}
                whileHover={{ y: -5, transition: { type: "spring", stiffness: 350, damping: 24 } }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="r1"><strong>{r.kasir}</strong><span className="muted">#{String(r.id).slice(-6).toUpperCase()}</span></div>
                <div className="r1 muted"><span>{r.items.reduce((n, i) => n + i.qty, 0)} item</span><span>{ago(r.waktu)}</span></div>
                {r.itemsError && <span className="muted">Rincian item lama tidak tersedia.</span>}
                <span className="pricepill">{rp(r.total)}</span>
              </motion.div>
            ))}
            {!groups[txTab].length && (
              <motion.p
                className="muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                Belum ada transaksi.
              </motion.p>
            )}
          </div>
        </section>

        <section aria-labelledby="h-obat">
          <div className="sechead">
            <h2 id="h-obat">Daftar Obat</h2>
            <div className="seg scrollx categories-tabs seg-animated" role="group" aria-label="Kategori">
              {cats.map((c) => (
                <motion.button
                  key={c}
                  layout
                  className={`chip cat-chip${c === "Semua" ? " chip-all" : ""}`}
                  style={c === "Semua" ? undefined : categoryStyle(c)}
                  aria-pressed={cat === c}
                  onClick={() => setCat(c)}
                  transition={{ layout: { type: "spring", stiffness: 500, damping: 38 } }}
                >
                  {cat === c && (
                    <motion.span
                      className="seg-active-pill"
                      layoutId="category-active-pill"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="tx-label">
                    {c !== "Semua" && <span className="cat-dot" aria-hidden="true" />}
                    {c}
                    {cat === c && (
                      <motion.span
                        className="count"
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {countOf(c)}
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
          <div className="grid">
            {list.map((o, index) => {
              const n = qtyOf(o.id);
              return (
                <motion.div
                  className="pcard cat-card"
                  key={o.id}
                  style={categoryStyle(o.kategori)}
                  {...enterCard(index)}
                  whileHover={{ y: -5, transition: { type: "spring", stiffness: 350, damping: 24 } }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="thumb"><Pill size={30} aria-hidden="true" /></span>
                  <div className="pbody">
                    <div className="ptop"><span className="cat-tag">{o.kategori || "Obat"}</span><strong>{rp(o.harga)}</strong></div>
                    <div className="pname">{o.nama}</div>
                    <span className={o.stok <= 0 ? "badge danger" : o.stok <= LOW_STOCK_LIMIT ? "badge warn" : "badge"}>{o.stok > 0 ? `Stok ${o.stok}` : "Habis"}</span>
                    <div className="pact">
                      <Stepper qty={n} plusOff={n >= o.stok} onMinus={() => step(o.id, -1)} onPlus={() => step(o.id, 1)} />
                      <div className="pact-actions">
                        {n ? (
                          <button className="xb" aria-label={`Hapus ${o.nama}`} onClick={() => remove(o.id)}><X size={16} /></button>
                        ) : (
                          <button className="pb" aria-label={`Tambah ${o.nama}`} disabled={o.stok <= 0} onClick={() => add(o)}><Plus size={18} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {!list.length && <p className="muted">Obat tidak ditemukan.</p>}
          </div>
        </section>
      </main>

      <motion.aside className="panel" id="panel" aria-label="Detail transaksi" {...enterCard()}>
        <div className="phead">
          <h2>Detail Transaksi</h2>
          <button className="link" disabled={!cart.length || busy} onClick={clear}>Batalkan</button>
        </div>
        <div className="osub"><strong>Transaksi baru</strong><span className="muted">{nItem} item</span></div>
        
        <label className="pembeli-input">Nama Pembeli
          <input 
            type="text" 
            placeholder="Nama pembeli (opsional)"
            value={pembeli} 
            onChange={(e) => setPembeli(e.target.value)}
            className="input-pembeli"
          />
        </label>

        <div className={`olist${cart.length ? "" : " olist-empty"}`}>
          {!cart.length && <p className="muted pad">Tambahkan obat dengan tombol + pada daftar.</p>}
          {cart.map((i, index) => (
            <motion.div className="oitem" key={i.id} {...enterCard(index)}>
              <strong className="oitem-name">{i.nama}</strong>
              <span className="oitem-qty">Jumlah {i.qty}</span>
            </motion.div>
          ))}
        </div>

        <div className="pfoot">
          <div className="quick">
            <button className="qbtn" disabled={!total} onClick={() => setBayar(formatGroupedAmount(total))}>Uang pas</button>
            <button className="qbtn" disabled={!total} onClick={() => setBayar(formatGroupedAmount(50000))}>Rp 50.000</button>
            <button className="qbtn" disabled={!total} onClick={() => setBayar(formatGroupedAmount(100000))}>Rp 100.000</button>
          </div>
          <label className="paylabel">Uang diterima
            <AmountInput
              inputMode="numeric"
              value={bayar}
              onChange={setBayar}
              placeholder="Contoh: 150.000"
            />
          </label>
          {bayar !== "" && <p className={kurang ? "error" : "muted"}>{kurang ? `Kurang ${rp(total - bayarN)}` : `Kembalian ${rp(bayarN - total)}`}</p>}
          <div className="totalbar"><strong>Total Pembayaran</strong><strong>{rp(total)}</strong></div>
          {missingHargaModal && <p role="alert" className="error">Isi harga modal obat di menu Stok Obat sebelum menyelesaikan transaksi.</p>}
          <button className="place" disabled={!cart.length || kurang || busy || missingHargaModal} onClick={checkout}>{busy ? "Memproses..." : "Bayar"}</button>
          {msg && <p role="status" className={msg.ok ? "ok" : "error"}>{msg.text}</p>}
        </div>
      </motion.aside>

      {nItem > 0 && <a className="mbar" href="#panel">{nItem} item · {rp(total)} <span>Lihat</span></a>}
    </>
  );
}
