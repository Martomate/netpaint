import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";
import { Universe, Cell } from "wasm-game-of-life";

const CELL_SIZE = 2; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = CELL_SIZE * height;
canvas.width = CELL_SIZE * width;

const ctx = canvas.getContext("2d");

let animationId = null;

let lastDrawRow = null;
let lastDrawCol = null;

const renderLoop = () => {
  universe.tick();

  //drawGrid();
  drawCells();

  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

let eraseMode = false;

const tryDraw = () => {
  const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / CELL_SIZE), height - 1);
    const col = Math.min(Math.floor(canvasLeft / CELL_SIZE), width - 1);

    const startRow = lastDrawRow !== null ? lastDrawRow : row;
    const startCol = lastDrawCol !== null ? lastDrawCol : col;

    universe.draw_line(startRow, startCol, row, col, eraseMode ? Cell.Dead : Cell.Alive);

    lastDrawRow = row;
    lastDrawCol = col;

    //drawGrid();
    drawCells();
};

canvas.addEventListener('mousedown', event => {
  tryDraw();
});

canvas.addEventListener('mousemove', event => {
  if (event.buttons) {
    tryDraw();
  } else {
    lastDrawRow = null;
    lastDrawCol = null;
  }
});

const eraseCheckbox = document.getElementById("erase");
eraseCheckbox.addEventListener('change', event => {
  eraseMode = eraseCheckbox.checked;
});

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, CELL_SIZE * height);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * CELL_SIZE);
    ctx.lineTo(CELL_SIZE * width, j * CELL_SIZE);
  }

  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

      ctx.fillRect(
        col * CELL_SIZE,
        row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

play()
