const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");
const newRoundBtn = document.getElementById("newRound");
const resetScoreBtn = document.getElementById("resetScore");
const modeBtns = document.querySelectorAll(".mode__btn");
const cells = Array.from(document.querySelectorAll(".cell"));

const state = {
  board: Array(9).fill(""),
  current: "X",
  active: true,
  mode: "pvp",
  scores: { X: 0, O: 0, draw: 0 },
};

function setStatus(text) {
  statusEl.textContent = text;
}

function render() {
  cells.forEach((cell, i) => {
    const value = state.board[i];
    cell.textContent = value;
    cell.classList.toggle("is-x", value === "X");
    cell.classList.toggle("is-o", value === "O");
    cell.classList.toggle("is-filled", Boolean(value));
    cell.classList.toggle(
      "is-locked",
      !state.active || Boolean(value) || (state.mode === "cpu" && state.current === "O")
    );
  });

  scoreXEl.textContent = state.scores.X;
  scoreOEl.textContent = state.scores.O;
  scoreDrawEl.textContent = state.scores.draw;
}

function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function highlight(line) {
  line.forEach((i) => cells[i].classList.add("is-win"));
}

function endRound(result) {
  state.active = false;
  if (result === "draw") {
    state.scores.draw += 1;
    setStatus("It's a draw!");
  } else {
    state.scores[result.player] += 1;
    highlight(result.line);
    setStatus(`${result.player} wins!`);
  }
  render();
}

function checkEnd() {
  const result = getWinner(state.board);
  if (result) {
    endRound(result);
    return true;
  }
  if (state.board.every(Boolean)) {
    endRound("draw");
    return true;
  }
  return false;
}

function switchTurn() {
  state.current = state.current === "X" ? "O" : "X";
  setStatus(`${state.current}'s turn`);
}

function place(index) {
  if (!state.active || state.board[index]) return;
  state.board[index] = state.current;
  render();
  if (checkEnd()) return;
  switchTurn();
  if (state.mode === "cpu" && state.current === "O" && state.active) {
    render();
    setTimeout(cpuMove, 320);
  }
}

function cpuMove() {
  if (!state.active || state.current !== "O") return;
  const move = chooseCpuMove();
  if (move === -1) return;
  place(move);
}

function chooseCpuMove() {
  const empty = state.board
    .map((v, i) => (v ? null : i))
    .filter((i) => i !== null);

  for (const symbol of ["O", "X"]) {
    for (const i of empty) {
      const copy = state.board.slice();
      copy[i] = symbol;
      const win = getWinner(copy);
      if (win && win.player === symbol) return i;
    }
  }

  if (state.board[4] === "") return 4;

  const corners = [0, 2, 6, 8].filter((i) => state.board[i] === "");
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return empty[Math.floor(Math.random() * empty.length)] ?? -1;
}

function newRound() {
  state.board = Array(9).fill("");
  state.current = "X";
  state.active = true;
  cells.forEach((cell) => cell.classList.remove("is-win", "is-locked"));
  setStatus("X's turn");
  render();
}

function resetScores() {
  state.scores = { X: 0, O: 0, draw: 0 };
  render();
}

function setMode(mode) {
  state.mode = mode;
  modeBtns.forEach((btn) =>
    btn.classList.toggle("is-active", btn.dataset.mode === mode)
  );
  newRound();
}

boardEl.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell) return;
  place(Number(cell.dataset.index));
});

newRoundBtn.addEventListener("click", newRound);
resetScoreBtn.addEventListener("click", resetScores);
modeBtns.forEach((btn) =>
  btn.addEventListener("click", () => setMode(btn.dataset.mode))
);

newRound();
