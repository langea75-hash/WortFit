let currentCard=null,timerHandle=null,lastEvaluation=null,lastWord="";
document.addEventListener("DOMContentLoaded",()=>{fillCategories();loadSettingsIntoForm();updateHomeProgress()});
function escapeHtml(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function hideScreens(){document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"))}
function fillCategories(){[...new Set(cards.map(c=>c.category))].sort().forEach(c=>categorySelect.add(new Option(c,c)))}
function goHome(){clearInterval(timerHandle);hideScreens();home.classList.remove("hidden");updateHomeProgress()}
function showSettings(){hideScreens();settings.classList.remove("hidden")}
function saveSettings(){saveSettingsData({time:timeSelect.value,category:categorySelect.value,difficulty:difficultySelect.value,dailyGoal:dailyGoal.value,autoSpeak:autoSpeak.checked,favoritesOnly:favoritesOnly.checked});goHome()}
function loadSettingsIntoForm(){const s=loadSettingsData();if(s.time)timeSelect.value=s.time;if(s.category)categorySelect.value=s.category;if(s.difficulty)difficultySelect.value=s.difficulty;if(s.dailyGoal)dailyGoal.value=s.dailyGoal;if(typeof s.autoSpeak==="boolean")autoSpeak.checked=s.autoSpeak;if(typeof s.favoritesOnly==="boolean")favoritesOnly.checked=s.favoritesOnly}
function available(){let a=[...cards];if(categorySelect.value!=="Alle")a=a.filter(c=>c.category===categorySelect.value);if(favoritesOnly.checked){const f=new Set(loadFavoritesData());a=a.filter(c=>f.has(c.word))}return a}
function startExercise(){hideScreens();exercise.classList.remove("hidden");nextCard()}
function nextCard(){
 clearInterval(timerHandle);const a=available();if(!a.length){alert("Keine Wörter vorhanden.");goHome();return}
 let n=a[Math.floor(Math.random()*a.length)];if(a.length>1)while(n.word===lastWord)n=a[Math.floor(Math.random()*a.length)];
 currentCard=n;lastWord=n.word;lastEvaluation=null;
 categoryBadge.textContent=n.category;wordImage.src=n.image;wordText.textContent=n.word;syllablesText.textContent=n.syllables;exampleText.textContent="Beispiel: "+getExample(n);
 sentenceInput.value="";wordArea.classList.add("hidden");sentenceArea.classList.add("hidden");exampleText.classList.add("hidden");exampleButton.classList.remove("hidden");aiResult.classList.add("hidden");sentenceBlocks.classList.add("hidden");sentenceBlocks.innerHTML="";feedback.classList.add("hidden");
 updateFavoriteButton();startTimer();
}
function startTimer(){
 let t=Number(timeSelect.value)||8;timer.textContent=t;
 timerHandle=setInterval(()=>{t--;timer.textContent=t;if(t<=0){clearInterval(timerHandle);timer.textContent="⏰";wordArea.classList.remove("hidden");sentenceArea.classList.remove("hidden");if(autoSpeak.checked)speakWord()}},1000)
}
function speakWord(){if(currentCard)speakText(currentCard.word,.55)}
function showExample(){exampleText.classList.remove("hidden");exampleButton.classList.add("hidden")}
function evaluateCurrentSentence(){
 if(!currentCard)return;
 lastEvaluation=evaluateSentence(currentCard,sentenceInput.value.trim(),difficultySelect.value);
 aiStatus.textContent=lastEvaluation.status;aiMessage.textContent=lastEvaluation.message;aiChecks.innerHTML=[`${lastEvaluation.checks.target?"✅":"⬜"} Zielwort gefunden`,`${lastEvaluation.checks.verb?"✅":"⬜"} Verb vorhanden`,`${lastEvaluation.checks.length?"✅":"⬜"} Satzlänge passt`,`${lastEvaluation.checks.understood?"✅":"⬜"} Satz verständlich`].map(x=>`<div>${x}</div>`).join("");aiSuggestion.textContent="Vorschlag: "+lastEvaluation.suggestion;
 aiResult.classList.remove("hidden");speakSuggestionButton.classList.remove("hidden");
}
function speakSuggestion(){if(lastEvaluation)speakText(lastEvaluation.suggestion,.55)}
function saveResult(){
 if(!currentCard)return;
 const s=sentenceInput.value.trim();if(!lastEvaluation&&s)lastEvaluation=evaluateSentence(currentCard,s,difficultySelect.value);
 const now=new Date(),r=loadResults();
 r.push({word:currentCard.word,category:currentCard.category,sentence:s,evaluationStatus:lastEvaluation?.status||"",date:now.toLocaleString("de-DE"),day:now.toLocaleDateString("de-DE")});
 saveResults(r);setFeedback("✅ Fortschritt gespeichert.");updateHomeProgress();
}
function toggleFavorite(){let f=loadFavoritesData();if(f.includes(currentCard.word))f=f.filter(w=>w!==currentCard.word);else f.push(currentCard.word);saveFavoritesData(f);updateFavoriteButton()}
function updateFavoriteButton(){favoriteButton.textContent=loadFavoritesData().includes(currentCard.word)?"⭐ Favorit gespeichert":"☆ Favorit"}
function setFeedback(m){feedback.textContent=m;feedback.classList.remove("hidden")}
function updateHomeProgress(){const r=loadResults(),today=new Date().toLocaleDateString("de-DE"),c=r.filter(x=>x.day===today).length,g=Number(dailyGoal.value)||10;homeProgress.innerHTML=`Heute: <b>${c} von ${g}</b>`}
function showStats(){hideScreens();stats.classList.remove("hidden");statsContent.innerHTML=buildStatsHtml(loadResults())}
function clearStats(){if(confirm("Statistik löschen?")){saveResults([]);showStats()}}
function showFavorites(){hideScreens();favorites.classList.remove("hidden");const f=loadFavoritesData();favoritesContent.innerHTML=f.length?f.map(w=>`<div class="list-item">⭐ ${escapeHtml(w)}</div>`).join(""):"<p>Noch keine Favoriten.</p>"}

function showSentenceBlocks(){if(!currentCard)return;const blocks=buildSentenceBlocks(currentCard);sentenceBlocks.innerHTML=blocks.map((b,i)=>`<span class="sentence-chip" data-i="${i}">${escapeHtml(b)}</span>`).join("");sentenceBlocks.classList.remove("hidden");sentenceBlocks.querySelectorAll(".sentence-chip").forEach((el,i)=>el.onclick=()=>insertSentenceBlock(blocks[i]))}
function insertSentenceBlock(b){sentenceInput.value=(sentenceInput.value.trim()+" "+b).trim();sentenceInput.focus()}
