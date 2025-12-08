const canvas = document.getElementById("maze");

const ctx = canvas.getContext("2d");

const cellSize = 20;

const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;

let grid = [];

let frontierEdges = [];

let isAutoplay = false;

const cellFillColor = "#fe64e278";
const wallColor = "#eb00fcff";

const startBtn = document.getElementById("startBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const speedRange = document.getElementById("speedRange");

let speed = 100;

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;

    this.walls = { top: true, right: true, bottom: true, left: true };

    this.visited = false;
  }

  draw(ctx, size) {
    const x = this.col * size;
    const y = this.row * size;

    if (this.visited) {
      ctx.fillRect(x, y, size, size);
    }

    ctx.beginPath();

    if (this.walls.top) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
    }

    if (this.walls.right) {
      ctx.moveTo(x + size, y);
      ctx.lineTo(x + size, y + size);
    }

    if (this.walls.bottom) {
      ctx.moveTo(x, y + size);
      ctx.lineTo(x + size, y + size);
    }

    if (this.walls.left) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + size);
    }

    ctx.stroke();
  }

  getUnvisitedNeighbors(grid, rows, cols) {
    const neighbors = [];

    const directions = [
      { row: -1, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
    ];

    for (const dir of directions) {
      const newRow = this.row + dir.row;
      const newCol = this.col + dir.col;

      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        const neighbor = grid[newRow][newCol];

        if (!neighbor.visited) {
          neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  removeWallBetween(other) {
    const dx = other.col - this.col;
    const dy = other.row - this.row;

    if (dx === 1) {
      this.walls.right = false;
      other.walls.left = false;
    } else if (dx === -1) {
      this.walls.left = false;
      other.walls.right = false;
    } else if (dy === 1) {
      this.walls.bottom = false;
      other.walls.top = false;
    } else if (dy === -1) {
      this.walls.top = false;
      other.walls.bottom = false;
    }
  }
}

function createGrid() {
  const newGrid = [];

  for (let row = 0; row < rows; row++) {
    newGrid[row] = [];

    for (let col = 0; col < cols; col++) {
      newGrid[row][col] = new Cell(row, col);
    }
  }

  return newGrid;
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = cellFillColor;
  ctx.strokeStyle = wallColor;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid[row][col].draw(ctx, cellSize);
    }
  }
}

function startPrims() {
  const startRow = Math.floor(Math.random() * rows);
  const startCol = Math.floor(Math.random() * cols);
  const startCell = grid[startRow][startCol];

  startCell.visited = true;

  const neighbors = startCell.getUnvisitedNeighbors(grid, rows, cols);

  for (const neighbor of neighbors) {
    frontierEdges.push({ cellA: startCell, cellB: neighbor });
  }

  isAutoplay = true;
  autoplayPrims();
}

function stepPrims() {
  if (frontierEdges.length === 0 && !grid.flat().some((c) => c.visited)) {
    const startRow = Math.floor(Math.random() * rows);
    const startCol = Math.floor(Math.random() * cols);
    const startCell = grid[startRow][startCol];
    startCell.visited = true;

    const neighbors = startCell.getUnvisitedNeighbors(grid, rows, cols);
    for (const neighbor of neighbors) {
      frontierEdges.push({ cellA: startCell, cellB: neighbor });
    }

    drawGrid();
    return;
  }

  if (frontierEdges.length === 0) {
    isAutoplay = false;
    return;
  }

  const randomIndex = Math.floor(Math.random() * frontierEdges.length);

  const edge = frontierEdges.splice(randomIndex, 1)[0];

  const { cellA, cellB } = edge;

  if (cellB.visited) {
    if (isAutoplay) {
      setTimeout(autoplayPrims, speed);
    }
    return;
  }

  cellA.removeWallBetween(cellB);

  cellB.visited = true;

  const neighbors = cellB.getUnvisitedNeighbors(grid, rows, cols);

  for (const neighbor of neighbors) {
    frontierEdges.push({ cellA: cellB, cellB: neighbor });
  }

  drawGrid();

  if (isAutoplay) {
    setTimeout(autoplayPrims, 101 - speed);
  }
}

function autoplayPrims() {
  if (isAutoplay) {
    stepPrims();

    setTimeout(autoplayPrims, 101 - speed);
  }
}

function resetMaze() {
  isAutoplay = false;

  frontierEdges = [];

  grid = createGrid();

  drawGrid();
}

document.addEventListener("DOMContentLoaded", () => {
  grid = createGrid();

  drawGrid();

  startBtn.addEventListener("click", startPrims);

  stepBtn.addEventListener("click", stepPrims);

  resetBtn.addEventListener("click", resetMaze);

  speedRange.addEventListener("input", (evt) => {
    speed = parseInt(evt.target.value);
  });
});
