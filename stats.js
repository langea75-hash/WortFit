function buildStatsHtml(results){
  if(!results.length)return "<p>Noch keine Übungen gespeichert.</p>";
  const today=new Date().toLocaleDateString("de-DE");
  const todayCount=results.filter(item=>item.day===today).length;
  const sentenceCount=results.filter(item=>item.sentenceDone).length;
  const uniqueWords=new Set(results.map(item=>item.word)).size;
  let html=`<div class="stat-grid">
    <div class="stat-box">🧠 <b>${results.length}</b><br>Übungen</div>
    <div class="stat-box">📅 <b>${todayCount}</b><br>Heute</div>
    <div class="stat-box">🗣️ <b>${sentenceCount}</b><br>Sätze</div>
    <div class="stat-box">🔤 <b>${uniqueWords}</b><br>Wörter</div>
  </div><h3>Letzte Übungen</h3>`;
  results.slice(-10).reverse().forEach(item=>{
    html+=`<div class="list-item">
      <b>${escapeHtml(item.word)}</b> · ${escapeHtml(item.category)}<br>
      ${escapeHtml(item.date)}<br>
      ${item.sentence?escapeHtml(item.sentence):"Kein Satz"}
    </div>`;
  });
  return html;
}
