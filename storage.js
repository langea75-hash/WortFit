const STORAGE = {
  settings: "wortfit4_settings",
  results: "wortfit4_results",
  favorites: "wortfit4_favorites"
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadSettingsData() {
  return readJson(STORAGE.settings, {});
}

function saveSettingsData(value) {
  writeJson(STORAGE.settings, value);
}

function loadResults() {
  return readJson(STORAGE.results, []);
}

function saveResults(value) {
  writeJson(STORAGE.results, value);
}

function loadFavoritesData() {
  return readJson(STORAGE.favorites, []);
}

function saveFavoritesData(value) {
  writeJson(STORAGE.favorites, value);
}
