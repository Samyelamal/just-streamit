import { API_BASE } from "./config.js";

export async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error : ${response.status}`);
  }

  return response.json();
}

export async function fetchMovies(genre = null, limit = 6) {
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

export async function fetchMovieDetail(id) {
  return fetchJSON(`${API_BASE}/titles/${id}`);
}

export async function fetchGenres() {
  const data = await fetchJSON(`${API_BASE}/genres/?page_size=100`);

  return (data.results ?? data)
    .map(genre => genre.name)
    .filter(Boolean)
    .sort();
}
