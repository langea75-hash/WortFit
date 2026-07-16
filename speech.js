function chooseGermanVoice(){
  const voices=window.speechSynthesis?.getVoices?.()||[];
  return voices.find(v=>v.lang==="de-DE")||voices.find(v=>v.lang.startsWith("de"))||null;
}
function speakText(value,rate=.55){
  if(!value||!("speechSynthesis" in window))return;
  const utterance=new SpeechSynthesisUtterance(value);
  utterance.lang="de-DE";
  utterance.rate=rate;
  utterance.pitch=1;
  const voice=chooseGermanVoice();
  if(voice)utterance.voice=voice;
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
  recognition.interimResults=false;
  recognition.maxAlternatives=1;
  setFeedback("🎤 Ich höre zu …");
  recognition.onresult=event=>{
    document.getElementById("sentenceInput").value=event.results[0][0].transcript;
    setFeedback("✅ Satz erkannt.");
  };
  recognition.onerror=()=>setFeedback("Die Spracheingabe hat nicht funktioniert.");
  recognition.start();
}
