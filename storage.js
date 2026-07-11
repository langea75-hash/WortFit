const STORAGE_KEYS={
  results:"wortfit21_results",
  settings:"wortfit21_settings",
  favorites:"wortfit21_favorites",
  credits:"wortfit21_credits"
};
function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}
}
function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function loadResults(){return readJson(STORAGE_KEYS.results,[])}
function saveResults(v){writeJson(STORAGE_KEYS.results,v)}
function loadSettings(){return readJson(STORAGE_KEYS.settings,{})}
function saveSettingsToStorage(v){writeJson(STORAGE_KEYS.settings,v)}
function loadFavorites(){return readJson(STORAGE_KEYS.favorites,[])}
function saveFavorites(v){writeJson(STORAGE_KEYS.favorites,v)}
function loadCredits(){return readJson(STORAGE_KEYS.credits,{})}
function saveCredits(v){writeJson(STORAGE_KEYS.credits,v)}
