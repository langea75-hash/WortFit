function buildStatsHtml(results) {
  if (!results.length) {
    return "<p>Noch keine Übungen gespeichert.</p>";
  }

  const today = new Date().toLocaleDateString("de-DE");
  const todayCount = results.filter(item => item.day === today).length;
  const sentences = results.filter(item => item.sentenceDone).length;
  const uniqueWords = new Set(results.map(item => item.word)).size;

  let html = `
    <div class="stat-grid">
      <div class="stat-box">🧠 <b>${results.length}</b><br>Übungen insgesamt</div>
      <div class="stat-box">📅 <b>${todayCount}</b><br>Übungen heute</div>
      <div class="stat-box">🗣️ <b>${sentences}</b><br>Sätze gebildet</div>
      <div class="stat-box">🔤 <b>${uniqueWords}</b><br>verschiedene Wörter</div>
    </div>
    <h3>Letzte Übungen</h3>
  `;

  results.slice(-10).reverse().forEach(item => {
    html += `
      <div class="list-item">
        <b>${escapeHtml(item.word)}</b> · ${escapeHtml(item.category)}<br>
        ${escapeHtml(item.date)}<br>
        ${item.sentence ? escapeHtml(item.sentence) : "Kein Satz gespeichert"}
      </div>
    `;
  });

  return html;
}
