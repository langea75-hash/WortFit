let currentCard=null;
let countdownValue=8;
let countdownHandle=null;
let lastWord="";
let imageRequestId=0;

document.addEventListener("DOMContentLoaded",()=>{
  fillCategories();
  loadSettingsIntoForm();
  applyDarkMode();
  updateHomeProgress();
  if("serviceWorker"in navigator){
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  }
});

function escapeHtml(v){
  return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function fillCategories(){
  const s=document.getElementById("categorySelect");
  [...new Set(cards.map(c=>c.category))].sort().forEach(c=>{
    const o=document.createElement("option");o.value=c;o.textContent=c;s.appendChild(o);
  });
}
function hideAllScreens(){
  document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));
}
function goHome(){
  clearInterval(countdownHandle);hideAllScreens();
  document.getElementById("home").classList.remove("hidden");
  updateHomeProgress();
}
function showSettings(){
  hideAllScreens();document.getElementById("settings").classList.remove("hidden");
}
function saveSettings(){
  saveSettingsToStorage({
    time:document.getElementById("timeSelect").value,
    category:document.getElementById("categorySelect").value,
    dailyGoal:document.getElementById("dailyGoal").value,
    autoSpeak:document.getElementById("autoSpeak").checked,
    favoritesOnly:document.getElementById("favoritesOnly").checked,
    darkMode:document.getElementById("darkMode").checked
  });
  applyDarkMode();goHome();
}
function loadSettingsIntoForm(){
  const s=loadSettings();
  if(s.time)timeSelect.value=s.time;
  if(s.category)categorySelect.value=s.category;
  if(s.dailyGoal)dailyGoal.value=s.dailyGoal;
  if(typeof s.autoSpeak==="boolean")autoSpeak.checked=s.autoSpeak;
  if(typeof s.favoritesOnly==="boolean")favoritesOnly.checked=s.favoritesOnly;
  if(typeof s.darkMode==="boolean")darkMode.checked=s.darkMode;
}
function applyDarkMode(){
  document.body.classList.toggle("dark",document.getElementById("darkMode").checked);
}
function updateHomeProgress(){
  const results=loadResults();
  const today=new Date().toLocaleDateString("de-DE");
  const count=results.filter(r=>r.day===today).length;
  const goal=Number(document.getElementById("dailyGoal").value)||10;
  const percent=Math.min(100,Math.round(count/goal*100));
  document.getElementById("homeProgress").innerHTML=`
    <b>Heute: ${count} von ${goal} Wörtern</b>
    <div class="progress-track"><div class="progress-bar" style="width:${percent}%"></div></div>
  `;
}
function getAvailableCards(){
  let a=[...cards];
  const c=categorySelect.value;
  if(c!=="Alle")a=a.filter(x=>x.category===c);
  if(favoritesOnly.checked){
    const f=new Set(loadFavorites());
    a=a.filter(x=>f.has(x.word));
  }
  return a;
}
function startExercise(){
  hideAllScreens();exercise.classList.remove("hidden");nextCard();
}
async function nextCard(){
  clearInterval(countdownHandle);
  const a=getAvailableCards();
  if(!a.length){alert("Für diese Auswahl sind keine Karten vorhanden.");goHome();return}
  let n=a[Math.floor(Math.random()*a.length)];
  if(a.length>1)while(n.word===lastWord)n=a[Math.floor(Math.random()*a.length)];
  currentCard={...n};lastWord=currentCard.word;
  word.textContent=currentCard.word;
  categoryBadge.textContent=currentCard.category;
  sentence.value="";
  feedback.classList.add("hidden");
  wordBox.classList.add("hidden");
  sentenceBox.classList.add("hidden");
  await loadCommonsImage(currentCard);
  startCountdown();
}
function startCountdown(){
  clearInterval(countdownHandle);
  countdownValue=Number(timeSelect.value)||8;
  timer.textContent=countdownValue;
  countdownHandle=setInterval(()=>{
    countdownValue--;timer.textContent=countdownValue;
    if(countdownValue<=0){
      clearInterval(countdownHandle);timer.textContent="⏰";revealWord();
    }
  },1000);
}
function revealWord(){
  wordBox.classList.remove("hidden");
  sentenceBox.classList.remove("hidden");
  if(autoSpeak.checked)speakWord();
}
function speakWord(){if(currentCard)speakText(currentCard.word,.55)}
async function loadCommonsImage(card){
  const req=++imageRequestId;
  image.removeAttribute("src");
  image.style.visibility="hidden";
  imageLoading.classList.remove("hidden");
  try{
    const u=new URL("https://commons.wikimedia.org/w/api.php");
    u.searchParams.set("origin","*");
    u.searchParams.set("action","query");
    u.searchParams.set("generator","search");
    u.searchParams.set("gsrsearch",card.search||card.word);
    u.searchParams.set("gsrnamespace","6");
    u.searchParams.set("gsrlimit","12");
    u.searchParams.set("prop","imageinfo");
    u.searchParams.set("iiprop","url|extmetadata");
    u.searchParams.set("iiurlwidth","800");
    u.searchParams.set("format","json");
    const r=await fetch(u);
    const j=await r.json();
    if(req!==imageRequestId)return;
    const pages=Object.values(j.query?.pages||{});
    const candidates=pages.map(p=>p.imageinfo?.[0]).filter(Boolean).filter(i=>{
      const x=(i.thumburl||i.url||"").toLowerCase();
      return /\.(jpe?g|png|webp)(\?|$)/.test(x);
    });
    if(!candidates.length)throw new Error();
    const info=candidates[0],meta=info.extmetadata||{};
    currentCard.image=info.thumburl||info.url;
    currentCard.source=info.descriptionurl||"";
    currentCard.author=stripHtml(meta.Artist?.value||"Wikimedia Commons");
    currentCard.license=stripHtml(meta.LicenseShortName?.value||"Lizenz prüfen");
    saveCredit(currentCard);
    image.onload=()=>{imageLoading.classList.add("hidden");image.style.visibility="visible"};
    image.onerror=()=>showFallbackImage(card.word);
    image.src=currentCard.image;image.alt=card.word;
  }catch{showFallbackImage(card.word)}
}
function stripHtml(v){const d=document.createElement("div");d.innerHTML=v;return d.textContent||""}
function showFallbackImage(w){
  const safe=String(w).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#eef2ff"/><text x="50%" y="42%" text-anchor="middle" font-size="92">🧠</text><text x="50%" y="62%" text-anchor="middle" font-family="Arial" font-size="54" font-weight="bold" fill="#312e81">${safe}</text></svg>`;
  currentCard.image="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
  currentCard.source="";currentCard.author="WortFit Ersatzgrafik";currentCard.license="Eigene Grafik";
  image.src=currentCard.image;image.alt=w;image.style.visibility="visible";imageLoading.classList.add("hidden");
}
function saveCredit(c){
  if(!c.source)return;
  const x=loadCredits();
  x[c.word]={word:c.word,source:c.source,author:c.author,license:c.license};
  saveCredits(x);
}
function saveResult(){
  if(!currentCard)return;
  const s=sentence.value.trim(),now=new Date(),r=loadResults();
  r.push({date:now.toLocaleString("de-DE"),day:now.toLocaleDateString("de-DE"),word:currentCard.word,category:currentCard.category,sentence:s,sentenceDone:s.length>0});
  saveResults(r);setFeedback("✅ Fortschritt gespeichert.");updateHomeProgress();
}
function setFeedback(m){feedback.textContent=m;feedback.classList.remove("hidden")}
function toggleFavorite(){
  if(!currentCard)return;
  let f=loadFavorites();
  if(f.includes(currentCard.word)){f=f.filter(x=>x!==currentCard.word);setFeedback("⭐ Favorit entfernt.");}
  else{f.push(currentCard.word);setFeedback("⭐ Favorit gespeichert.");}
  saveFavorites(f);
}
function showFavorites(){
  hideAllScreens();favorites.classList.remove("hidden");
  const f=loadFavorites();
  favoritesText.innerHTML=f.length?f.sort((a,b)=>a.localeCompare(b,"de")).map(w=>`<div class="list-item">⭐ ${escapeHtml(w)}</div>`).join(""):"<p>Noch keine Favoriten gespeichert.</p>";
}
function showStats(){
  hideAllScreens();stats.classList.remove("hidden");
  statsText.innerHTML=buildStatsHtml(loadResults());
}
function clearStats(){if(confirm("Statistik wirklich löschen?")){saveResults([]);showStats();updateHomeProgress();}}
function showCredits(){
  hideAllScreens();credits.classList.remove("hidden");
  const x=Object.values(loadCredits());
  creditsText.innerHTML=x.length?x.sort((a,b)=>a.word.localeCompare(b.word,"de")).map(i=>`<div class="credit-item"><b>${escapeHtml(i.word)}</b><br>Urheber: ${escapeHtml(i.author)}<br>Lizenz: ${escapeHtml(i.license)}<br><a href="${escapeHtml(i.source)}" target="_blank" rel="noopener">Wikimedia Commons öffnen</a></div>`).join(""):"<p>Noch keine Bildnachweise gespeichert.</p>";
}
