let playerCount = 4;
let players = [];
let scores = [];
let winOrder = 1;

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
    winOrder = 1;
    for (let i = 0; i < playerCount; i++) {
      const name = this[`name${i}`].value;
      const school = this[`school${i}`].value;
      const rank = parseInt(this[`rank${i}`].value);
      const color = getColorByRank(rank);
      players.push({ name, school, rank, color });
      scores.push({ correct: 0, wrong: 0, finished: false });
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
      <div style="margin-bottom: 10px;">
        <h3>プレイヤー${i + 1}</h3>
        <label>名前: <input type="text" name="name${i}" required></label><br>
        <label>学校: <input type="text" name="school${i}" required></label><br>
        <label>順位: <input type="number" name="rank${i}" min="1" max="100" required></label>
      </div><hr>
    `;
  }
}

function getColorByRank(rank) {
  return "rank-1"; // 全員赤系で統一
}

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = '';
  players.forEach((p, i) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = `player ${p.color}`;
    playerDiv.innerHTML = `
      <div class="player-content">
        <h2>${p.name}</h2>
        <h4>${p.school}</h4>
        <div class="rank">${p.rank}位</div>
        <div class="score" id="score-${i}">0○ 0×</div>
        <div class="result" id="result-${i}"></div>
        <div class="buttons">
          <button onclick="addCorrect(${i})">○ 正解</button>
          <button onclick="addWrong(${i})">× 誤答</button>
        </div>
      </div>
    `;
    container.appendChild(playerDiv);
  });
}

function updateDisplay(i) {
  const score = scores[i];
  const scoreDiv = document.getElementById(`score-${i}`);
  const resultDiv = document.getElementById(`result-${i}`);

  // 勝ち or 負け処理
  if (!score.finished) {
    if (score.correct >= 5) {
      resultDiv.textContent = `${ordinal(winOrder)} WIN 🎉`;
      score.finished = true;
      winOrder++;
    } else if (score.wrong >= 2) {
      resultDiv.innerHTML = `
        <div class="disqualified">
          <img src="https://raw.githubusercontent.com/strawberry-macaron/Newkawaiicontest/main/shikkaku_text.png" alt="失格" style="width: 80px; animation: pop 0.5s ease;">
        </div>
      `;
      score.finished = true;
    }
  }

  scoreDiv.textContent = `${score.correct}○ ${score.wrong}×`;

  bc.postMessage({
    index: i,
    name: players[i].name,
    school: players[i].school,
    rank: players[i].rank,
    color: players[i].color,
    correct: score.correct,
    wrong: score.wrong,
    result: resultDiv.textContent
  });
}

function addCorrect(i) {
  if (scores[i].finished) return;
  scores[i].correct++;
  updateDisplay(i);
}

function addWrong(i) {
  if (scores[i].finished) return;
  scores[i].wrong++;
  updateDisplay(i);
}

function ordinal(n) {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffix[(v - 20) % 10] || suffix[v] || suffix[0]}`;
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
let showQuestion = true;
let showAnswer = true;

function toggleQuestion() {
  showQuestion = !showQuestion;
  updateQuestionDisplay();
}

function toggleAnswer() {
  showAnswer = !showAnswer;
  updateQuestionDisplay();
}
