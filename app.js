let i=0;
function show(){
 document.getElementById("word").textContent=words[i].word;
 document.getElementById("img").src=words[i].image;
}
function nextWord(){
 i=(i+1)%words.length;
 show();
}
show();