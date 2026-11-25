import { motion } from "framer-motion";
import { categoryStyle, rp } from "../lib";
import { enterCard } from "../motion";

const LOW_STOCK_LIMIT = 15;

export default function Stok({ data }) {
  const rows = data.obat;

  return (
    <motion.div className="scroll card" {...enterCard()}>
      <table>
        <thead><tr><th>Nama</th><th>Kategori</th><th>Harga jual</th><th>Harga modal</th><th>Stok</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r) => {
            return (
              <tr key={r.id}>
                <td>{r.nama}</td><td><span className="cat-tag" style={categoryStyle(r.kategori)}>{r.kategori || "Obat"}</span></td><td>{rp(r.harga)}</td><td>{r.hargaModal === "" || r.hargaModal == null ? "Belum diisi" : rp(r.hargaModal)}</td><td>{r.stok}</td>
                <td>
                  {r.stok <= 0 ? <span className="badge danger">Habis</span> : r.stok <= LOW_STOCK_LIMIT ? <span className="badge warn">Menipis</span> : null}
                </td>
              </tr>
            );
          })}
          {!rows.length && <tr><td colSpan="6" className="muted">Belum ada data obat.</td></tr>}
        </tbody>
      </table>
    </motion.div>
  );
}
