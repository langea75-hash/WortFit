const K={s:"wf60_settings",r:"wf60_results",f:"wf60_favorites"};
function readJson(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
function loadSettingsData(){return readJson(K.s,{})}
function saveSettingsData(v){writeJson(K.s,v)}
function loadResults(){return readJson(K.r,[])}
function saveResults(v){writeJson(K.r,v)}
function loadFavoritesData(){return readJson(K.f,[])}
function saveFavoritesData(v){writeJson(K.f,v)}
