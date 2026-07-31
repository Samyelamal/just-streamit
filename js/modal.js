import { MODAL_FIELD_IDS } from "./config.js";
import { $, pick, mainGenre, placeholderPoster, formatMoney, formatYear } from "./utils.js";
import { fetchMovieDetail } from "./api.js";

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

export async function openModal(movieId) {
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

export function closeModal() {
  $("#movie-modal").hidden = true;
  lastFocusedElement?.focus();
}

export function initModal() {
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
