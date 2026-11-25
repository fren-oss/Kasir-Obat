export const rp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
export const today = () => new Date().toISOString().slice(0, 10);

export const formatGroupedAmountInput = (value) => {
  const raw = String(value ?? "").replace(/[^\d.,]/g, "");
  const decimalIndex = raw.lastIndexOf(",");
  const integerPart = (decimalIndex < 0 ? raw : raw.slice(0, decimalIndex))
    .replace(/[.,]/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (decimalIndex < 0) return integerPart;
  const fractionPart = raw.slice(decimalIndex + 1).replace(/[.,]/g, "");
  return `${integerPart},${fractionPart}`;
};

export const parseGroupedAmount = (value) => {
  if (value === "" || value == null) return NaN;
  return Number(String(value).replace(/\./g, "").replace(",", "."));
};

export const formatGroupedAmount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 20 }).format(
    number,
  );
};

// Warna kategori dibuat berbeda dan cukup kuat untuk mudah dibedakan.
const CATEGORY_TONES = {
  "nyeri & demam": { base: "#D93A43", deep: "#9E1F27", soft: "#FCE7E8", line: "#F0B2B6" },
  "batuk & flu": { base: "#2F6FED", deep: "#1C4FA8", soft: "#E4ECFE", line: "#A9C2F8" },
  "maag & pencernaan": { base: "#B45309", deep: "#823B04", soft: "#FDEDDC", line: "#EFC79C" },
  vitamin: { base: "#4F8000", deep: "#355900", soft: "#EDF6D3", line: "#C4DC8C" },
  "luka & kulit": { base: "#0B7A6E", deep: "#06554C", soft: "#DDF3EF", line: "#9BD8CE" },
  herbal: { base: "#247047", deep: "#175130", soft: "#E2F2E7", line: "#A7D6B8" },
  "alat kesehatan": { base: "#6C4BD8", deep: "#4C2FA5", soft: "#EBE5FB", line: "#C6B5F0" },
};

export const DEFAULT_CATEGORIES = [
  "Nyeri & Demam",
  "Batuk & Flu",
  "Maag & Pencernaan",
  "Vitamin",
  "Luka & Kulit",
  "Herbal",
  "Alat Kesehatan",
];

export const medicineCategories = (medicines = []) => {
  const categories = [...DEFAULT_CATEGORIES];
  const seen = new Set(categories.map((category) => category.toLowerCase()));

  medicines.forEach((medicine) => {
    const category = String(medicine?.kategori || "").trim();
    const key = category.toLowerCase();
    if (category && !seen.has(key)) {
      categories.push(category);
      seen.add(key);
    }
  });

  return categories;
};

export function categoryTone(kategori = "") {
  const key = String(kategori).trim().toLowerCase();
  if (CATEGORY_TONES[key]) return CATEGORY_TONES[key];

  // Kategori baru tetap mendapat warna yang jelas, bukan pastel pudar.
  const h = [...key].reduce((a, c) => a + c.charCodeAt(0) * 13, 0) % 360;
  return {
    base: `hsl(${h} 68% 42%)`,
    deep: `hsl(${h} 75% 24%)`,
    soft: `hsl(${h} 62% 93%)`,
    line: `hsl(${h} 55% 78%)`,
  };
}

export const categoryStyle = (kategori) => {
  const { base, deep, soft, line } = categoryTone(kategori);
  return {
    "--cat": base,
    "--cat-deep": deep,
    "--cat-soft": soft,
    "--cat-line": line,
  };
};
