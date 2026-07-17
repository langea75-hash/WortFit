const ARTICLES=new Set(["der","die","das","den","dem","des","ein","eine","einen","einem","einer"]);
const VERBS={
"kauf":"kauft","kaufe":"kauft","lauf":"läuft","laufe":"läuft","fahr":"fährt","fahre":"fährt",
"geh":"geht","gehe":"geht","komm":"kommt","komme":"kommt","mach":"macht","mache":"macht",
"spiel":"spielt","spiele":"spielt","trink":"trinkt","trinke":"trinkt","ess":"isst","esse":"isst",
"seh":"sieht","sehe":"sieht","les":"liest","lese":"liest","schreib":"schreibt","schreibe":"schreibt",
"sprech":"spricht","spreche":"spricht","schlaf":"schläft","schlafe":"schläft","sitz":"sitzt",
"sitze":"sitzt","steh":"steht","stehe":"steht","lach":"lacht","lache":"lacht","koch":"kocht",
"koche":"kocht","back":"backt","backe":"backt","arbeit":"arbeitet","arbeite":"arbeitet",
"wart":"wartet","warte":"wartet","lern":"lernt","lerne":"lernt","sing":"singt","singe":"singt",
"tanz":"tanzt","tanze":"tanzt"
};
function norm(v){return String(v||"").toLocaleLowerCase("de-DE").replace(/[.,!?;:()"]/g," ").replace(/\s+/g," ").trim()}
function cap(v){return v?v.charAt(0).toLocaleUpperCase("de-DE")+v.slice(1):""}
function finish(v){const s=String(v||"").trim();if(!s)return"";const r=cap(s);return/[.!?]$/.test(r)?r:r+"."}
function hasTarget(sentence,target){
 const words=norm(sentence).split(" "),t=norm(target),root=t.slice(0,Math.max(4,t.length-2));
 return words.some(w=>w===t||w.startsWith(root)||(t.startsWith(w)&&w.length>=4));
}
function improveSentence(sentence,card){
 let words=norm(sentence).split(" ").filter(Boolean);
 if(!words.length)return card.example;
 const target=norm(card.word);
 if(words[0]===target){
   const article=norm(card.article||"");
   if(article)words.unshift(article);
 }
 words=words.map(w=>VERBS[w]||w);
 words=words.map((w,i)=>(w===target||ARTICLES.has(words[i-1]))?cap(w):w);
 words[0]=cap(words[0]);
 return finish(words.join(" "));
}
function evaluateSentence(card,sentence){
 const clean=norm(sentence);
 if(!clean)return{status:"🎤 Noch kein Satz",message:"Sprich oder schreibe zuerst einen Satz.",suggestion:card.example,level:"empty"};
 const count=clean.split(" ").filter(Boolean).length,target=hasTarget(clean,card.word),improved=improveSentence(sentence,card);
 if(target&&count>=4)return{status:"⭐⭐⭐ Sehr gut!",message:"Ich habe deinen Satz verstanden.",suggestion:improved,level:"good"};
 if(target&&count>=2)return{status:"⭐⭐ Gut erkannt!",message:"Das richtige Wort ist enthalten. So klingt der Satz vollständiger:",suggestion:improved,level:"almost"};
 if(target)return{status:"⭐ Guter Anfang!",message:"Du hast das richtige Wort gefunden. Jetzt kannst du einen kurzen Satz daraus machen.",suggestion:card.example,level:"start"};
 return{status:"🔁 Noch einmal versuchen",message:`Versuche einen Satz mit dem Wort „${card.word}“.`,suggestion:card.example,level:"retry"};
}
