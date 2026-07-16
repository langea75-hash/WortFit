const STORAGE_RESULTS="wortfit_fixed_results";
const STORAGE_SETTINGS="wortfit_fixed_settings";

let currentCard=null;
let interval=null;
let lastWord="";

document.addEventListener("DOMContentLoaded",()=>{
  fillCategories();
  loadSettings();
});

function fillCategories(){
  const select=document.getElementById("categorySelect");
  [...new Set(cards.map(card=>card.category))].sort().forEach(category=>{
    const option=document.createElement("option");
    option.value=category;
    option.textContent=category;
    select.appendChild(option);
  });
}

function hideScreens(){
  document.querySelectorAll(".screen").forEach(screen=>screen.classList.add("hidden"));
}

function goHome(){
  clearInterval(interval);
  hideScreens();
  document.getElementById("home").classList.remove("hidden");
}

function showSettings(){
  hideScreens();
  document.getElementById("settings").classList.remove("hidden");
}

function saveSettings(){
  const settings={
    time:document.getElementById("timeSelect").value,
    category:document.getElementById("categorySelect").value,
    autoSpeak:document.getElementById("autoSpeak").checked
  };
  localStorage.setItem(STORAGE_SETTINGS,JSON.stringify(settings));
  goHome();
}

function loadSettings(){
  try{
    const settings=JSON.parse(localStorage.getItem(STORAGE_SETTINGS)||"{}");
    if(settings.time)document.getElementById("timeSelect").value=settings.time;
    if(settings.category)document.getElementById("categorySelect").value=settings.category;
    if(typeof settings.autoSpeak==="boolean"){
      document.getElementById("autoSpeak").checked=settings.autoSpeak;
    }
  }catch{}
}

function startExercise(){
  hideScreens();
  document.getElementById("exercise").classList.remove("hidden");
  nextCard();
}

function getCards(){
  const category=document.getElementById("categorySelect").value;
  return category==="Alle"?cards:cards.filter(card=>card.category===category);
}

function nextCard(){
  clearInterval(interval);
  const available=getCards();

  let next=available[Math.floor(Math.random()*available.length)];
  if(available.length>1){
    while(next.word===lastWord){
      next=available[Math.floor(Math.random()*available.length)];
    }
  }

  currentCard=next;
  lastWord=next.word;

  document.getElementById("categoryBadge").textContent=next.category;
  document.getElementById("emojiImage").textContent=next.emoji;
  document.getElementById("wordText").textContent=next.word;
  document.getElementById("syllablesText").textContent=next.syllables;
  document.getElementById("exampleSentence").textContent="Beispiel: "+next.example;
  document.getElementById("sentenceInput").value="";
  document.getElementById("feedback").classList.add("hidden");
  document.getElementById("wordArea").classList.add("hidden");
  document.getElementById("sentenceArea").classList.add("hidden");

  startTimer();
}

function startTimer(){
  let seconds=Number(document.getElementById("timeSelect").value)||8;
  const timer=document.getElementById("timer");
  timer.textContent=seconds;

  interval=setInterval(()=>{
    seconds-=1;
    timer.textContent=seconds;

    if(seconds<=0){
      clearInterval(interval);
      timer.textContent="⏰";
      showWord();
    }
  },1000);
}

function showWord(){
  document.getElementById("wordArea").classList.remove("hidden");
  document.getElementById("sentenceArea").classList.remove("hidden");

  if(document.getElementById("autoSpeak").checked){
    speakWord();
  }
}

function speakWord(){
  if(!currentCard||!("speechSynthesis"in window))return;

  const utterance=new SpeechSynthesisUtterance(currentCard.word);
  utterance.lang="de-DE";
  utterance.rate=.55;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function startSpeechRecognition(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;

  if(!Recognition){
    alert("Spracheingabe wird von diesem Browser nicht unterstützt.");
    return;
  }

  const recognition=new Recognition();
  recognition.lang="de-DE";

  recognition.onresult=event=>{
    document.getElementById("sentenceInput").value=event.results[0][0].transcript;
    showFeedback("✅ Satz erkannt.");
  };

  recognition.onerror=()=>showFeedback("Spracheingabe hat nicht funktioniert.");
  showFeedback("🎤 Ich höre zu ...");
  recognition.start();
}

function saveResult(){
  if(!currentCard)return;

  const sentence=document.getElementById("sentenceInput").value.trim();
  const results=JSON.parse(localStorage.getItem(STORAGE_RESULTS)||"[]");

  results.push({
    word:currentCard.word,
    category:currentCard.category,
    sentence,
    date:new Date().toLocaleString("de-DE")
  });

  localStorage.setItem(STORAGE_RESULTS,JSON.stringify(results));
  showFeedback("✅ Fortschritt gespeichert.");
}

function showFeedback(message){
  const feedback=document.getElementById("feedback");
  feedback.textContent=message;
  feedback.classList.remove("hidden");
}

function showStats(){
  hideScreens();
  document.getElementById("stats").classList.remove("hidden");

  const results=JSON.parse(localStorage.getItem(STORAGE_RESULTS)||"[]");
  const target=document.getElementById("statsContent");

  if(!results.length){
    target.innerHTML="<p>Noch keine Übungen gespeichert.</p>";
    return;
  }

  let html=`<div class="stat-box"><b>Übungen insgesamt:</b> ${results.length}</div>`;
  html+="<h3>Letzte Übungen</h3>";

  results.slice(-10).reverse().forEach(result=>{
    html+=`<div class="stat-box"><b>${result.word}</b> · ${result.category}<br>${result.date}<br>${result.sentence||"Kein Satz"}</div>`;
  });

  target.innerHTML=html;
}

function clearStats(){
  if(confirm("Statistik wirklich löschen?")){
    localStorage.removeItem(STORAGE_RESULTS);
    showStats();
  }
}
