function speakText(value, rate = 0.55) {
  if (!value || !("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = "de-DE";
  utterance.rate = rate;
  utterance.pitch = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function startSpeechRecognition() {
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) {
    alert("Die Spracheingabe wird von diesem Browser nicht unterstützt.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "de-DE";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  setFeedback("🎤 Ich höre zu …");

  recognition.onresult = event => {
    document.getElementById("sentenceInput").value =
      event.results[0][0].transcript;
    setFeedback("✅ Satz erkannt.");
  };

  recognition.onerror = () => {
    setFeedback("Die Spracheingabe hat nicht funktioniert.");
  };

  recognition.start();
}
