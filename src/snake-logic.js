export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const INITIAL_SNAKE = [
  { x: 2, y: 8 },
  { x: 1, y: 8 },
  { x: 0, y: 8 }
];

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createInitialState(randomFn = Math.random) {
  const snake = INITIAL_SNAKE.map((segment) => ({ ...segment }));
  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: placeFood(snake, GRID_SIZE, randomFn),
    score: 0,
    status: "ready"
  };
}

export function setDirection(state, direction) {
  if (!DIRECTION_VECTORS[direction]) {
    return state;
  }

  if (state.snake.length > 1 && OPPOSITE_DIRECTIONS[state.direction] === direction) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction
  };
}

export function stepGame(state, randomFn = Math.random) {
  if (state.status === "game-over" || state.status === "paused" || state.status === "ready") {
    return state;
  }

  const direction = getNextDirection(state.direction, state.nextDirection, state.snake.length);
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
  const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const currentBody = ateFood ? state.snake : state.snake.slice(0, -1);

  if (isWallCollision(nextHead, state.gridSize) || isSelfCollision(nextHead, currentBody)) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      status: "game-over"
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: direction,
    food: ateFood ? placeFood(nextSnake, state.gridSize, randomFn) : state.food,
    score: ateFood ? state.score + 1 : state.score
  };
}

export function startGame(state) {
  return {
    ...state,
    status: "running"
  };
}

export function togglePause(state) {
  if (state.status === "running") {
    return {
      ...state,
      status: "paused"
    };
  }

  if (state.status === "paused" || state.status === "ready") {
    return {
      ...state,
      status: "running"
    };
  }

  return state;
}

export function placeFood(snake, gridSize, randomFn = Math.random) {
  const occupied = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.min(
    openCells.length - 1,
    Math.floor(randomFn() * openCells.length)
  );
  return openCells[index];
}

function getNextDirection(currentDirection, nextDirection, snakeLength) {
  if (snakeLength > 1 && OPPOSITE_DIRECTIONS[currentDirection] === nextDirection) {
    return currentDirection;
  }

  return nextDirection;
}

function isWallCollision(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

function isSelfCollision(head, snake) {
  return snake.some((segment) => segment.x === head.x && segment.y === head.y);
}
