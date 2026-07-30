const API_BASE = "http://localhost:8000/api/v1";

const CATEGORY_1_GENRE = "Mystery";
const CATEGORY_2_GENRE = "Comedy";

// Traduction des genres affichés dans le menu "Autres" (l'API renvoie les
// noms en anglais, la maquette les affiche en français).
const GENRE_LABELS_FR = {
  "Action": "Films d'action",
  "Adventure": "Aventure",
  "Animation": "Animation",
  "Biography": "Biographie",
  "Comedy": "Comédies",
  "Crime": "Policier",
  "Documentary": "Documentaire",
  "Drama": "Drame",
  "Family": "Famille",
  "Fantasy": "Films de fantasy",
  "History": "Histoire",
  "Horror": "Films d'horreur",
  "Music": "Musique",
  "Musical": "Comédie musicale",
  "Mystery": "Mystère",
  "Romance": "Romance",
  "Sci-Fi": "Science-fiction",
  "Science Fiction": "Science-fiction",
  "Sport": "Sport",
  "Thriller": "Thriller",
  "War": "Guerre",
  "Western": "Westerns"
};

// Couleur de fond utilisée pour le visuel de secours, selon le genre
// principal du film. Sert de repère visuel quand l'API renvoie une image
// invalide ou indisponible.
const GENRE_PLACEHOLDER_COLORS = {
  "Action": "#c0392b",
  "Adventure": "#d35400",
  "Animation": "#16a085",
  "Biography": "#8e44ad",
  "Comedy": "#f39c12",
  "Crime": "#2c3e50",
  "Documentary": "#7f8c8d",
  "Drama": "#34495e",
  "Family": "#27ae60",
  "Fantasy": "#8e44ad",
  "History": "#795548",
  "Horror": "#1a1a1a",
  "Music": "#e91e63",
  "Musical": "#e91e63",
  "Mystery": "#2c3e50",
  "Romance": "#c2185b",
  "Sci-Fi": "#16a085",
  "Science Fiction": "#16a085",
  "Sport": "#2980b9",
  "Thriller": "#1a1a1a",
  "War": "#4d4d4d",
  "Western": "#a0522d"
};

// Champs de la modale à réinitialiser à chaque ouverture, pour ne jamais
// laisser les infos d'un film précédent affichées pendant/après un échec.
const MODAL_FIELD_IDS = [
  "modal-date", "modal-genre", "modal-rating", "modal-duration",
  "modal-country", "modal-score", "modal-director", "modal-actors",
  "modal-boxoffice", "modal-summary"
];

const $ = (selector) => document.querySelector(selector);

function pick(object, ...keys) {
  for (const key of keys) {
    if (object?.[key]) {
      return object[key];
    }
  }
  return null;
}

function translateGenre(genre) {
  return GENRE_LABELS_FR[genre] || genre;
}

function mainGenre(movie) {
  const genres = movie?.genres;

  if (Array.isArray(genres) && genres.length) {
    return genres[0];
  }

  return typeof genres === "string" ? genres : null;
}

