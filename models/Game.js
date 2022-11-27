const GRID = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const winPositions = new Set([
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]);

const isSuperset = (set, subset) => {
  for (const elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
};

const getRandomItem = (arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

class Game {
  constructor(id, player1, player2) {
    this.id = id;
    const p1 = getRandomItem([player1, player2]);
    const p2 = player1.id === p1.id ? player2 : player1;
    this.player1 = p1;
    this.player2 = p2;
    this.moves = { [p1.id]: [], [p2.id]: [] };
    this.currentPlayer = player1;
    this.winner = undefined;
  }

  moveIsImpossible = (move) => {
    return (
      (this.moves[this.player1.id].includes(move) ||
        this.moves[this.player2.id].includes(move)) &&
      !GRID.includes(move)
    );
  };

  switchPlayers = () => {
    this.currentPlayer =
      this.currentPlayer.id === this.player1.id ? this.player2 : this.player1;
  };

  decideGameOver = () => {
    const currentPlayerMoves = this.moves[this.currentPlayer.id];
    if (currentPlayerMoves.length < 3) return false;
    const moveSet = new Set(currentPlayerMoves);
    for (const winPosition of winPositions) {
      const gameOver = isSuperset(moveSet, winPosition);
      if (gameOver) {
        this.winner = this.currentPlayer.id;
        return gameOver;
      }
    }
  };

  makeMove = (move) => {
    if (this.moveIsImpossible(move)) {
      return;
    }
    this.moves[this.currentPlayer.id].push(move);
    this.decideGameOver() || this.switchPlayers();
  };

  flatMoves = () => {
    const p1Moves = this.moves[this.player1.id];
    const p2Moves = this.moves[this.player2.id];
    let result = [];
    for (const cell of GRID) {
      if (p1Moves.includes(cell)) {
        result.push('x');
        continue;
      }
      if (p2Moves.includes(cell)) {
        result.push('o');
        continue;
      }
      result.push('');
    }
    return result;
  };
}

module.exports = Game;
