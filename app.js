let currentCard = null;
let timerHandle = null;
let countdown = 8;
let lastWord = "";

document.addEventListener("DOMContentLoaded", () => {
  fillCategories();
  loadSettingsIntoForm();
  applyDarkMode();
  updateHomeProgress();
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fillCategories() {
  const select = document.getElementById("categorySelect");

  [...new Set(cards.map(card => card.category))]
    .sort((a, b) => a.localeCompare(b, "de"))
    .forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
}

function hideScreens() {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });
}

function goHome() {
  clearInterval(timerHandle);
  hideScreens();
  document.getElementById("home").classList.remove("hidden");
  updateHomeProgress();
}

function showSettings() {
  hideScreens();
  document.getElementById("settings").classList.remove("hidden");
}

function saveSettings() {
  saveSettingsData({
    time: document.getElementById("timeSelect").value,
    category: document.getElementById("categorySelect").value,
    dailyGoal: document.getElementById("dailyGoal").value,
    autoSpeak: document.getElementById("autoSpeak").checked,
    favoritesOnly: document.getElementById("favoritesOnly").checked,
    darkMode: document.getElementById("darkMode").checked
  });

  applyDarkMode();
  goHome();
}

function loadSettingsIntoForm() {
  const settings = loadSettingsData();

  if (settings.time) document.getElementById("timeSelect").value = settings.time;
  if (settings.category) document.getElementById("categorySelect").value = settings.category;
  if (settings.dailyGoal) document.getElementById("dailyGoal").value = settings.dailyGoal;

  if (typeof settings.autoSpeak === "boolean") {
    document.getElementById("autoSpeak").checked = settings.autoSpeak;
  }

  if (typeof settings.favoritesOnly === "boolean") {
    document.getElementById("favoritesOnly").checked = settings.favoritesOnly;
  }

  if (typeof settings.darkMode === "boolean") {
    document.getElementById("darkMode").checked = settings.darkMode;
  }
}

function applyDarkMode() {
  document.body.classList.toggle(
    "dark",
    document.getElementById("darkMode").checked
  );
}

function getAvailableCards() {
  let available = [...cards];
  const category = document.getElementById("categorySelect").value;

  if (category !== "Alle") {
    available = available.filter(card => card.category === category);
  }

  if (document.getElementById("favoritesOnly").checked) {
    const favorites = new Set(loadFavoritesData());
    available = available.filter(card => favorites.has(card.word));
  }

  return available;
}

function startExercise() {
  hideScreens();
  document.getElementById("exercise").classList.remove("hidden");
  nextCard();
}

function nextCard() {
  clearInterval(timerHandle);

  const available = getAvailableCards();

  if (!available.length) {
    alert("Für diese Auswahl sind keine Wörter vorhanden.");
    goHome();
    return;
  }

  let next = available[Math.floor(Math.random() * available.length)];

  if (available.length > 1) {
    while (next.word === lastWord) {
      next = available[Math.floor(Math.random() * available.length)];
    }
  }

  currentCard = next;
  lastWord = next.word;

  document.getElementById("categoryBadge").textContent = next.category;
  document.getElementById("symbol").textContent = next.symbol;
  document.getElementById("word").textContent = next.word;
  document.getElementById("syllables").textContent = next.syllables;
  document.getElementById("example").textContent = "Beispiel: " + next.example;
  document.getElementById("sentenceInput").value = "";
  document.getElementById("feedback").classList.add("hidden");
  document.getElementById("wordArea").classList.add("hidden");
  document.getElementById("sentenceArea").classList.add("hidden");

  startTimer();
}

function startTimer() {
  clearInterval(timerHandle);

  countdown = Number(document.getElementById("timeSelect").value) || 8;
  const timer = document.getElementById("timer");
  timer.textContent = countdown;

  timerHandle = setInterval(() => {
    countdown -= 1;
    timer.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(timerHandle);
      timer.textContent = "⏰";
      revealWord();
    }
  }, 1000);
}

function revealWord() {
  document.getElementById("wordArea").classList.remove("hidden");
  document.getElementById("sentenceArea").classList.remove("hidden");

  if (document.getElementById("autoSpeak").checked) {
    speakWord();
  }
}

function speakWord() {
  if (currentCard) {
    speakText(currentCard.word, 0.55);
  }
}

function saveResult() {
  if (!currentCard) return;

  const sentence = document.getElementById("sentenceInput").value.trim();
  const now = new Date();
  const results = loadResults();

  results.push({
    word: currentCard.word,
    category: currentCard.category,
    sentence,
    sentenceDone: sentence.length > 0,
    date: now.toLocaleString("de-DE"),
    day: now.toLocaleDateString("de-DE")
  });

  saveResults(results);
  setFeedback("✅ Fortschritt gespeichert.");
  updateHomeProgress();
}

function toggleFavorite() {
  if (!currentCard) return;

  let favorites = loadFavoritesData();

  if (favorites.includes(currentCard.word)) {
    favorites = favorites.filter(word => word !== currentCard.word);
    setFeedback("⭐ Favorit entfernt.");
  } else {
    favorites.push(currentCard.word);
    setFeedback("⭐ Favorit gespeichert.");
  }

  saveFavoritesData(favorites);
}

function setFeedback(message) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.classList.remove("hidden");
}

function updateHomeProgress() {
  const results = loadResults();
  const today = new Date().toLocaleDateString("de-DE");
  const count = results.filter(result => result.day === today).length;
  const goal = Number(document.getElementById("dailyGoal").value) || 10;
  const percent = Math.min(100, Math.round((count / goal) * 100));

  document.getElementById("homeProgress").innerHTML = `
    <b>Heute: ${count} von ${goal} Wörtern</b>
    <div class="progress-track">
      <div class="progress-bar" style="width:${percent}%"></div>
    </div>
  `;
}

function showStats() {
  hideScreens();
  document.getElementById("stats").classList.remove("hidden");
  document.getElementById("statsContent").innerHTML =
    buildStatsHtml(loadResults());
}

function clearStats() {
  if (confirm("Statistik wirklich löschen?")) {
    saveResults([]);
    showStats();
    updateHomeProgress();
  }
}

function showFavorites() {
  hideScreens();
  document.getElementById("favorites").classList.remove("hidden");

  const favorites = loadFavoritesData();
  const target = document.getElementById("favoritesContent");

  if (!favorites.length) {
    target.innerHTML = "<p>Noch keine Favoriten gespeichert.</p>";
    return;
  }

  target.innerHTML = favorites
    .sort((a, b) => a.localeCompare(b, "de"))
    .map(word => `<div class="list-item">⭐ ${escapeHtml(word)}</div>`)
    .join("");
}