// Échappe le texte injecté dans un template innerHTML (titres venant de
// l'API), pour éviter qu'un caractère spécial ne casse le balisage.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Génère une affiche de secours en SVG (aucune requête réseau), teintée
// selon le genre et affichant le titre du film. Utilisée quand l'URL
// fournie par l'API est manquante ou cassée.
function placeholderPoster(title, genre) {
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

function formatMoney(value) {
  if (!value) return "Non communiqué";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function formatYear(value) {
  if (!value) return null;

  const date = value.match(/^(\d{4})/);
  return date ? date[1] : value;
}

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error : ${response.status}`);
  }

  return response.json();
}

async function fetchMovies(genre = null, limit = 6) {
  const params = new URLSearchParams({
    sort_by: "-imdb_score",
    page_size: limit
  });

  if (genre) {
    params.append("genre", genre);
  }

  const data = await fetchJSON(`${API_BASE}/titles/?${params}`);
  return (data.results ?? data).slice(0, limit);
}

async function fetchMovieDetail(id) {
  return fetchJSON(`${API_BASE}/titles/${id}`);
}

async function fetchGenres() {
  const data = await fetchJSON(`${API_BASE}/genres/?page_size=100`);

  return (data.results ?? data)
    .map(genre => genre.name)
    .filter(Boolean)
    .sort();
}

// ==========================================================================
// CARTES FILMS
// Conforme à la maquette : uniquement l'affiche avec un bouton "Détails"
// en incrustation, pas de bandeau de titre séparé.
// ==========================================================================

function createMovieCard(movie) {
  const id = movie.id;
  const title = movie.title || "Titre inconnu";
  const genre = mainGenre(movie);

  const item = document.createElement("li");
  item.className = "movie-card";

  item.innerHTML = `
    <button class="movie-card__btn" type="button" data-id="${id}">
      <span class="movie-card__header">
        <span class="movie-card__title">${escapeHtml(title)}</span>
        <span class="movie-card__cta">Détails</span>
      </span>
      <img
        class="movie-card__poster"
        src="${movie.image_url || ""}"
        alt="Affiche du film ${escapeHtml(title)}"
        loading="lazy"
      >
    </button>
  `;

  const poster = item.querySelector(".movie-card__poster");

  poster.onerror = () => {
    poster.onerror = null;
    poster.src = placeholderPoster(title, genre);
  };

  if (!movie.image_url) {
    poster.src = placeholderPoster(title, genre);
  }

  item.querySelector("button").addEventListener("click", () => openModal(id));

  return item;
}

function renderMovies(grid, movies) {
  grid.replaceChildren(...movies.map(createMovieCard));
  grid.classList.remove("is-expanded");

  const button = grid.nextElementSibling;

  if (button?.classList.contains("btn--see-more")) {
    button.textContent = "Voir plus";

    // En dessous de 3 films, aucun palier (mobile/tablette/desktop) ne
    // masque quoi que ce soit : le bouton n'a alors aucune utilité.
    button.style.display = movies.length <= 2 ? "none" : "";
  }
}

// Affiche un message d'erreur à la place d'une grille de films et masque
// le bouton "Voir plus" associé, plutôt que de laisser la grille vide.
function renderGridError(grid) {
  const item = document.createElement("li");
  item.className = "movie-grid__error";
  item.textContent = "Impossible de charger ces films pour le moment.";
  grid.replaceChildren(item);

  const button = grid.nextElementSibling;
  if (button?.classList.contains("btn--see-more")) {
    button.style.display = "none";
  }
}

function getGrid(titleId) {
  return $(`#${titleId}`).closest(".movie-row").querySelector(".movie-grid");
}

// Remplit la section "Meilleur film" à partir de la fiche détaillée
// du film déjà récupéré par loadHeroAndTopRated.
async function renderHero(movieId) {
  const detail = await fetchMovieDetail(movieId);

  $("#hero-title").textContent = detail.title;
  $(".hero__summary").textContent = pick(detail, "long_description", "description") || "";

  const heroImage = $(".hero__image");
  const genre = mainGenre(detail);
  const fallback = placeholderPoster(detail.title, genre);

  heroImage.onerror = () => {
    heroImage.onerror = null;
    heroImage.src = fallback;
  };

  heroImage.src = detail.image_url || fallback;
  heroImage.alt = `Affiche du film ${detail.title}`;

  const button = $(".hero .btn--primary");
  button.dataset.id = detail.id;
  button.onclick = () => openModal(detail.id);
}

// Un seul appel API triée par note IMDB sert à la fois de "meilleur film"
// (le premier résultat) et de liste "Films les mieux notés" (le reste) :
// deux appels séparés pourraient renvoyer un ordre différent en cas d'ex
// æquo et désynchroniser les deux sections.
async function loadHeroAndTopRated() {
  const grid = getGrid("top-rated-title");

  try {
    const movies = await fetchMovies(null, 7);
    const [best, ...topRated] = movies;

    if (!best) return;

    await renderHero(best.id);
    renderMovies(grid, topRated);

  } catch (error) {
    console.error(error);
    renderGridError(grid);
  }
}

async function loadCategory(genre, titleId) {
  const grid = getGrid(titleId);

  try {
    const movies = await fetchMovies(genre);
    renderMovies(grid, movies);

  } catch (error) {
    console.error(error);
    renderGridError(grid);
  }
}

async function loadOtherCategory(genre) {
  const grid = $("#other-category-grid");

  try {
    const movies = await fetchMovies(genre);
    renderMovies(grid, movies);

  } catch (error) {
    console.error(error);
    renderGridError(grid);
  }
}

// ==========================================================================
// MODALE
// ==========================================================================

// Élément qui avait le focus avant l'ouverture de la modale, pour le lui
// rendre à la fermeture (accessibilité clavier).
let lastFocusedElement = null;

function setModalValue(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value || "Non renseigné";
  }
}

