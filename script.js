let playerCount = 4;
let players = [];
let scores = [];

const bc = new BroadcastChannel("score_channel");

window.onload = () => {
  document.getElementById("player-count-selector").addEventListener("change", (e) => {
    playerCount = parseInt(e.target.value);
    generatePlayerInputs(playerCount);
  });

  generatePlayerInputs(playerCount); // 初期値で生成

  document.getElementById("player-form").addEventListener("submit", function (e) {
    e.preventDefault();
    players = [];
    scores = [];
    for (let i = 0; i < playerCount; i++) {
      const name = this[`name${i}`].value;
      const school = this[`school${i}`].value;
      const rank = parseInt(this[`rank${i}`].value);
      const color = getColorByRank(rank);
      players.push({ name, school, rank, color });
      scores.push({ correct: 0, wrong: 0 });
    }
    this.style.display = "none";
    document.getElementById("players").style.display = "flex";
    renderPlayers();
    updateQuestionDisplay();
    setInterval(updateQuestionDisplay, 1000);
  });
};

function generatePlayerInputs(count) {
  const inputContainer = document.getElementById("player-inputs");
  inputContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    inputContainer.innerHTML += `
      <div>
        <h3>プレイヤー${i + 1}</h3>
        <label>名前: <input type="text" name="name${i}" required></label><br>
        <label>学校: <input type="text" name="school${i}" required></label><br>
        <label>順位: <input type="number" name="rank${i}" min="1" max="100" required></label><br>
      </div><hr>
    `;
  }
}

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
  const round = parseInt(localStorage.getItem("currentRoundNumber") || "1");

  let resultText = "";
  if (round === 2) {
    if (score.correct >= 5) {
      resultText = "WIN";
    } else if (score.wrong >= 2) {
      resultText = "LOSE";
    }
  } else {
    if (score.wrong >= 2) {
      resultText = "LOSE";
    }
  }

  loseDiv.textContent = resultText;
  scoreDiv.textContent = `${score.correct}○ ${score.wrong}×`;

  bc.postMessage({
    index: i,
    name: players[i].name,
    school: players[i].school,
    rank: players[i].rank,
    color: players[i].color,
    correct: score.correct,
    wrong: score.wrong,
    lose: resultText === "LOSE"
  });
}

function addCorrect(i) {
  scores[i].correct++;
  updateDisplay(i);
}

function addWrong(i) {
  scores[i].wrong++;
  updateDisplay(i);
}

// ✅ CSV取得処理
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
    const row = rows[index];
    const questionText = (row[2] || "").trim() || "（問題なし）";
    const answerText = (row[3] || "").trim() || "（答えなし）";
    display.innerHTML = `
      <strong>Q:</strong> ${questionText}<br>
      <strong>A:</strong> ${answerText}
    `;
  } else {
    display.textContent = "問題が見つかりません。";
  }
}
