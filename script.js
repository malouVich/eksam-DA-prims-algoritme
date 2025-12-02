// =========================================
// GLOBAL VARIABLES
// =========================================

// TODO: hent canvas-elementet
// TODO: hent canvas contexten
// TODO: definer cell-size (fx 20px)
// TODO: beregn rows og cols ud fra canvas størrelse og cell-size
// TODO: lav et 2D array til celler
// TODO: lav en liste til "frontier edges" til Prim's algorithm
// TODO: lav en variabel der holder styr på, om algoritmen kører i autoplay
// TODO: hent knapper (startBtn, stepBtn, resetBtn, speedRange)

// =========================================
// CLASS: Cell
// =========================================

class Cell {
  constructor(row, col) {
    // TODO: gem row + col
    // TODO: lav object med vægge: top, right, bottom, left → alle true
    // TODO: lav visited-flag (start false)
  }

  draw(ctx, size) {
    // TODO: tegn cellen:
    // - tegn væggene som linjer hvis de er true
    // - evt. farv visited celler i en farve
  }

  getUnvisitedNeighbors(grid, rows, cols) {
    // TODO:
    // 1: tjek alle fire naboer (over, højre, under, venstre)
    // 2: filtrer kun dem der er indenfor grid og IKKE visited
    // 3: returner listen
  }

  removeWallBetween(other) {
    // TODO:
    // 1: find dx = other.col - this.col
    // 2: find dy = other.row - this.row
    // 3: hvis dx == 1 → fjern this.right + other.left
    // 4: hvis dx == -1 → fjern this.left + other.right
    // 5: hvis dy == 1 → fjern this.bottom + other.top
    // 6: hvis dy == -1 → fjern this.top + other.bottom
  }
}

// =========================================
// INITIALIZATION
// =========================================

function createGrid() {
  // TODO:
  // 1: lav tomt 2D array
  // 2: for hver row og col → opret en Cell og læg i grid
  // 3: return grid
}

function drawGrid() {
  // TODO:
  // 1: clear canvas
  // 2: loop gennem alle celler og kald draw()
}

// =========================================
// PRIM'S MAZE GENERATION
// =========================================

function startPrims() {
  // TODO:
  // 1: vælg en tilfældig startcelle
  // 2: sæt visited = true
  // 3: find dens ikke-besøgte naboer
  // 4: tilføj naboer til frontier-listen SOM EDGES (gem (current, neighbor))
  // 5: slå autoplay til
}

function stepPrims() {
  // TODO:
  // 1: hvis frontier-listen er tom → stop autoplay
  // 2: vælg en tilfældig edge fra frontier (random index)
  // 3: fjern edge fra frontier-listen
  // 4: hent (cellA, cellB) fra edge
  // 5: hvis cellB er besøgt: SPRING over (continue)
  // 6: ellers:
  //    a) fjern væg mellem cellA og cellB
  //    b) sæt cellB.visited = true
  //    c) find cellB’s unvisited neighbors
  //    d) tilføj dem som nye edges til frontier
  // 7: tegn grid igen
}

function autoplayLoop() {
  // TODO:
  // 1: hvis autoplay er false → return
  // 2: lave et step (stepPrims())
  // 3: beregne delay ud fra speedRange
  // 4: køre autoplay igen med setTimeout
}

// =========================================
// RESET
// =========================================

function resetMaze() {
  // TODO:
  // 1: stop autoplay
  // 2: nulstil frontier-listen
  // 3: lav et nyt grid via createGrid()
  // 4: tegn igen
}

// =========================================
// EVENT LISTENERS
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  // TODO:
  // 1: hent canvas, ctx, knapper
  // 2: lav grid = createGrid()
  // 3: tegn grid første gang
  // START BTN
  // TODO: startBtn.addEventListener("click", startPrims)
  // STEP BTN
  // TODO: stepBtn.addEventListener("click", stepPrims)
  // RESET BTN
  // TODO: resetBtn.addEventListener("click", resetMaze)
  // SPEED RANGE
  // TODO: speedRange.addEventListener("input", (evt) => opdatér hastighed)
});
