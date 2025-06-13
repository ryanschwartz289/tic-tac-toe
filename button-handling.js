import { TicTacToe } from "./tictactoe.js";
/**
 * Converts a flat list of button elements into a 2D array representing
 * a 3×3 Tic Tac Toe board layout.
 *
 * @function
 * @returns {Array<Array<HTMLButtonElement>>} A 2D array of button elements, grouped into rows.
 */
function setBoardHelper() {
  let output = [];
  const board = Array.from(buttons);
  for (let i = 0; i < board.length; i += 3) {
    output.push(board.slice(i, i + 3));
  }
  return output;
}

/**
 * Handles the visual update when a winning combination is found.
 * Highlights the winning buttons and resets the game board.
 *
 * @function
 * @param {Array<HTMLButtonElement>} match - An array of winning button elements.
 */
function handleWinner(match) {
  match.forEach((button) => {
    button.style.backgroundColor = "#4CAF50";
    buttons.forEach((button) => {
      button.disabled = true;
    });
  });
  resultHeader.style.color = "#4CAF50";
  resultHeader.textContent = `${match[0].textContent} wins!`;
}

/**
 * Resets the Tic Tac Toe board to its initial state.
 *
 * - Enables all buttons and clears their text content.
 * - Resets the current player character to 'X'.
 * - Updates the internal game board representation using `setBoardHelper()`.
 *
 * @function
 */
function resetBoard() {
  buttons.forEach((button) => {
    button.disabled = false;
    button.textContent = "";
    button.style.backgroundColor = initialButtonBackground;
    button.style.color = "black";
  });
  currentCharacter = "X";
  tictactoe.board = setBoardHelper();
  resultHeader.textContent = "";
}
/**
 * Handles the logic when a Tic Tac Toe grid button is clicked.
 *
 * - Disables the clicked button and sets its text to the current player's symbol.
 * - Updates the game board state.
 * - Checks for a winning match or a tie.
 * - If a winner is found, triggers the win handler.
 * - If the board is full and no winner is found, declares a tie.
 * - Otherwise, switches the current player.
 *
 * @function
 * @param {HTMLButtonElement} button - The button element that was clicked.
 */
function handleButtonClick(button) {
  button.disabled = true;
  button.style.color = "black";
  button.textContent = currentCharacter;
  tictactoe.board = setBoardHelper();
  const match = tictactoe.checkMatch();

  if (match) {
    handleWinner(match);
  } else if (tictactoe.board.flat().every((element) => element.textContent)) {
    resultHeader.style.color = "white";
    resultHeader.textContent = "It's a tie!";
  } else {
    currentCharacter = currentCharacter === "X" ? "O" : "X";
  }
}

/**
 * Handles the mouse entering a button.
 * Temporarily shows the current player's symbol in grey color
 * if the button is not disabled, as a hover preview.
 *
 * @param {HTMLButtonElement} button - The button element being hovered over.
 */
function mouseEnter(button) {
  if (!button.disabled) {
    button.style.color = "grey";
    button.textContent = currentCharacter;
  }
}

/**
 * Handles the mouse leaving a button.
 * Clears the button text if it was showing the hover preview (grey color).
 *
 * @param {HTMLButtonElement} button - The button element the mouse left.
 */
function mouseLeave(button) {
  if (button.style.color === "grey") {
    button.textContent = "";
  }
}

const buttons = document.querySelectorAll(".grid-container button");
const resetButton = document.getElementById("reset-button");
const resultHeader = document.getElementById("result-header");

const initialButtonBackground = buttons[0].style.backgroundColor;

const tictactoe = new TicTacToe(setBoardHelper());
let currentCharacter = "X";

buttons.forEach((button) => {
  button.addEventListener("click", () => handleButtonClick(button));
  button.addEventListener("mouseenter", () => mouseEnter(button));
  button.addEventListener("mouseleave", () => mouseLeave(button));
});

resetButton.addEventListener("click", resetBoard);
