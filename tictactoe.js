/**
 * Represents a Tic Tac Toe game.
 * @class
 * @param {Array<Array<string>>} board - A 2D array of strings representing the game board.
 */
export class TicTacToe {
  constructor(board) {
    this.board = board;
  }
  getBoardText() {
    return this.board.map((row) => row.map((button) => button.textContent));
  }
  _checkDiagonals() {
    const board = this.board;
    const boardText = this.getBoardText();
    if (
      boardText[0][0] &&
      boardText[0][0] === boardText[1][1] &&
      boardText[1][1] === boardText[2][2]
    ) {
      return [board[0][0], board[1][1], board[2][2]];
    }
    if (
      boardText[0][2] &&
      boardText[0][2] === boardText[1][1] &&
      boardText[1][1] === boardText[2][0]
    ) {
      return [board[0][2], board[1][1], board[2][0]];
    }
    return null;
  }

  _checkHorizontal() {
    const board = this.board;
    const boardText = this.getBoardText();
    for (let i = 0; i < 3; i++) {
      if (
        boardText[i][0] &&
        boardText[i][0] === boardText[i][1] &&
        boardText[i][1] === boardText[i][2]
      ) {
        return [board[i][0], board[i][1], board[i][2]];
      }
    }
    return null;
  }

  _checkVertical() {
    const board = this.board;
    const boardText = this.getBoardText();
    for (let i = 0; i < 3; i++) {
      if (
        boardText[0][i] &&
        boardText[0][i] === boardText[1][i] &&
        boardText[1][i] === boardText[2][i]
      ) {
        return [board[0][i], board[1][i], board[2][i]];
      }
    }
    return null;
  }

  /**
   * Checks for a winning match in the Tic Tac Toe game by examining horizontal, vertical, and diagonal lines.
   * @returns {(Array<string>|null)} An array of the winning values if there's a win, or null if not.
   */
  checkMatch() {
    return (
      this._checkHorizontal() ||
      this._checkVertical() ||
      this._checkDiagonals() ||
      null
    );
  }
}
