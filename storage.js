const STORAGE_KEYS={
  settings:"wortfit61_settings",
  results:"wortfit61_results",
  favorites:"wortfit61_favorites"
};
function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}
}
function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function loadSettingsData(){return readJson(STORAGE_KEYS.settings,{})}
function saveSettingsData(value){writeJson(STORAGE_KEYS.settings,value)}
function loadResults(){return readJson(STORAGE_KEYS.results,[])}
function saveResults(value){writeJson(STORAGE_KEYS.results,value)}
function loadFavoritesData(){return readJson(STORAGE_KEYS.favorites,[])}
function saveFavoritesData(value){writeJson(STORAGE_KEYS.favorites,value)}
