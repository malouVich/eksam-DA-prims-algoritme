// =========================================
// GLOBAL VARIABLES
// =========================================

// Henter canvas-elementet fra HTML (det område hvor vi tegner labyrinten)
const canvas = document.getElementById("maze");

// Henter 2D drawing context – bruges til at tegne linjer, former osv.
const ctx = canvas.getContext("2d");

// Størrelsen af hver celle i labyrinten (i pixels)
const cellSize = 20;

// Antal rækker og kolonner i labyrinten – udregnes ud fra canvas-størrelsen
const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;

// 2D-array med alle celler i labyrinten
let grid = [];

// Liste med "edges" (kanter) i Prim’s algoritme
// Hver edge er et objekt: { cellA, cellB }
let frontierEdges = [];

// Boolean der bestemmer om algoritmen kører automatisk (autoplay)
let isAutoplay = false;

// Standardfarver til celler og vægge
const cellFillColor = "#fe64e278";
const wallColor = "#eb00fcff";

// Henter UI-elementer (knapper + slider)
const startBtn = document.getElementById("startBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const speedRange = document.getElementById("speedRange");

// Hastighed i autoplay (1–100)
let speed = 100;

// =========================================
// CLASS: Cell
// =========================================

class Cell {
  constructor(row, col) {
    // Gemmer celle-positionen i gridet
    this.row = row;
    this.col = col;

    // Hver celle starter med alle fire vægge intakte
    this.walls = { top: true, right: true, bottom: true, left: true };

    // Markerer om cellen allerede er en del af labyrinten
    this.visited = false;
  }

  draw(ctx, size) {
    // Beregn pixel-koordinater baseret på cellens placering og celle-størrelsen
    const x = this.col * size;
    const y = this.row * size;

    // Farv cellen hvis den er besøgt (visuelt feedback)
    if (this.visited) {
      ctx.fillRect(x, y, size, size);
    }

    // Tegn væggene som linjer
    ctx.beginPath();

    // Top-væg
    if (this.walls.top) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
    }

    // Højre-væg
    if (this.walls.right) {
      ctx.moveTo(x + size, y);
      ctx.lineTo(x + size, y + size);
    }

    // Bund-væg
    if (this.walls.bottom) {
      ctx.moveTo(x, y + size);
      ctx.lineTo(x + size, y + size);
    }

    // Venstre-væg
    if (this.walls.left) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + size);
    }

    ctx.stroke(); // Udfør tegningen
  }

  getUnvisitedNeighbors(grid, rows, cols) {
    const neighbors = [];

    // Fire retninger: op, højre, ned, venstre
    const directions = [
      { row: -1, col: 0 }, // op
      { row: 0, col: 1 }, // højre
      { row: 1, col: 0 }, // ned
      { row: 0, col: -1 }, // venstre
    ];

    // Tjek hver retning
    for (const dir of directions) {
      const newRow = this.row + dir.row;
      const newCol = this.col + dir.col;

      // Sørg for naboen er indenfor gridet
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        const neighbor = grid[newRow][newCol];

        // Kun naboer der IKKE er besøgt
        if (!neighbor.visited) {
          neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  removeWallBetween(other) {
    // Afstand mellem cellerne (bruges til at finde hvilken væg der skal fjernes)
    const dx = other.col - this.col;
    const dy = other.row - this.row;

    // Hvis other ligger til højre for denne celle
    if (dx === 1) {
      this.walls.right = false;
      other.walls.left = false;

      // Hvis other ligger til venstre
    } else if (dx === -1) {
      this.walls.left = false;
      other.walls.right = false;

      // Hvis other ligger nedenfor
    } else if (dy === 1) {
      this.walls.bottom = false;
      other.walls.top = false;

      // Hvis other ligger ovenfor
    } else if (dy === -1) {
      this.walls.top = false;
      other.walls.bottom = false;
    }
  }
}

// =========================================
// INITIALIZATION
// =========================================

function createGrid() {
  // Opretter et nyt tomt 2D-array der skal indeholde alle celler i labyrinten
  const newGrid = [];

  // Loop gennem alle rækker
  for (let row = 0; row < rows; row++) {
    // Hver række er selv et array
    newGrid[row] = [];

    // Loop gennem alle kolonner i rækken
    for (let col = 0; col < cols; col++) {
      // Opret en ny celle på (row, col)
      newGrid[row][col] = new Cell(row, col);
    }
  }

  // Returner det færdige grid med celler
  return newGrid;
}

function drawGrid() {
  // Ryd hele canvas før vi tegner det opdaterede grid
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sæt standardfarver til udfyldning og vægge
  ctx.fillStyle = cellFillColor;
  ctx.strokeStyle = wallColor;

  // Loop gennem alle celler og tegn dem én efter én
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Kald cellens egen draw()-funktion
      grid[row][col].draw(ctx, cellSize);
    }
  }
}

// =========================================
// PRIM'S MAZE GENERATION
// =========================================

