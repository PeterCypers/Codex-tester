import {
  GRID_SIZE,
  createInitialState,
  setDirection,
  startGame,
  stepGame,
  togglePause
} from "./snake-logic.js";

const TICK_MS = 140;
const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const gameStateElement = document.querySelector("#game-state");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();
let intervalId = null;

function createBoard() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    fragment.appendChild(cell);
  }
  boardElement.appendChild(fragment);
}

function render() {
  const cells = boardElement.children;

  for (const cell of cells) {
    cell.className = "cell";
  }

  state.snake.forEach((segment, index) => {
    const cell = getCell(segment.x, segment.y);
    if (!cell) {
      return;
    }

    cell.classList.add("cell-snake");
    if (index === 0) {
      cell.classList.add("cell-head");
    }
  });

  if (state.food) {
    const foodCell = getCell(state.food.x, state.food.y);
    foodCell?.classList.add("cell-food");
  }

  scoreElement.textContent = String(state.score);
  gameStateElement.textContent = formatStatus(state.status);
  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
}

function getCell(x, y) {
  const index = y * GRID_SIZE + x;
  return boardElement.children.item(index);
}

function tick() {
  state = stepGame(state);

  if (state.food === null && state.status === "running") {
    state = { ...state, status: "game-over" };
  }

  if (state.status === "game-over") {
    stopLoop();
  }

  render();
}

function startLoop() {
  stopLoop();
  intervalId = window.setInterval(tick, TICK_MS);
}

function stopLoop() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function handleStart() {
  if (state.status === "game-over") {
    state = createInitialState();
  }

  state = startGame(state);
  startLoop();
  render();
}

function handlePauseToggle() {
  if (state.status === "game-over") {
    return;
  }

  state = togglePause(state);
  if (state.status === "running") {
    startLoop();
  } else {
    stopLoop();
  }
  render();
}

function handleRestart() {
  state = createInitialState();
  stopLoop();
  render();
}

function handleDirection(direction) {
  state = setDirection(state, direction);
  render();
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    a: "left",
    A: "left",
    s: "down",
    S: "down",
    d: "right",
    D: "right"
  };

  if (event.code === "Space") {
    event.preventDefault();
    handlePauseToggle();
    return;
  }

  const direction = keyMap[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();

  if (state.status === "ready") {
    state = startGame(setDirection(state, direction));
    startLoop();
    render();
    return;
  }

  handleDirection(direction);
}

createBoard();
render();

startButton.addEventListener("click", handleStart);
pauseButton.addEventListener("click", handlePauseToggle);
restartButton.addEventListener("click", handleRestart);
document.addEventListener("keydown", handleKeydown);

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    const direction = button.getAttribute("data-direction");
    if (direction) {
      if (state.status === "ready") {
        state = startGame(setDirection(state, direction));
        startLoop();
        render();
        return;
      }

      handleDirection(direction);
    }
  });
}

function formatStatus(status) {
  switch (status) {
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "game-over":
      return "Game over";
    default:
      return "Ready";
  }
}
