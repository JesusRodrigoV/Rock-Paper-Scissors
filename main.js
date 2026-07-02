const state = { humanScore: 0, computerScore: 0, round: 0, mode: 0, matchOver: false };
const CHOICES = ["rock", "paper", "scissors"];
const EMOJIS = { rock: "🪨", paper: "📄", scissors: "✂️" };
const MOVES_MAP = {
  "1": "rock", "Digit1": "rock",
  "2": "paper", "Digit2": "paper",
  "3": "scissors", "Digit3": "scissors",
};
const RESET_KEYS = ["r", "R", "KeyR"];
const LS_KEY = "rps_scores";

const $ = (id) => document.getElementById(id);
const humanScoreEl = $("human-score");
const computerScoreEl = $("computer-score");
const humanChoiceEl = $("human-choice");
const computerChoiceEl = $("computer-choice");
const resultEl = $("result");
const roundEl = $("round");
const resetBtn = $("reset");
const modeBtns = document.querySelectorAll(".mode__btn");

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function playRound(human, computer) {
  if (human === computer) return { winner: "tie", message: "It's a tie!" };

  const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
  const humanWins = computer === beats[human];

  if (humanWins) {
    state.humanScore++;
    return {
      winner: "human",
      message: `You win! ${human} beats ${computer}`,
    };
  }

  state.computerScore++;
  return {
    winner: "computer",
    message: `You lose! ${computer} beats ${human}`,
  };
}

function clearArenaAttrs() {
  humanChoiceEl.removeAttribute("data-move");
  computerChoiceEl.removeAttribute("data-move");
  humanChoiceEl.removeAttribute("data-outcome");
  computerChoiceEl.removeAttribute("data-outcome");
  humanChoiceEl.dataset.active = "false";
  computerChoiceEl.dataset.active = "false";
}

function saveScores() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      human: state.humanScore,
      computer: state.computerScore,
    }));
  } catch {}
}

function loadScores() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved && typeof saved.human === "number" && typeof saved.computer === "number") {
      state.humanScore = saved.human;
      state.computerScore = saved.computer;
    }
  } catch {}
}

function updateScoreboard() {
  humanScoreEl.textContent = state.humanScore;
  computerScoreEl.textContent = state.computerScore;
  saveScores();
}

function flashScore(winner) {
  if (winner === "tie") return;

  const el = winner === "human" ? humanScoreEl : computerScoreEl;
  const cls =
    winner === "human" ? "scoreboard__score--flash-win" : "scoreboard__score--flash-lose";

  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function updateArena(human, computer, winner) {
  const setSlot = (el, choice, outcome) => {
    el.querySelector(".arena__emoji").textContent = EMOJIS[choice];
    el.dataset.move = choice;
    el.dataset.outcome = outcome;
    el.dataset.active = "true";
  };

  setSlot(
    humanChoiceEl,
    human,
    winner === "human" ? "win" : winner === "computer" ? "lose" : "tie",
  );
  setSlot(
    computerChoiceEl,
    computer,
    winner === "computer" ? "win" : winner === "human" ? "lose" : "tie",
  );
}

function updateRound() {
  roundEl.textContent = `Round ${state.round}`;
}

function disableMoves(disabled) {
  document.querySelectorAll(".moves__btn").forEach((btn) => {
    btn.disabled = disabled;
  });
}

function checkMatchOver() {
  if (state.mode === 0 || state.matchOver) return false;
  if (state.round < state.mode) return false;

  state.matchOver = true;
  disableMoves(true);

  let msg, outcome;
  if (state.humanScore > state.computerScore) {
    msg = `Match — You Win! ${state.humanScore} · ${state.computerScore}`;
    outcome = "win";
  } else if (state.computerScore > state.humanScore) {
    msg = `Match — You Lose! ${state.computerScore} · ${state.humanScore}`;
    outcome = "lose";
  } else {
    msg = `Match — It's a Draw! ${state.humanScore} · ${state.computerScore}`;
    outcome = "tie";
  }

  resultEl.textContent = msg;
  resultEl.className = "result result--match";
  resultEl.classList.add(`result--match-${outcome}`);

  if (outcome === "win") navigator.vibrate?.(25);
  else if (outcome === "lose") navigator.vibrate?.(20);

  resetBtn.classList.remove("reset--hidden");
  return true;
}

function updateResult(result) {
  resultEl.textContent = result.message;
  resultEl.className = "result";
  if (result.winner === "human") resultEl.classList.add("result--win");
  if (result.winner === "computer") resultEl.classList.add("result--lose");
  if (result.winner === "tie") resultEl.classList.add("result--tie");

  resetBtn.classList.remove("reset--hidden");

  if (result.winner !== "tie") navigator.vibrate?.(15);
}

function play(human) {
  if (state.matchOver) return;

  navigator.vibrate?.(6);

  const computer = getComputerChoice();
  const result = playRound(human, computer);
  state.round++;
  updateScoreboard();
  flashScore(result.winner);
  updateArena(human, computer, result.winner);
  updateRound();
  updateResult(result);
  checkMatchOver();
}

function handleMove(e) {
  play(e.currentTarget.dataset.move);
}

function handleKeydown(e) {
  const key = e.key;
  const code = e.code;
  const move = MOVES_MAP[key] || MOVES_MAP[code];

  if (move) {
    const btn = document.querySelector(`.moves__btn[data-move="${move}"]`);
    if (btn && !btn.disabled) {
      btn.focus();
      play(move);
    }
    return;
  }

  if (RESET_KEYS.includes(key) || RESET_KEYS.includes(code)) {
    resetBtn.focus();
    resetGame();
  }
}

function setMode(mode) {
  state.mode = mode;
  state.matchOver = false;
  disableMoves(false);

  modeBtns.forEach((btn) => {
    btn.classList.toggle("mode__btn--active", btn.dataset.mode === String(mode));
  });

  resetScores();
}

function resetScores() {
  state.humanScore = 0;
  state.computerScore = 0;
  state.round = 0;
  state.matchOver = false;
  disableMoves(false);

  humanScoreEl.textContent = "0";
  computerScoreEl.textContent = "0";
  localStorage.removeItem(LS_KEY);

  clearArenaAttrs();
  humanChoiceEl.querySelector(".arena__emoji").textContent = "🤚";
  computerChoiceEl.querySelector(".arena__emoji").textContent = "💻";

  roundEl.textContent = "Round 0";
  resultEl.textContent = "Choose your move";
  resultEl.className = "result";
  resetBtn.classList.add("reset--hidden");
}

function resetGame() {
  resetScores();
}

resetBtn.classList.add("reset--hidden");
loadScores();
updateScoreboard();

modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => setMode(Number(btn.dataset.mode)));
});

document.querySelectorAll(".moves__btn").forEach((btn) => {
  btn.addEventListener("click", handleMove);
});

document.addEventListener("keydown", handleKeydown);
resetBtn.addEventListener("click", resetGame);

document.querySelector(".game").focus();
