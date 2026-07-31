export const API_BASE = "http://localhost:8000/api/v1";

export const CATEGORY_1_GENRE = "Mystery";
export const CATEGORY_2_GENRE = "Comedy";

// Traduction des genres affichés dans le menu "Autres" (l'API renvoie les
// noms en anglais, la maquette les affiche en français).
export const GENRE_LABELS_FR = {
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
export const GENRE_PLACEHOLDER_COLORS = {
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
export const MODAL_FIELD_IDS = [
  "modal-date", "modal-genre", "modal-rating", "modal-duration",
  "modal-country", "modal-score", "modal-director", "modal-actors",
  "modal-boxoffice", "modal-summary"
];
