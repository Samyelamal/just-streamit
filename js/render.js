import { $, pick, mainGenre, escapeHtml, placeholderPoster } from "./utils.js";
import { fetchMovies, fetchMovieDetail } from "./api.js";
import { openModal } from "./modal.js";

// ==========================================================================
// CARTES FILMS
// Conforme à la maquette : uniquement l'affiche avec un bouton "Détails"
// en incrustation, pas de bandeau de titre séparé.
// ==========================================================================

export function createMovieCard(movie) {
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

export function renderMovies(grid, movies) {
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
export function renderGridError(grid) {
  const item = document.createElement("li");
  item.className = "movie-grid__error";
  item.textContent = "Impossible de charger ces films pour le moment.";
  grid.replaceChildren(item);

  const button = grid.nextElementSibling;
  if (button?.classList.contains("btn--see-more")) {
    button.style.display = "none";
  }
}

export function getGrid(titleId) {
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
export async function loadHeroAndTopRated() {
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

export async function loadCategory(genre, titleId) {
  const grid = getGrid(titleId);

  try {
    const movies = await fetchMovies(genre);
    renderMovies(grid, movies);

  } catch (error) {
    console.error(error);
    renderGridError(grid);
  }
}

export async function loadOtherCategory(genre) {
  const grid = $("#other-category-grid");

  try {
    const movies = await fetchMovies(genre);
    renderMovies(grid, movies);

  } catch (error) {
    console.error(error);
    renderGridError(grid);
  }
}
