let currentCard=null;
let timerHandle=null;
let countdown=8;
let cardQueue=[];
let queueIndex=0;

const byId=id=>document.getElementById(id);

document.addEventListener("DOMContentLoaded",()=>{
  fillCategories();
  loadSettingsIntoForm();
  updateHomeProgress();
});

function escapeHtml(value){
  return String(value??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function fillCategories(){
  const select=byId("categorySelect");
  [...new Set(cards.map(card=>card.category))]
    .sort((a,b)=>a.localeCompare(b,"de"))
    .forEach(category=>select.add(new Option(category,category)));
}

function hideScreens(){
  document.querySelectorAll(".screen").forEach(screen=>screen.classList.add("hidden"));
}

function goHome(){
  clearInterval(timerHandle);
  hideScreens();
  byId("home").classList.remove("hidden");
  updateHomeProgress();
}

function showSettings(){
  hideScreens();
  byId("settings").classList.remove("hidden");
}

function saveSettings(){
  saveSettingsData({
    time:byId("timeSelect").value,
    category:byId("categorySelect").value,
    dailyGoal:byId("dailyGoal").value,
    speechRate:byId("speechRate").value,
    autoSpeak:byId("autoSpeak").checked,
    favoritesOnly:byId("favoritesOnly").checked
  });
  cardQueue=[];
  goHome();
}

function loadSettingsIntoForm(){
  const settings=loadSettingsData();
  if(settings.time)byId("timeSelect").value=settings.time;
  if(settings.category)byId("categorySelect").value=settings.category;
  if(settings.dailyGoal)byId("dailyGoal").value=settings.dailyGoal;
  if(settings.speechRate)byId("speechRate").value=settings.speechRate;
  if(typeof settings.autoSpeak==="boolean")byId("autoSpeak").checked=settings.autoSpeak;
  if(typeof settings.favoritesOnly==="boolean")byId("favoritesOnly").checked=settings.favoritesOnly;
}

function getAvailableCards(){
  let list=[...cards];
  const category=byId("categorySelect").value;
  if(category!=="Alle")list=list.filter(card=>card.category===category);
  if(byId("favoritesOnly").checked){
    const favorites=new Set(loadFavoritesData());
    list=list.filter(card=>favorites.has(card.word));
  }
  return list;
}

function shuffle(list){
  const copy=[...list];
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

function startExercise(){
  hideScreens();
  byId("exercise").classList.remove("hidden");
  cardQueue=[];
  queueIndex=0;
  nextCard();
}

function nextCard(){
  clearInterval(timerHandle);
  if(!cardQueue.length||queueIndex>=cardQueue.length){
    cardQueue=shuffle(getAvailableCards());
    queueIndex=0;
  }
  if(!cardQueue.length){
    alert("Für diese Auswahl sind keine Wörter vorhanden.");
    goHome();
    return;
  }

  currentCard=cardQueue[queueIndex++];
  const badge=byId("categoryBadge");
  badge.textContent=currentCard.category;
  badge.dataset.category=currentCard.category;

  byId("wordImage").src=currentCard.image;
  byId("wordImage").alt="Bild für die Wortfindung";
  byId("wordText").textContent=currentCard.word;
  byId("syllablesText").textContent=currentCard.syllables;
  byId("exampleText").textContent="Beispiel: "+currentCard.example;
  byId("sentenceInput").value="";

  byId("feedback").classList.add("hidden");
  byId("exampleText").classList.add("hidden");
  byId("exampleButton").classList.remove("hidden");
  byId("wordArea").classList.add("hidden");
  byId("sentenceArea").classList.add("hidden");

  updateFavoriteButton();
  startTimer();
}

function startTimer(){
  countdown=Number(byId("timeSelect").value)||8;
  byId("timer").textContent=countdown;
  timerHandle=setInterval(()=>{
    countdown-=1;
    byId("timer").textContent=countdown;
    if(countdown<=0){
      clearInterval(timerHandle);
      byId("timer").textContent="⏰";
      revealWord();
    }
  },1000);
}

function revealWord(){
  byId("wordArea").classList.remove("hidden");
  byId("sentenceArea").classList.remove("hidden");
  if(byId("autoSpeak").checked)speakWord();
}

function speakWord(){
  if(!currentCard)return;
  const rate=Number(byId("speechRate").value)||.55;
  speakText(currentCard.word,rate);
}

function showExample(){
  byId("exampleText").classList.remove("hidden");
  byId("exampleButton").classList.add("hidden");
}

function saveResult(){
  if(!currentCard)return;
  const sentence=byId("sentenceInput").value.trim();
  const now=new Date();
  const results=loadResults();
  results.push({
    word:currentCard.word,
    category:currentCard.category,
    sentence,
    sentenceDone:Boolean(sentence),
    date:now.toLocaleString("de-DE"),
    day:now.toLocaleDateString("de-DE")
  });
  saveResults(results);
  setFeedback("✅ Fortschritt gespeichert.");
  updateHomeProgress();
}

function toggleFavorite(){
  if(!currentCard)return;
  let favorites=loadFavoritesData();
  if(favorites.includes(currentCard.word)){
    favorites=favorites.filter(word=>word!==currentCard.word);
    setFeedback("☆ Favorit entfernt.");
  }else{
    favorites.push(currentCard.word);
    setFeedback("⭐ Favorit gespeichert.");
  }
  saveFavoritesData(favorites);
  updateFavoriteButton();
}

function updateFavoriteButton(){
  if(!currentCard)return;
  const isFavorite=loadFavoritesData().includes(currentCard.word);
  byId("favoriteButton").textContent=isFavorite?"⭐ Favorit gespeichert":"☆ Favorit";
}

function setFeedback(message){
  const feedback=byId("feedback");
  feedback.textContent=message;
  feedback.classList.remove("hidden");
}

function updateHomeProgress(){
  const results=loadResults();
  const today=new Date().toLocaleDateString("de-DE");
  const count=results.filter(item=>item.day===today).length;
  const goal=Number(byId("dailyGoal").value)||10;
  const percent=Math.min(100,Math.round(count/goal*100));
  byId("homeProgress").innerHTML=`<b>Heute: ${count} von ${goal} Wörtern</b>
    <div class="progress-track"><div class="progress-bar" style="width:${percent}%"></div></div>`;
}

function showStats(){
  hideScreens();
  byId("stats").classList.remove("hidden");
  byId("statsContent").innerHTML=buildStatsHtml(loadResults());
}

function clearStats(){
  if(confirm("Statistik wirklich löschen?")){
    saveResults([]);
    showStats();
    updateHomeProgress();
  }
}

function showFavorites(){
  hideScreens();
  byId("favorites").classList.remove("hidden");
  const favorites=loadFavoritesData();
  byId("favoritesContent").innerHTML=favorites.length
    ? favorites.sort((a,b)=>a.localeCompare(b,"de"))
      .map(word=>`<div class="list-item">⭐ ${escapeHtml(word)}</div>`).join("")
    : "<p>Noch keine Favoriten gespeichert.</p>";
}
