const cards = [
  {
    word: "Apfel",
    category: "Essen",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg"
  },
  {
    word: "Fahrrad",
    category: "Freizeit",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/41/Left_side_of_Flying_Pigeon.jpg"
  },
  {
    word: "Hund",
    category: "Tiere",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Golde33443.jpg"
  },
  {
    word: "Brot",
    category: "Essen",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/33/Fresh_made_bread_05.jpg"
  },
  {
    word: "Haus",
    category: "Alltag",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/House_in_Kaiserswerth.jpg"
  }
];

let currentCard = null;
let timer = 8;
let interval = null;

function hideAll() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("exercise").classList.add("hidden");
  document.getElementById("stats").classList.add("hidden");
}

function goHome() {
  hideAll();
  document.getElementById("home").classList.remove("hidden");
}

function startExercise() {
  hideAll();
  document.getElementById("exercise").classList.remove("hidden");
  nextCard();
}

function nextCard() {
  currentCard = cards[Math.floor(Math.random() * cards.length)];

  document.getElementById("image").src = currentCard.image;
  document.getElementById("word").textContent = currentCard.word;
  document.getElementById("sentence").value = "";

  document.getElementById("wordBox").classList.add("hidden");
  document.getElementById("sentenceBox").classList.add("hidden");

  startTimer();
}

function startTimer() {
  clearInterval(interval);
  timer = 8;
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

  speechSynthesis.cancel();
  speechSynthesis.speak(text);
}

function startSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

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
    sentence: sentence
  };

  const results = JSON.parse(localStorage.getItem("wortfit") || "[]");
  results.push(result);
  localStorage.setItem("wortfit", JSON.stringify(results));

  alert("✅ Gespeichert");
}

function showStats() {
  hideAll();
  document.getElementById("stats").classList.remove("hidden");

  const results = JSON.parse(localStorage.getItem("wortfit") || "[]");

  if (results.length === 0) {
    document.getElementById("statsText").innerHTML =
      "Noch keine Übungen gespeichert.";
    return;
  }

  let html = `<p>🧠 Übungen insgesamt: ${results.length}</p>`;
  html += "<h3>Letzte Übungen:</h3>";

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