function getFocusableModalElements() {
  return Array.from(
    $("#movie-modal").querySelectorAll(
      'a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
    )
  );
}

// Garde le focus clavier à l'intérieur de la modale tant qu'elle est ouverte.
function trapModalFocus(event) {
  if (event.key !== "Tab") return;

  const focusable = getFocusableModalElements();
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

async function openModal(movieId) {
  const modal = $("#movie-modal");

  lastFocusedElement = document.activeElement;

  setModalValue("modal-title", "Chargement...");
  MODAL_FIELD_IDS.forEach(id => setModalValue(id, ""));

  modal.hidden = false;
  $(".modal__close").focus();

  try {
    const movie = await fetchMovieDetail(movieId);

    setModalValue("modal-title", movie.title);

    const poster = $("#modal-poster");
    const posterFallback = placeholderPoster(movie.title, mainGenre(movie));

    poster.onerror = () => {
      poster.onerror = null;
      poster.src = posterFallback;
    };

    poster.src = movie.image_url || posterFallback;
    poster.alt = `Affiche du film ${movie.title}`;

    setModalValue("modal-date", formatYear(movie.date_published));

    setModalValue(
      "modal-genre",
      Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres
    );

    setModalValue("modal-rating", movie.rated);

    setModalValue(
      "modal-duration",
      movie.duration ? `${movie.duration} minutes` : null
    );

    setModalValue(
      "modal-country",
      Array.isArray(movie.countries) ? movie.countries.join(", ") : movie.countries
    );

    setModalValue(
      "modal-score",
      movie.imdb_score ? `${movie.imdb_score}/10` : null
    );

    setModalValue(
      "modal-director",
      Array.isArray(movie.directors) ? movie.directors.join(", ") : movie.directors
    );

    setModalValue(
      "modal-actors",
      Array.isArray(movie.actors) ? movie.actors.join(", ") : movie.actors
    );

    setModalValue("modal-boxoffice", formatMoney(movie.worldwide_gross_income));

    setModalValue("modal-summary", pick(movie, "long_description", "description"));

  } catch (error) {
    console.error(error);
    setModalValue("modal-title", "Erreur");
    setModalValue("modal-summary", "Impossible de charger les détails de ce film.");
  }
}

function closeModal() {
  $("#movie-modal").hidden = true;
  lastFocusedElement?.focus();
}

function initModal() {
  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.onclick = closeModal;
  });

  document.addEventListener("keydown", event => {
    if ($("#movie-modal").hidden) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    trapModalFocus(event);
  });
}

function initSeeMore() {
  document.querySelectorAll(".btn--see-more").forEach(button => {
    const grid = button.previousElementSibling;

    button.onclick = () => {
      const expanded = grid.classList.toggle("is-expanded");
      button.textContent = expanded ? "Voir moins" : "Voir plus";
    };
  });
}

async function initCategories() {
  const select = $("#category-select");

  try {
    const genres = await fetchGenres();

    select.replaceChildren(
      ...genres.map(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = translateGenre(genre);
        return option;
      })
    );

    select.onchange = () => loadOtherCategory(select.value);

    if (genres.length) {
      loadOtherCategory(genres[0]);
    }

  } catch (error) {
    console.error(error);

    select.replaceChildren(new Option("Erreur de chargement", ""));
    renderGridError($("#other-category-grid"));
  }
}

function init() {
  loadHeroAndTopRated();
  loadCategory(CATEGORY_1_GENRE, "cat1-title");
  loadCategory(CATEGORY_2_GENRE, "cat2-title");

  initSeeMore();
  initModal();
  initCategories();
}

document.addEventListener("DOMContentLoaded", init);
