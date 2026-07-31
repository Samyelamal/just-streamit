import { GENRE_LABELS_FR, GENRE_PLACEHOLDER_COLORS } from "./config.js";

export const $ = (selector) => document.querySelector(selector);

export function pick(object, ...keys) {
  for (const key of keys) {
    if (object?.[key]) {
      return object[key];
    }
  }
  return null;
}

// Recherche insensible à la casse/aux espaces : l'API renvoie parfois les
// noms de genre avec une casse différente de celle codée en dur ci-dessus.
const GENRE_LABELS_FR_NORMALIZED = Object.fromEntries(
  Object.entries(GENRE_LABELS_FR).map(([key, value]) => [key.trim().toLowerCase(), value])
);

export function translateGenre(genre) {
  if (!genre) return genre;
  return GENRE_LABELS_FR_NORMALIZED[genre.trim().toLowerCase()] || genre;
}

export function mainGenre(movie) {
  const genres = movie?.genres;

  if (Array.isArray(genres) && genres.length) {
    return genres[0];
  }

  return typeof genres === "string" ? genres : null;
}

// Échappe le texte injecté dans un template innerHTML (titres venant de
// l'API), pour éviter qu'un caractère spécial ne casse le balisage.
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Génère une affiche de secours en SVG (aucune requête réseau), teintée
// selon le genre et affichant le titre du film. Utilisée quand l'URL
// fournie par l'API est manquante ou cassée.
export function placeholderPoster(title, genre) {
  const color = GENRE_PLACEHOLDER_COLORS[genre] || "#7f8c8d";
  const label = (title || genre || "Film").toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
      <rect width="300" height="450" fill="${color}"/>
      <text
        x="150" y="225"
        fill="#ffffff"
        font-family="Arial, sans-serif"
        font-size="20"
        font-weight="bold"
        text-anchor="middle"
        dominant-baseline="middle"
      >${escapeHtml(label)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function formatMoney(value) {
  if (!value) return "Non communiqué";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

export function formatYear(value) {
  if (!value) return null;

  const date = value.match(/^(\d{4})/);
  return date ? date[1] : value;
}
