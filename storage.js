const K={s:"wf80s",r:"wf80r",f:"wf80f"};
function rd(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function wr(k,v){localStorage.setItem(k,JSON.stringify(v))}
function loadSettingsData(){return rd(K.s,{})}
function saveSettingsData(v){wr(K.s,v)}
function loadResults(){return rd(K.r,[])}
function saveResults(v){wr(K.r,v)}
function loadFavoritesData(){return rd(K.f,[])}
function saveFavoritesData(v){wr(K.f,v)}
