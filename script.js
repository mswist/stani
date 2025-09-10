(() => {
  const BOARD_SIZE = 3;
  const TILE_COUNT = BOARD_SIZE * BOARD_SIZE;
  const EMPTY = 0; // top-left slice is the empty tile

  const puzzleEl = document.getElementById('puzzle');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const resetBtn = document.getElementById('resetBtn');
  const movesEl = document.getElementById('moves');
  const statusEl = document.getElementById('status');

  let tiles = [...Array(TILE_COUNT).keys()]; // 0..8, where 0 is empty (top-left)
  let moveCount = 0;

  function indexToRowCol(index) {
    return { row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE };
  }

  function rowColToIndex(row, col) {
    return row * BOARD_SIZE + col;
  }

  function getNeighbors(emptyIndex) {
    const { row, col } = indexToRowCol(emptyIndex);
    const neighbors = [];
    if (row > 0) neighbors.push(rowColToIndex(row - 1, col));
    if (row < BOARD_SIZE - 1) neighbors.push(rowColToIndex(row + 1, col));
    if (col > 0) neighbors.push(rowColToIndex(row, col - 1));
    if (col < BOARD_SIZE - 1) neighbors.push(rowColToIndex(row, col + 1));
    return neighbors;
  }

  function isSolved(state) {
    for (let i = 0; i < TILE_COUNT; i++) {
      if (state[i] !== i) return false;
    }
    return true;
  }

  function countInversions(arr) {
    // Count inversions excluding the empty tile
    const flat = arr.filter(n => n !== EMPTY);
    let inversions = 0;
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }
    return inversions;
  }

  function isSolvable(state) {
    // For odd grid (3x3), solvable when inversions count is even
    return countInversions(state) % 2 === 0;
  }

  function shuffleState() {
    let state;
    do {
      state = [...Array(TILE_COUNT).keys()];
      for (let i = state.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state[i], state[j]] = [state[j], state[i]];
      }
    } while (!isSolvable(state) || isSolved(state));
    return state;
  }

  function updateMovesDisplay() {
    movesEl.textContent = `Moves: ${moveCount}`;
  }

  function render() {
    puzzleEl.innerHTML = '';
    const emptyIndex = tiles.indexOf(EMPTY);
    const movable = new Set(getNeighbors(emptyIndex));

    tiles.forEach((tileValue, positionIndex) => {
      const tile = document.createElement('button');
      tile.className = tileValue === EMPTY ? 'tile empty' : 'tile';
      tile.type = 'button';
      tile.setAttribute('data-pos', String(positionIndex));
      tile.setAttribute('aria-label', tileValue === EMPTY ? 'Empty' : `Tile ${tileValue + 1}`);
      tile.tabIndex = tileValue === EMPTY ? -1 : 0;

      // Position background slice according to tile value (original correct position)
      const { row, col } = indexToRowCol(tileValue);
      tile.style.backgroundPosition = `-${col * 100}% -${row * 100}%`;

      // Optional numeric label
      if (tileValue !== EMPTY) {
        const label = document.createElement('span');
        label.textContent = String(tileValue + 1);
        // label.style.padding = '6px 8px';
        tile.appendChild(label);
      }

      // Highlight movable tiles via cursor change
      if (movable.has(positionIndex)) {
        tile.style.cursor = 'pointer';
      } else {
        tile.style.cursor = 'not-allowed';
      }

      tile.addEventListener('click', () => onTileClick(positionIndex));
      tile.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevents scrolling on touch devices
        onTileClick(positionIndex);
      }, { passive: false });
      
      puzzleEl.appendChild(tile);
    });

    if (isSolved(tiles)) {
      statusEl.textContent = 'Solved! Great job!';
    } else {
      statusEl.textContent = '';
    }
  }

  function tryMove(positionIndex) {
    const emptyIndex = tiles.indexOf(EMPTY);
    const neighbors = getNeighbors(emptyIndex);
    if (!neighbors.includes(positionIndex)) return false;
    [tiles[emptyIndex], tiles[positionIndex]] = [tiles[positionIndex], tiles[emptyIndex]];
    moveCount += 1;
    updateMovesDisplay();
    render();
    return true;
  }

  function onTileClick(positionIndex) {
    if (isSolved(tiles)) return;
    tryMove(positionIndex);
  }

  function onTileKeydown(e, positionIndex) {
    if (isSolved(tiles)) return;
    const key = e.key;
    const { row, col } = indexToRowCol(positionIndex);

    let targetIndex = positionIndex;
    if (key === 'ArrowUp' && row > 0) targetIndex = rowColToIndex(row - 1, col);
    if (key === 'ArrowDown' && row < BOARD_SIZE - 1) targetIndex = rowColToIndex(row + 1, col);
    if (key === 'ArrowLeft' && col > 0) targetIndex = rowColToIndex(row, col - 1);
    if (key === 'ArrowRight' && col < BOARD_SIZE - 1) targetIndex = rowColToIndex(row, col + 1);

    if (targetIndex !== positionIndex) {
      e.preventDefault();
      // We want to move the tile in the arrow direction; simulate click on that tile
      tryMove(targetIndex);
    }
  }

  function reset() {
    tiles = [...Array(TILE_COUNT).keys()];
    moveCount = 0;
    updateMovesDisplay();
    render();
  }

  function shuffle() {
    tiles = shuffleState();
    moveCount = 0;
    updateMovesDisplay();
    render();
  }

  shuffleBtn.addEventListener('click', shuffle);
  resetBtn.addEventListener('click', reset);

  // Preload image then init
  const img = new Image();
  img.onload = () => {
    document.documentElement.style.setProperty('--image-loaded', '1');
    render();
  };
  img.onerror = () => {
    statusEl.textContent = 'Could not load picture.jpg. Make sure it is in this folder.';
    render();
  };
  img.src = window.__PUZZLE_IMAGE__ || 'picture.jpg';

  // Start solved with empty at top-left
  tiles = [...Array(TILE_COUNT).keys()];
  moveCount = 0;
  updateMovesDisplay();
})();



