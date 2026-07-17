function norm(v){
 return String(v||"").toLowerCase().replace(/[.,!?;:()"]/g," ").replace(/\s+/g," ").trim();
}
function hasTarget(sentence,target){
 const s=norm(sentence),t=norm(target);
 return s.split(" ").some(w=>w===t||w.startsWith(t.slice(0,Math.max(4,t.length-2))));
}
function evaluateSentence(card,sentence){
 const clean=norm(sentence);
 if(!clean)return{status:"🎤 Noch kein Satz",message:"Sprich oder schreibe zuerst einen Satz.",suggestion:card.example,level:"empty"};
 const count=clean.split(" ").length;
 const target=hasTarget(clean,card.word);
 if(target&&count>=4)return{status:"⭐⭐⭐ Sehr gut!",message:"Das Zielwort kommt vor und dein Satz ist verständlich.",suggestion:sentence,level:"good"};
 if(target&&count>=2)return{status:"⭐⭐ Gut erkannt!",message:"Das richtige Wort ist enthalten. So klingt der Satz vollständiger:",suggestion:card.example,level:"almost"};
 if(target)return{status:"⭐ Guter Anfang!",message:"Du hast das richtige Wort gefunden. Jetzt bilde einen kurzen Satz.",suggestion:card.example,level:"start"};
 return{status:"🔁 Noch einmal versuchen",message:`Versuche einen Satz mit dem Wort „${card.word}“.`,suggestion:card.example,level:"retry"};
}
