const playerCount = 4;
let players = [];
let scores = [];

const colors = ['blue', 'red', 'green', 'purple'];

window.onload = () => {
  const inputContainer = document.getElementById("player-inputs");
  for (let i = 0; i < playerCount; i++) {
    inputContainer.innerHTML += `
      <div>
        <h3>プレイヤー${i + 1}</h3>
        <label>名前: <input type="text" name="name${i}" required></label><br>
        <label>学校: <input type="text" name="school${i}" required></label><br>
        <label>色:
          <select name="color${i}">
            ${colors.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </label>
      </div><hr>
    `;
  }

  document.getElementById("player-form").addEventListener("submit", function (e) {
    e.preventDefault();
    players = [];
    for (let i = 0; i < playerCount; i++) {
      const name = this[`name${i}`].value;
      const school = this[`school${i}`].value;
      const color = this[`color${i}`].value;
      players.push({ name, school, color });
    }
    scores = players.map(() => ({ correct: 0, wrong: 0 }));
    this.parentElement.style.display = "none";
    document.getElementById("players").style.display = "flex";
    renderPlayers();
  });
};

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = '';
  players.forEach((p, i) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = `player ${p.color}`;
    playerDiv.innerHTML = `
      <h2>${p.name}</h2>
      <h4>${p.school}</h4>
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
    loseDiv.textContent = "LOSE";
  } else {
    loseDiv.textContent = "";
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
