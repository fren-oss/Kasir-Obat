import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  DollarSign,
  Pill,
  Receipt,
  Search,
  TrendingUp,
} from "lucide-react";
import { rp } from "../lib";
import { enterCard } from "../motion";

const amountOf = (row) => Number(row.total) || 0;

export default function Riwayat({ data }) {
  const rows = (data.penjualan || []).filter(
    (row) =>
      row.id &&
      row.waktu &&
      !Number.isNaN(new Date(row.waktu).getTime()),
  );
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [selectedDayKey, setSelectedDayKey] = useState(null);
  const today = new Date();
  const todayKey = today.toDateString();
  const todayRows = rows.filter(
    (row) => new Date(row.waktu).toDateString() === todayKey,
  );
  const todayTotal = todayRows.reduce((sum, row) => sum + amountOf(row), 0);
  const average = todayRows.length ? todayTotal / todayRows.length : 0;
  const calculatedBestSeller = useMemo(() => {
    const products = new Map();
    rows.forEach((row) => {
      (row.items || []).forEach((item) => {
        const name = String(item.nama || "").trim();
        if (!name) return;
        const key = item.id
          ? `id:${item.id}`
          : `name:${name.toLocaleLowerCase()}`;
        const product = products.get(key) || {
          id: item.id || "",
          name,
          units: 0,
          transactions: 0,
        };
        product.units += Number(item.qty) || 0;
        product.transactions += 1;
        products.set(key, product);
      });
    });
    return (
      [...products.values()].sort(
        (a, b) => b.units - a.units || b.transactions - a.transactions,
      )[0] || null
    );
  }, [rows]);
  const bestSeller = data.bestSeller || calculatedBestSeller;

  const week = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const key = date.toDateString();
      const total = rows
        .filter((row) => new Date(row.waktu).toDateString() === key)
        .reduce((sum, row) => sum + amountOf(row), 0);
      return {
        key,
        label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(
          date,
        ),
        date: new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
        }).format(date),
        total,
      };
    });
    return { dates, max: Math.max(...dates.map((day) => day.total), 1) };
  }, [rows]);

  const bestSellerTrend = useMemo(
    () =>
      week.dates.map((day, index) => {
        if (Array.isArray(data.bestSeller?.weeklyUnits)) {
          return {
            ...day,
            units: Number(data.bestSeller.weeklyUnits[index]) || 0,
          };
        }
        const units = rows
          .filter((row) => new Date(row.waktu).toDateString() === day.key)
          .reduce(
            (sum, row) =>
              sum +
              (row.items || [])
                .filter(
                  (item) =>
                    bestSeller &&
                    (bestSeller.id
                      ? item.id === bestSeller.id
                      : String(item.nama || "").toLocaleLowerCase() ===
                        bestSeller.name.toLocaleLowerCase()),
                )
                .reduce(
                  (itemSum, item) => itemSum + (Number(item.qty) || 0),
                  0,
                ),
            0,
          );
        return { ...day, units };
      }),
    [bestSeller, data.bestSeller, rows, week.dates],
  );
  const bestSellerTrendMax = Math.max(
    ...bestSellerTrend.map((day) => day.units),
    1,
  );

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    if (period === "week") cutoff.setDate(cutoff.getDate() - 6);

    return rows.filter((row) => {
      const date = new Date(row.waktu);
      if (selectedDayKey) {
        if (date.toDateString() !== selectedDayKey) return false;
      } else {
        if (period === "today" && date.toDateString() !== todayKey) return false;
        if (
          period === "week" &&
          (Number.isNaN(date.getTime()) || date < cutoff)
        )
          return false;
      }
      if (!term) return true;
      const details = (row.items || []).map((item) => item.nama).join(" ");
      return [row.id, row.kasir, row.pembeli, details].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      );
    });
  }, [rows, query, period, selectedDayKey, todayKey]);

  const tanggal = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  return (
    <div className="history-page">
      <header className="history-heading">
        <h2>Riwayat Transaksi</h2>
        <span className="history-date">
          <CalendarDays size={16} aria-hidden="true" />
          {tanggal}
        </span>
      </header>

      <motion.section 
        className="history-stats" 
        aria-label="Ringkasan penjualan"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.article
          className="history-stat history-stat-accent"
          {...enterCard(0)}
        >
          <span className="history-stat-icon">
            <DollarSign size={19} aria-hidden="true" />
          </span>
          <span className="history-stat-label">Penjualan hari ini</span>
          <strong>{rp(todayTotal)}</strong>
          <span className="history-stat-foot">Total omzet hari ini</span>
        </motion.article>
        <motion.article className="history-stat" {...enterCard(1)}>
          <span className="history-stat-icon">
            <Receipt size={19} aria-hidden="true" />
          </span>
          <span className="history-stat-label">Transaksi hari ini</span>
          <strong>{todayRows.length}</strong>
          <span className="history-stat-foot">Transaksi tercatat hari ini</span>
        </motion.article>
        <motion.article className="history-stat" {...enterCard(2)}>
          <span className="history-stat-icon">
            <TrendingUp size={19} aria-hidden="true" />
          </span>
          <span className="history-stat-label">Rata-rata transaksi</span>
          <strong>{rp(average)}</strong>
          <span className="history-stat-foot">Nilai rata-rata hari ini</span>
        </motion.article>
        <motion.article className="history-stat" {...enterCard(3)}>
          <span className="history-stat-icon">
            <DollarSign size={19} aria-hidden="true" />
          </span>
          <span className="history-stat-label">Total keuntungan</span>
          <strong>{rp(Number(data.totalProfit) || 0)}</strong>
          <span className="history-stat-foot">
            Laba kotor dari transaksi dengan modal tercatat
          </span>
        </motion.article>
      </motion.section>

      <div className="history-layout">
        <div className="history-side">
          <motion.section
            className="card history-chart"
            aria-labelledby="history-chart-title"
            {...enterCard(0)}
          >
            <div className="history-panel-heading">
              <div>
                <h3 id="history-chart-title">Penjualan 7 hari</h3>
                <p className="muted">
                  Klik batang untuk melihat transaksi per tanggal
                </p>
              </div>
              <span className="history-chart-mark">
                <TrendingUp size={18} aria-hidden="true" />
              </span>
            </div>
            <div
              className="week-chart"
              role="group"
              aria-label="Grafik penjualan tujuh hari terakhir. Pilih tanggal untuk melihat transaksi."
            >
              {week.dates.map((day, index) => {
                const height = day.total
                  ? Math.max((day.total / week.max) * 100, 8)
                  : 0;
                return (
                  <button
                    className={`week-day${selectedDayKey === day.key ? " is-selected" : ""}`}
                    key={day.key}
                    type="button"
                    aria-label={`${day.date}, ${rp(day.total)}. Tampilkan transaksi tanggal ini`}
                    aria-pressed={selectedDayKey === day.key}
                    title={`${day.date}: ${rp(day.total)}`}
                    onClick={() => {
                      setPeriod("all");
                      setSelectedDayKey((current) =>
                        current === day.key ? null : day.key,
                      );
                    }}
                  >
                    <div className="week-track">
                      <div
                        className="week-bar"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="week-day-label">{day.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="history-chart-foot">
              <span>7 hari terakhir</span>
              <strong>
                {rp(week.dates.reduce((sum, day) => sum + day.total, 0))}
              </strong>
            </div>
          </motion.section>
          <motion.article
            className="history-stat history-stat-product"
            {...enterCard(1)}
          >
            <span className="history-stat-icon">
              <Pill size={19} aria-hidden="true" />
            </span>
            <span className="history-stat-label">
              Obat paling sering dibeli
            </span>
            <strong title={bestSeller?.name}>
              {bestSeller?.name || "Belum ada data"}
            </strong>
            <span className="history-stat-foot">
              {bestSeller
                ? `${bestSeller.units} unit · ${bestSeller.transactions} transaksi · ${data.bestSeller ? "semua riwayat" : "50 transaksi terbaru"}`
                : "Belum ada rincian obat"}
            </span>
            <div
              className="best-seller-chart"
              role="img"
              aria-label={`Tren tujuh hari penjualan ${bestSeller?.name || "obat"}`}
            >
              {bestSellerTrend.map((day, index) => (
                <div
                  className="best-seller-day"
                  key={day.key}
                  title={`${day.date}: ${day.units} unit`}
                >
                  <span className="best-seller-track">
                    <span
                      className={
                        day.units ? "best-seller-bar" : "best-seller-bar empty"
                      }
                      style={{
                        height: `${day.units ? Math.max((day.units / bestSellerTrendMax) * 100, 12) : 5}%`,
                      }}
                    />
                  </span>
                  <span className="best-seller-day-label">{day.label}</span>
                </div>
              ))}
            </div>
            <span className="best-seller-chart-label">
              Unit terjual · 7 hari
            </span>
          </motion.article>
        </div>

          <motion.section
            key={selectedDayKey || period}
            className="card history-activity"
            aria-labelledby="history-activity-title"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="history-activity-heading">
              <div>
                <h3 id="history-activity-title">Aktivitas terbaru</h3>
                <p className="muted">
                  {visibleRows.length} transaksi ditampilkan
                  {selectedDayKey &&
                    ` pada ${week.dates.find((day) => day.key === selectedDayKey)?.date}`}
                </p>
              </div>
              <label className="history-search">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Cari transaksi"
                  aria-label="Cari transaksi"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="history-filter">
                <span className="sr">Filter periode</span>
                <select
                  value={period}
                  onChange={(event) => {
                    setPeriod(event.target.value);
                    setSelectedDayKey(null);
                  }}
                >
                  <option value="all">Semua waktu</option>
                  <option value="today">Hari ini</option>
                  <option value="week">7 hari terakhir</option>
                </select>
              </label>
            </div>
            <div className="scroll history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID Transaksi</th>
                    <th>Aktivitas</th>
                    <th>Pembeli / Kasir</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const detail = row.itemsError
                      ? "Rincian lama tidak tersedia"
                      : row.items
                          .map((item) => `${item.nama} x${item.qty}`)
                          .join(", ") || "Transaksi obat";
                    return (
                      <tr key={row.id}>
                        <td>
                          <span className="history-id">
                            #{String(row.id).slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="history-detail">{detail}</td>
                        <td>
                          <strong>{row.pembeli || "Umum"}</strong>
                          <span className="history-subcell">
                            {row.kasir || "-"}
                          </span>
                        </td>
                        <td>
                          {new Date(row.waktu).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          <span className="history-status">
                            <i />
                            Selesai
                          </span>
                        </td>
                        <td className="history-total">{rp(row.total)}</td>
                      </tr>
                    );
                  })}
                  {!visibleRows.length && (
                    <tr>
                      <td colSpan="6" className="history-empty">
                        Tidak ada transaksi yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
      </div>
    </div>
  );
}
