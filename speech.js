function speakText(value,rate=.55){
 if(!value||!("speechSynthesis"in window))return;
 const u=new SpeechSynthesisUtterance(value);
 u.lang="de-DE";u.rate=rate;u.pitch=1;
 speechSynthesis.cancel();speechSynthesis.speak(u);
}
function startSpeechRecognition(){
 const R=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!R){alert("Spracheingabe wird nicht unterstützt.");return}
 const r=new R();r.lang="de-DE";r.interimResults=false;
 setFeedback("🎤 Ich höre zu …");
 r.onresult=e=>{
   sentenceInput.value=e.results[0][0].transcript;
   setFeedback("✅ Satz erkannt.");
   evaluateCurrentSentence();
 };
 r.onerror=()=>setFeedback("Spracheingabe hat nicht funktioniert.");
 r.start();
}
