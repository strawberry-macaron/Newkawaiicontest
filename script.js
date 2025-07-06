const playerCount = 4;
let players = [];
let scores = [];

window.onload = () => {
  const inputContainer = document.getElementById("player-inputs");

  for (let i = 0; i < playerCount; i++) {
    inputContainer.innerHTML += `
      <div>
        <h3>プレイヤー${i + 1}</h3>
        <label>名前: <input type="text" name="name${i}" required></label><br>
        <label>学校: <input type="text" name="school${i}" required></label><br>
        <label>順位: <input type="number" name="rank${i}" min="1" max="100" required></label><br>
      </div><hr>
    `;
  }

  document.getElementById("player-form").addEventListener("submit", function (e) {
    e.preventDefault();
    players = [];
    for (let i = 0; i < playerCount; i++) {
      const name = this[`name${i}`].value;
      const school = this[`school${i}`].value;
      const rank = parseInt(this[`rank${i}`].value);
      const color = getColorByRank(rank);
      players.push({ name, school, rank, color });
    }
    scores = players.map(() => ({ correct: 0, wrong: 0 }));
    this.parentElement.style.display = "none";
    document.getElementById("players").style.display = "flex";
    renderPlayers();
    updateQuestionDisplay();
    setInterval(updateQuestionDisplay, 1000);
  });
};

function getColorByRank(rank) {
  if (rank === 1) return "strawberry";
  if (rank === 2) return "candy";
  if (rank === 3 || rank === 4) return "raspberry";
  if (rank >= 5 && rank <= 12) return "iceblue";
  if (rank >= 13 && rank <= 24) return "pudding";
  if (rank >= 25 && rank <= 36) return "mint";
  return "default";
}

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = '';
  players.forEach((p, i) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = `player ${p.color}`;
    playerDiv.innerHTML = `
      <h2>${p.name}</h2>
      <h4>${p.school}</h4>
      <div id="rank-${i}">${p.rank}位</div>
      <div class="score" id="score-${i}">0○ 0×</div>
      <div id="lose-${i}" style="color:red; font-weight:bold;"></div>
      <div class="buttons">
        <button onclick="addCorrect(${i})">○ 正解</button>
        <button onclick="addWrong(${i})">× 誤答</button>
      </div>
    `;
    container.appendChild(playerDiv);
  });
}

function updateDisplay(i) {
  const score = scores[i];
  const scoreDiv = document.getElementById(`score-${i}`);
  const loseDiv = document.getElementById(`lose-${i}`);
  if (score.wrong >= 2) {
    loseDiv.textContent = "LOSE";
  } else {
    loseDiv.textContent = "";
  }
  scoreDiv.textContent = `${score.correct}○ ${score.wrong}×`;
}

function addCorrect(i) {
  scores[i].correct++;
  updateDisplay(i);
}

function addWrong(i) {
  scores[i].wrong++;
  updateDisplay(i);
}

// CSV取得先
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQauPJe0jkiS52L65yXobA_KJ2Hc4ri5WrObyHe4j88wEwjcxAKzGzaXmgYahuVmM-ix2imGAA8lNR4/pub?gid=0&single=true&output=csv";

async function fetchCSV() {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const rows = text.trim().split("\n").map(row => row.split(","));
  return rows;
}

async function updateQuestionDisplay() {
  const qNum = localStorage.getItem("currentQuestionNumber");
  const display = document.getElementById("question-display");

  if (!qNum) {
    display.textContent = "（問題はまだ表示されていません）";
    return;
  }

  const index = parseInt(qNum);
  const rows = await fetchCSV();

  if (index >= 1 && index < rows.length) {
    const row = rows[index]; // index番目の行を取得（0はヘッダーなので除外）
    const questionText = row[2] || "（問題なし）"; // C列
    const answerText = row[3] || "（答えなし）";   // D列
    display.innerHTML = `<strong>Q:</strong> ${questionText}<br><strong>A:</strong> ${answerText}`;
  } else {
    display.textContent = "問題が見つかりません。";
  }
}
