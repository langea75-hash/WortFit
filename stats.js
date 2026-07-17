function buildStatsHtml(r){
 if(!r.length)return"<p>Noch keine Übungen gespeichert.</p>";
 let h=`<div class="stat-box">🧠 Übungen: <b>${r.length}</b></div><h3>Letzte Übungen</h3>`;
 r.slice(-10).reverse().forEach(x=>h+=`<div class="list-item"><b>${escapeHtml(x.word)}</b><br>${escapeHtml(x.sentence||"Kein Satz")}<br>${escapeHtml(x.evaluationStatus||"")}</div>`);
 return h;
}