// Starter Prim’s algoritme én gang og aktiverer autoplay
function startPrims() {
  // 1: vælg en tilfældig startcelle
  const startRow = Math.floor(Math.random() * rows);
  const startCol = Math.floor(Math.random() * cols);
  const startCell = grid[startRow][startCol];

  // 2: markér startcellen som besøgt
  startCell.visited = true;

  // 3: find dens unvisited naboer
  const neighbors = startCell.getUnvisitedNeighbors(grid, rows, cols);

  // 4: tilføj alle naboer til frontier-listen som "edges"
  //    Vi gemmer både cellA (den nuværende) og cellB (naboen)
  for (const neighbor of neighbors) {
    frontierEdges.push({ cellA: startCell, cellB: neighbor });
  }

  // 5: slå autoplay til og kør algoritmen
  isAutoplay = true;
  autoplayPrims();
}

// Ét step af algoritmen — enten ved autoplay eller manuel step-knap
function stepPrims() {
  // SPECIELT TILFÆLDE:
  // Hvis frontier er tom og ingen celler er besøgt → algoritmen er ikke startet endnu
  if (frontierEdges.length === 0 && !grid.flat().some((c) => c.visited)) {
    // Vælg en tilfældig startcelle
    const startRow = Math.floor(Math.random() * rows);
    const startCol = Math.floor(Math.random() * cols);
    const startCell = grid[startRow][startCol];
    startCell.visited = true;

    // Find dens naboer og tilføj dem til frontier
    const neighbors = startCell.getUnvisitedNeighbors(grid, rows, cols);
    for (const neighbor of neighbors) {
      frontierEdges.push({ cellA: startCell, cellB: neighbor });
    }

    // Tegn første start-setup
    drawGrid();
    return;
  }

  // 1: hvis frontier er tom → algoritmen er færdig → stop autoplay
  if (frontierEdges.length === 0) {
    isAutoplay = false;
    return;
  }

  // 2: vælg en tilfældig edge i frontier-listen
  const randomIndex = Math.floor(Math.random() * frontierEdges.length);

  // 3: fjern den fra listen (splice returnerer et array)
  const edge = frontierEdges.splice(randomIndex, 1)[0];

  // 4: hent cellA (besøgt) og cellB (u-besøgt)
  const { cellA, cellB } = edge;

  // 5: hvis cellB allerede er besøgt → dette edge er irrelevant
  if (cellB.visited) {
    // fortsæt autoplay, hvis det er aktivt
    if (isAutoplay) {
      setTimeout(autoplayPrims, speed);
    }
    return;
  }

  // 6a: fjern væggen mellem cellA og cellB
  cellA.removeWallBetween(cellB);

  // 6b: markér cellB som besøgt
  cellB.visited = true;

  // 6c: find cellB's u-besøgte naboer
  const neighbors = cellB.getUnvisitedNeighbors(grid, rows, cols);

  // 6d: tilføj alle disse naboer som nye "edges" i frontier
  for (const neighbor of neighbors) {
    frontierEdges.push({ cellA: cellB, cellB: neighbor });
  }

  // 7: tegn hele griddet igen for at vise den nye vej
  drawGrid();

  // Hvis autoplay kører, planlæg næste step
  if (isAutoplay) {
    setTimeout(autoplayPrims, 101 - speed);
  }
}

// Loop der styrer autoplay — kaldes kun af startPrims og stepPrims
function autoplayPrims() {
  // Hvis autoplay er slået fra → gør intet
  if (isAutoplay) {
    // Kør et step af algoritmen
    stepPrims();

    // Gentag efter et delay baseret på speed-slideren
    setTimeout(autoplayPrims, 101 - speed);
  }
}

// =========================================
// RESET
// =========================================

function resetMaze() {
  // 1: stop autoplay, så algoritmen ikke fortsætter efter reset
  isAutoplay = false;

  // 2: tøm frontier-listen så ingen gamle edges bliver brugt
  frontierEdges = [];

  // 3: opret et helt nyt grid med alle vægge genskabt
  grid = createGrid();

  // 4: tegn et frisk, “rent” grid uden nogen visited celler
  drawGrid();
}

// =========================================
// EVENT LISTENERS
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  // Når siden er klar → lav grid og vis det

  // 1: opret nyt grid
  grid = createGrid();

  // 2: tegn det første grid (alt er lukket og u-besøgt)
  drawGrid();

  // --- KNAPPER OG EVENTS ---

  // Start autoplay-versionen af Prim’s
  startBtn.addEventListener("click", startPrims);

  // Tag ét step ad gangen
  stepBtn.addEventListener("click", stepPrims);

  // Nulstil hele labyrinten
  resetBtn.addEventListener("click", resetMaze);

  // Justér speed når slideren ændres
  speedRange.addEventListener("input", (evt) => {
    // Parse værdien fra slideren (tekst → tal)
    speed = parseInt(evt.target.value);
  });
});
