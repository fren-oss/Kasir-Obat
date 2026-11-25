import { lazy, Suspense, useCallback, useEffect, useRef, useState, Component } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutGrid,
  LogOut,
  PackageCheck,
  Pill,
  Receipt,
  Search,
  ShoppingCart,
} from "lucide-react";
import { call, session } from "./api";
import { enterCard } from "./motion";
const Kasir = lazy(() => import("./pages/Kasir"));
const Pembelian = lazy(() => import("./pages/Pembelian"));
const Stok = lazy(() => import("./pages/Stok"));
const Riwayat = lazy(() => import("./pages/Riwayat"));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error untuk debugging di production (akan dihapus oleh terser)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="main stack">
          <section className="card" role="alert">
            <h2>Terjadi kesalahan saat memuat</h2>
            <p className="error">{String(this.state.error?.message || "Kesalahan tidak diketahui")}</p>
            <button className="btn primary" onClick={() => window.location.reload()}>
              Muat ulang halaman
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

const TABS = [
  { id: "kasir", label: "Kasir", icon: LayoutGrid, view: Kasir },
  { id: "stok", label: "Stok Obat", icon: Pill, view: Stok },
  {
    id: "pembelian",
    label: "Belanja Obat",
    icon: ShoppingCart,
    view: Pembelian,
  },
  { id: "riwayat", label: "Riwayat", icon: Receipt, view: Riwayat },
];
const LOW_STOCK_LIMIT = 15;

const localDayKey = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

