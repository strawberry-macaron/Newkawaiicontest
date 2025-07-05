let players = [];
let scores = [];

function loadCSV() {
  const csvFile = document.getElementById('round').value;

  Papa.parse(csvFile, {
    download: true,
    header: true,
    complete: function(results) {
      players = results.data.filter(p => p['名前']); // 空行防止
      scores = players.map(() => ({ correct: 0, wrong: 0 }));
      renderPlayers();
    }
  });
}

function renderPlayers() {
  const container = document.getElementById('players');
  container.innerHTML = '';

  players.forEach((p, i) => {
    const playerDiv = document.createElement('div');
    playerDiv.className = `player ${p['色']}`;
    playerDiv.innerHTML = `
      <h2>${p['名前']}</h2>
      <h4>${p['学校']}</h4>
      <div id="rank-${i}">-位</div>
      <div class="score" id="score-${i}">0◯ 0×</div>
      <div id="lose-${i}" style="color:red; font-weight:bold;"></div>
      <div class="buttons">
        <button onclick="addCorrect(${i})">◯ 正解</button>
        <button onclick="addWrong(${i})">× 誤答</button>
      </div>
    `;
    container.appendChild(playerDiv);
  });

  updateRanking();
}

function updateDisplay(i) {
  const score = scores[i];
  const scoreDiv = document.getElementById(`score-${i}`);
  const loseDiv = document.getElementById(`lose-${i}`);
  if (score.wrong >= 2) {
    loseDiv.textContent = 'LOSE';
  } else {
    loseDiv.textContent = '';
  }
  scoreDiv.textContent = `${score.correct}◯ ${score.wrong}×`;
  updateRanking();
}

function addCorrect(i) {
  scores[i].correct++;
  updateDisplay(i);
}

function addWrong(i) {
  scores[i].wrong++;
  updateDisplay(i);
}

function updateRanking() {
  const sorted = [...scores]
    .map((s, i) => ({ ...s, index: i }))
    .sort((a, b) => b.correct - a.correct || a.wrong - b.wrong);
  sorted.forEach((item, rank) => {
    const rankDiv = document.getElementById(`rank-${item.index}`);
    rankDiv.textContent = `${rank + 1}位`;
  });
}

// 初回読み込み
window.onload = () => loadCSV();
