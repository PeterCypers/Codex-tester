import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  placeFood,
  setDirection,
  startGame,
  stepGame
} from "../src/snake-logic.js";

test("moves the snake one cell in the active direction", () => {
  const runningState = startGame(createInitialState(() => 0));
  const nextState = stepGame(runningState, () => 0);

  assert.deepEqual(nextState.snake[0], { x: 3, y: 8 });
  assert.equal(nextState.score, 0);
});

test("eating food grows the snake and increases score", () => {
  const state = startGame(createInitialState(() => 0));
  const withFoodAhead = {
    ...state,
    food: { x: 3, y: 8 }
  };

  const nextState = stepGame(withFoodAhead, () => 0);

  assert.equal(nextState.snake.length, state.snake.length + 1);
  assert.equal(nextState.score, 1);
  assert.notDeepEqual(nextState.food, withFoodAhead.food);
});

test("rejects immediate reverse direction for a multi-segment snake", () => {
  const state = startGame(createInitialState(() => 0));
  const updatedState = setDirection(state, "left");
  const nextState = stepGame(updatedState, () => 0);

  assert.equal(nextState.direction, "right");
  assert.deepEqual(nextState.snake[0], { x: 3, y: 8 });
});

test("detects wall collisions as game over", () => {
  const state = {
    ...startGame(createInitialState(() => 0)),
    snake: [{ x: 15, y: 0 }],
    direction: "right",
    nextDirection: "right",
    food: { x: 0, y: 0 }
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.status, "game-over");
});

test("detects self-collision as game over", () => {
  const state = {
    ...startGame(createInitialState(() => 0)),
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
      { x: 3, y: 1 }
    ],
    direction: "up",
    nextDirection: "right",
    food: { x: 10, y: 10 }
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.status, "game-over");
});

test("placeFood never chooses an occupied cell", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ];

  const food = placeFood(snake, 4, () => 0);

  assert.deepEqual(food, { x: 3, y: 0 });
});
