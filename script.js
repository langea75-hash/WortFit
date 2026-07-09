let currentCard = null;
let timer = 8;
let interval = null;
let lastWord = null;

function hideAll() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("settings").classList.add("hidden");
  document.getElementById("exercise").classList.add("hidden");
  document.getElementById("stats").classList.add("hidden");
}

function goHome() {
  clearInterval(interval);
  hideAll();
  document.getElementById("home").classList.remove("hidden");
}

function showSettings() {
  hideAll();
  document.getElementById("settings").classList.remove("hidden");
}

function startExercise() {
  hideAll();
  document.getElementById("exercise").classList.remove("hidden");
  nextCard();
}

function getFilteredCards() {
  const category = document.getElementById("categorySelect").value;
  if (category === "Alle") return cards;
  return cards.filter(card => card.category === category);
}

function nextCard() {
  const filteredCards = getFilteredCards();

  if (filteredCards.length === 0) {
    alert("Keine Karten in dieser Kategorie.");
    return;
  }

  let newCard = filteredCards[Math.floor(Math.random() * filteredCards.length)];

  if (filteredCards.length > 1) {
    while (newCard.word === lastWord) {
      newCard = filteredCards[Math.floor(Math.random() * filteredCards.length)];
    }
  }

  currentCard = newCard;
  lastWord = currentCard.word;

  document.getElementById("image").src = currentCard.image;
  document.getElementById("word").textContent = currentCard.word;
  document.getElementById("sentence").value = "";

  document.getElementById("wordBox").classList.add("hidden");
  document.getElementById("sentenceBox").classList.add("hidden");

  startTimer();
}

function startTimer() {
  clearInterval(interval);
  timer = parseInt(document.getElementById("timeSelect").value);
  document.getElementById("timer").textContent = timer;

  interval = setInterval(() => {
    timer--;
    document.getElementById("timer").textContent = timer;

    if (timer <= 0) {
      clearInterval(interval);
      document.getElementById("timer").textContent = "⏰";
      showWord();
    }
  }, 1000);
}

function showWord() {
  document.getElementById("wordBox").classList.remove("hidden");
  document.getElementById("sentenceBox").classList.remove("hidden");
  speakWord();
}

function speakWord() {
  if (!currentCard) return;

  const text = new SpeechSynthesisUtterance(currentCard.word);
  text.lang = "de-DE";
  text.rate = 0.55;
  text.pitch = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(text);
}

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Dein Browser unterstützt Spracheingabe leider nicht.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "de-DE";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    const spoken = event.results[0][0].transcript;
    document.getElementById("sentence").value = spoken;
  };

  recognition.onerror = function() {
    alert("Spracheingabe hat nicht funktioniert.");
  };
}

function saveResult() {
  if (!currentCard) return;

  const sentence = document.getElementById("sentence").value.trim();

  const result = {
    date: new Date().toLocaleString("de-DE"),
    word: currentCard.word,
    category: currentCard.category,
    sentence: sentence,
    sentenceDone: sentence.length > 0
  };

  const results = JSON.parse(localStorage.getItem("wortfit") || "[]");
  results.push(result);
  localStorage.setItem("wortfit", JSON.stringify(results));

  alert("✅ Fortschritt gespeichert.");
}

function showStats() {
  hideAll();
  document.getElementById("stats").classList.remove("hidden");

  const results = JSON.parse(localStorage.getItem("wortfit") || "[]");

  if (results.length === 0) {
    document.getElementById("statsText").innerHTML = "Noch keine Übungen gespeichert.";
    return;
  }

  const total = results.length;
  const sentenceCount = results.filter(r => r.sentenceDone).length;

  const categoryCount = {};
  results.forEach(r => {
    categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
  });

  let html = `
    <p>🧠 Übungen insgesamt: <b>${total}</b></p>
    <p>🗣️ Sätze gebildet: <b>${sentenceCount}</b></p>
    <h3>📂 Kategorien</h3>
  `;

  for (const category in categoryCount) {
    html += `<p>${category}: ${categoryCount[category]}</p>`;
  }

  html += "<h3>Letzte Übungen</h3>";

  results.slice(-5).reverse().forEach(r => {
    html += `
      <p>
        ✅ ${r.date}<br>
        <b>${r.word}</b> (${r.category})<br>
        ${r.sentence || "Kein Satz"}
      </p>
    `;
  });

  document.getElementById("statsText").innerHTML = html;
}

function clearStats() {
  if (confirm("Statistik wirklich löschen?")) {
    localStorage.removeItem("wortfit");
    showStats();
  }
}
