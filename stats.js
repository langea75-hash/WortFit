function buildStatsHtml(results){
  if(!results.length)return "<p>Noch keine Übungen gespeichert.</p>";
  const today=new Date().toLocaleDateString("de-DE");
  const todayCount=results.filter(r=>r.day===today).length;
  const sentenceCount=results.filter(r=>r.sentenceDone).length;
  const uniqueWords=new Set(results.map(r=>r.word)).size;
  const streak=calculateStreak(results);
  let html=`<div class="stat-grid">
    <div class="stat-box">🧠 <b>${results.length}</b><br>Übungen insgesamt</div>
    <div class="stat-box">📅 <b>${todayCount}</b><br>Übungen heute</div>
    <div class="stat-box">🗣️ <b>${sentenceCount}</b><br>Sätze gebildet</div>
    <div class="stat-box">🔥 <b>${streak}</b><br>Tage in Folge</div>
  </div>`;
  html+="<h3>Letzte Übungen</h3>";
  results.slice(-10).reverse().forEach(r=>{
    html+=`<div class="list-item"><b>${escapeHtml(r.word)}</b> · ${escapeHtml(r.category)}<br>${escapeHtml(r.date)}<br>${r.sentence?escapeHtml(r.sentence):"Kein Satz gespeichert"}</div>`;
  });
  return html;
}
function calculateStreak(results){
  const days=[...new Set(results.map(r=>r.day))].map(d=>{
    const [day,month,year]=d.split(".").map(Number);
    return new Date(year,month-1,day);
  }).sort((a,b)=>b-a);
  if(!days.length)return 0;
  let streak=1;
  for(let i=0;i<days.length-1;i++){
    const diff=(days[i]-days[i+1])/86400000;
    if(diff===1)streak++;else break;
  }
  return streak;
}
