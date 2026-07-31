import { CATEGORY_1_GENRE, CATEGORY_2_GENRE } from "./config.js";
import { $, translateGenre } from "./utils.js";
import { fetchGenres } from "./api.js";
import {
  loadHeroAndTopRated,
  loadCategory,
  loadOtherCategory,
  renderGridError
} from "./render.js";
import { initModal } from "./modal.js";

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