function Login({ onLogin }) {
  const [kasir, setKasir] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  const loginRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const tips = [
    {
      title: "Transaksi tercatat rapi",
      description: "Buka riwayat untuk meninjau penjualan sebelumnya.",
    },
    {
      title: "Stok mudah dipantau",
      description: "Periksa ketersediaan obat dari halaman stok.",
    },
    {
      title: "Pembelian lebih teratur",
      description: "Catat obat masuk agar persediaan selalu terbarui.",
    },
  ];

  useEffect(() => {
    let cancelled = false;
    let cleanup;

    import("gsap")
      .then(({ default: gsap }) => {
        if (cancelled) return;
        const media = gsap.matchMedia();
        const context = gsap.context(() => {
          media.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.fromTo(
              ".login-word",
              { y: 10, opacity: 0, filter: "blur(4px)" },
              {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.42,
                stagger: 0.018,
                delay: 0.08,
                ease: "power2.out",
              },
            );
            gsap.fromTo(
              ".login-brand-mark, .login-access-icon, .login-input-wrap, .login-tip-controls, .login-help, .login-security, .login-submit, .login-marquee",
              { y: 18, scale: 0.97, opacity: 0 },
              {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.48,
                stagger: 0.075,
                delay: 0.16,
                ease: "power3.out",
              },
            );
            gsap.fromTo(
              ".login-visual-art",
              { scale: 0.8, opacity: 0.2 },
              { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" },
            );
            gsap.fromTo(
              ".login-float-card",
              { y: 22, scale: 0.92, opacity: 0 },
              {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.65,
                stagger: 0.12,
                delay: 0.16,
                ease: "power3.out",
              },
            );
          });
        }, loginRef);
        cleanup = () => {
          media.revert();
          context.revert();
        };
      })
      .catch((error) => {
        if (!cancelled) console.error("Login animations failed to load:", error);
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      session.set({ kasir, pass });
      await call("login");
      session.set({ kasir, pass, loginDay: localDayKey() });
      onLogin();
    } catch (err) {
      session.clear();
      setError(
        err.message === "Failed to fetch"
          ? "Tidak dapat terhubung ke server."
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login" ref={loginRef}>
      <div className="login-layout">
        <aside className="login-story">
          <div className="login-brand">
            <span className="login-brand-mark">
              <Pill size={20} aria-hidden="true" />
            </span>
            <span className="login-brand-copy">
              <LoginText as="strong">Obatku</LoginText>
              <LoginText as="span">Kasir By Fren</LoginText>
            </span>
          </div>

          <div className="login-story-copy">
            <LoginText as="p" className="login-kicker">
              Operasional Kasir, lebih tertata
            </LoginText>
            <LoginText as="h1">Sistem teratur, Kerja Jadi Rapih.</LoginText>
            <LoginText as="p">
              Kelola transaksi, persediaan, dan pembelian dalam satu ruang kerja
              yang ringkas.
            </LoginText>
          </div>

          <div className="login-visual" aria-hidden="true">
            <div className="login-visual-glow" />
            <div className="login-visual-orbit login-visual-orbit-one" />
            <div className="login-visual-orbit login-visual-orbit-two" />
            <div className="login-visual-art">
              <div className="login-art-top">
                <LoginText as="span">OBATKU</LoginText>
                <span className="login-art-live" />
              </div>
              <LoginText as="div" className="login-art-title">
                Ringkasan kasir
              </LoginText>
              <div className="login-art-row">
                <span className="login-art-symbol">
                  <Receipt size={15} />
                </span>
                <span className="login-art-line login-art-line-long" />
                <span className="login-art-value" />
              </div>
              <div className="login-art-row">
                <span className="login-art-symbol login-art-symbol-lav">
                  <PackageCheck size={15} />
                </span>
                <span className="login-art-line" />
                <span className="login-art-value login-art-value-short" />
              </div>
              <div className="login-art-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="login-float-card login-float-card-stock">
              <span className="login-float-icon">
                <PackageCheck size={16} />
              </span>
              <span>
                <LoginText as="strong">Stok obat</LoginText>
                <LoginText as="small">Terpantau</LoginText>
              </span>
            </div>
            <div className="login-float-card login-float-card-sales">
              <span className="login-float-icon login-float-icon-purple">
                <Receipt size={16} />
              </span>
              <span>
                <LoginText as="strong">Penjualan</LoginText>
                <LoginText as="small">Tercatat rapi</LoginText>
              </span>
            </div>
          </div>

          <div className="login-tip" aria-live="polite">
            <motion.div
              className="login-tip-copy"
              key={activeTip}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.22 }}
            >
              <LoginText as="strong">{tips[activeTip].title}</LoginText>
              <LoginText as="span">{tips[activeTip].description}</LoginText>
            </motion.div>
            <div className="login-tip-controls">
              <button
                type="button"
                aria-label="Tips sebelumnya"
                onClick={() =>
                  setActiveTip((activeTip - 1 + tips.length) % tips.length)
                }
              >
                <ChevronLeft size={17} />
              </button>
              <span>
                {activeTip + 1} / {tips.length}
              </span>
              <button
                type="button"
                aria-label="Tips berikutnya"
                onClick={() => setActiveTip((activeTip + 1) % tips.length)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="login-marquee" aria-hidden="true">
            <div className="login-marquee-track">
              {[0, 1].map((copy) => (
                <div className="login-marquee-group" key={copy}>
                  <LoginText as="span">Kasir</LoginText>
                  <i />
                  <LoginText as="span">Stok obat</LoginText>
                  <i />
                  <LoginText as="span">Pembelian</LoginText>
                  <i />
                  <LoginText as="span">Riwayat</LoginText>
                  <i />
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="login-access">
          <div className="login-access-heading">
            <span className="login-access-icon">
              <Pill size={18} aria-hidden="true" />
            </span>
            <LoginText as="span">Area kasir</LoginText>
          </div>
          <div className="login-form-heading">
            <LoginText as="h2">Selamat datang kembali</LoginText>
            <LoginText as="p">
              Masuk dengan akun kasir Anda untuk melanjutkan.
            </LoginText>
          </div>

          <motion.form
            className="login-form"
            onSubmit={submit}
            {...enterCard()}
          >
            <LoginText as="label" htmlFor="login-kasir">
              Nama kasir
            </LoginText>
            <div className="login-input-wrap">
              <input
                id="login-kasir"
                name="username"
                autoComplete="username"
                placeholder="Masukkan nama kasir"
                required
                value={kasir}
                onChange={(e) => setKasir(e.target.value)}
              />
            </div>

            <div className="login-password-label">
              <LoginText as="label" htmlFor="login-password">
                Kata sandi
              </LoginText>
            </div>
            <div className="login-input-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                aria-describedby={error ? "login-err" : undefined}
              />
              <button
                className="login-reveal"
                type="button"
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p id="login-err" className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="btn primary login-submit" disabled={busy}>
              <LoginText as="span">
                {busy ? "Memproses..." : "Masuk ke kasir"}
              </LoginText>
              {!busy && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </motion.form>

          <p className="login-security">
            <span className="login-security-dot" />
            <LoginText as="span">Akses khusus untuk kasir apotek</LoginText>
          </p>
        </section>
      </div>
    </main>
  );
}

function LoginText({ as: Element = "span", children, ...props }) {
  const text = String(children).trim();
  return (
    <Element {...props} aria-label={text}>
      {text.split(/\s+/).map((word, index) => (
        <span
          className="login-word"
          aria-hidden="true"
          key={`${word}-${index}`}
        >
          {word}
        </span>
      ))}
    </Element>
  );
}

function SplashScreen({ reducedMotion }) {
  return (
    <motion.main
      className="splash-screen"
      role="status"
      aria-label="Menyiapkan Apotek"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
    >
      <div className="splash-stack">
        <motion.div
          className="splash-lockup"
          initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
        >
          <span className="splash-mark">
            <Pill size={28} aria-hidden="true" />
          </span>
          <span className="splash-name">Obatku</span>
        </motion.div>
        <div className="splash-loading">
          <span className="splash-caption">Menyiapkan kasir</span>
          <span className="splash-track" aria-hidden="true">
            <motion.span
              animate={
                reducedMotion ? { scaleX: 0.65 } : { scaleX: [0.25, 1, 0.25] }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              }
            />
          </span>
        </div>
      </div>
    </motion.main>
  );
}

export default function App() {
  const [logged, setLogged] = useState(() => {
    const savedSession = session.get();
    return Boolean(
      savedSession?.kasir &&
      savedSession?.pass &&
      savedSession.loginDay === localDayKey(),
    );
  });
  const reduceMotion = useReducedMotion();
  const [splashMinimumElapsed, setSplashMinimumElapsed] = useState(false);
  const [tab, setTab] = useState("kasir");
  const [q, setQ] = useState("");
  const [data, setData] = useState({ obat: [], penjualan: [], pembelian: [] });
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashMinimumElapsed(true), 400); // Kurangi dari 800ms ke 400ms
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedSession = session.get();
    if (savedSession && savedSession.loginDay !== localDayKey()) {
      session.clear();
    }
  }, []);

  const reload = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setLoadErr("");
      let d;
      
      // Kurangi timeout dari 10s ke 8s untuk feedback lebih cepat
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      for (let attempt = 0; ; attempt += 1) {
        try {
          d = await call("list", null, { signal: controller.signal });
          clearTimeout(timeoutId);
          break;
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('Koneksi timeout. Server terlalu lama merespons.');
          }
          // Hanya 2 retry (total 3 attempts) untuk lebih cepat
          if (!(error instanceof TypeError) || attempt >= 1) {
            clearTimeout(timeoutId);
            throw error;
          }
          await new Promise((resolve) =>
            setTimeout(resolve, 500 * (attempt + 1)), // Kurangi delay antar retry
          );
        }
      }
      
      if (
        !d ||
        !Array.isArray(d.obat) ||
        !Array.isArray(d.penjualan) ||
        !Array.isArray(d.pembelian)
      ) {
        throw new Error("Format data tidak valid dari server.");
      }
      
      // Sortir hanya sekali
      d.obat.sort((a, b) =>
        String(a?.nama || "").localeCompare(String(b?.nama || "")),
      );
      
      // Proses penjualan lebih efisien
      const penjualan = d.penjualan.map((transaksi) => {
        let items = transaksi?.items;
        let itemsError = Boolean(transaksi?.itemsError);
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch {
            itemsError = true;
          }
        }
        if (items && !Array.isArray(items) && typeof items === "object") {
          if (Array.isArray(items.items)) {
            items = items.items;
          } else if (items.nama && items.qty !== undefined) {
            items = [items];
          }
        }
        if (!Array.isArray(items)) {
          items = [];
          itemsError = true;
        }
        const validItems = items.filter(
          (item) => item && typeof item === "object",
        );
        if (validItems.length !== items.length) itemsError = true;
        return { ...transaksi, items: validItems, itemsError };
      });
      
      setData({ ...d, penjualan });
      setHasLoaded(true);
    } catch (e) {
      const message =
        e instanceof TypeError && e.message === "Failed to fetch"
          ? "Tidak dapat terhubung ke server. Periksa koneksi internet, lalu coba lagi."
          : e.message;
      setLoadErr("Tidak dapat memuat data: " + message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!logged) {
      setLoading(false);
      return;
    }
    reload(true);
    const t = setInterval(() => reload(), 30000);
    return () => clearInterval(t);
  }, [logged, reload]);

  useEffect(() => {
    if (!logged) return;

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") reload();
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [logged, reload]);

  const showSplash = !splashMinimumElapsed;
  const splashOverlay = (
    <AnimatePresence>
      {showSplash && <SplashScreen key="splash" reducedMotion={reduceMotion} />}
    </AnimatePresence>
  );

  if (!logged) {
    return (
      <>
        <Login onLogin={() => setLogged(true)} />
        {splashOverlay}
      </>
    );
  }

  const nama = session.get()?.kasir || "Kasir";
  const alerts = data.obat.filter((o) => o.stok <= LOW_STOCK_LIMIT).length;
  const isKasir = tab === "kasir";
  const View = TABS.find((t) => t.id === tab)?.view;

  if (!View) {
    return (
      <>
        <main className="main">
          <p role="alert">Menu tidak ditemukan.</p>
        </main>
        {splashOverlay}
      </>
    );
  }

  return (
    <>
      <div className={`frame${isKasir ? "" : " solo"}`}>
        <header className="topnav">
          <h1 className="sr">Kasir ObatKu</h1>
          <div className="logo">
            <span className="mark">
              <Pill size={18} aria-hidden="true" />
            </span>
            <strong>ObatKu</strong>
          </div>
          <nav className="navgroup" aria-label="Menu utama">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className="npill"
                aria-label={label}
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id)}
              >
                {tab === id && (
                  <motion.span
                    className="nav-indicator"
                    layoutId="active-nav-indicator"
                    aria-hidden="true"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 440, damping: 36 }
                    }
                  />
                )}
                <Icon size={18} aria-hidden="true" /> <span>{label}</span>
              </button>
            ))}
          </nav>
          {isKasir ? (
            <label className="nsearch">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Cari obat"
                aria-label="Cari obat"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
          ) : (
            <span className="grow" />
          )}
          {loadErr && (
            <span className="neterr" role="alert">
              {loadErr}
            </span>
          )}
          <button
            className="nbtn"
            aria-label={`${alerts} peringatan stok`}
            onClick={() => setTab("stok")}
          >
            <Bell size={18} aria-hidden="true" />
            {alerts > 0 && <span className="dot">{alerts}</span>}
          </button>
          <div className="nuser">
            <span className="nname">{nama}</span>
            <span className="avatar" aria-hidden="true">
              {nama[0]?.toUpperCase()}
            </span>
          </div>
          <button
            className="nbtn"
            aria-label="Keluar"
            onClick={() => {
              session.clear();
              setLogged(false);
            }}
          >
            <LogOut size={18} />
          </button>
        </header>

        {loading ? (
          <main className="main stack">
            <section className="card" role="status">
              <h2>Memuat data kasir</h2>
              <p className="muted">Mengambil data stok dan transaksi terbaru.</p>
            </section>
          </main>
        ) : loadErr && !hasLoaded ? (
          <main className="main stack">
            <motion.section className="card" role="alert" {...enterCard()}>
              <h2>Data belum dapat dimuat</h2>
              <p className="error">{loadErr}</p>
              <button className="btn primary" onClick={() => reload(true)}>
                Coba lagi
              </button>
            </motion.section>
          </main>
        ) : (
          <ErrorBoundary>
            <Suspense
              fallback={
                <main className="main stack" role="status">
                  <p className="muted">Memuat halaman...</p>
                </main>
              }
            >
              {isKasir ? (
                <View data={data} reload={reload} q={q} go={setTab} />
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.main
                    key={tab}
                    className="main stack"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.18,
                      ease: "easeInOut",
                    }}
                  >
                    <View data={data} reload={reload} />
                  </motion.main>
                </AnimatePresence>
              )}
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
      {splashOverlay}
    </>
  );
}
