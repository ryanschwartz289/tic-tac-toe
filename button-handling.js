import { TicTacToe } from "./tictactoe.js";
let ws;
let playerId;
let isMyTurn = false;
let gameOver = false;
const roomId =
  new URLSearchParams(window.location.search).get("room") ||
  Math.random().toString(36).substring(7);

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
  gameOver = true;
  match.forEach((button) => {
    button.style.backgroundColor = "#4CAF50";
    buttons.forEach((button) => {
      button.disabled = true;
    });
  });
  resultHeader.style.color = "#4CAF50";
  const winner = match[0].textContent;
  const isYourWin = winner === playerId;
  resultHeader.textContent = isYourWin ? "You won!" : "Opponent won!";

  startResetCountdown();
}

// Add this new function after handleWinner
function handleTie() {
  gameOver = true;
  buttons.forEach((button) => {
    button.disabled = true;
  });
  resultHeader.style.color = "white";
  resultHeader.textContent = "It's a tie!";
  startResetCountdown();
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
  tictactoe.board = setBoardHelper();
  resultHeader.textContent = "";
  gameOver = false;
  // Keep the same playerId but reset turn based on it
  isMyTurn = playerId === "X";
  updateTurnIndicator();
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
  if (!isMyTurn || gameOver) return;

  const position = Array.from(buttons).indexOf(button);

  button.disabled = true;
  button.style.color = "black";
  button.textContent = playerId; // Use playerId instead of currentCharacter
  tictactoe.board = setBoardHelper();
  const match = tictactoe.checkMatch();

  if (match) {
    handleWinner(match);
  } else if (tictactoe.board.flat().every((element) => element.textContent)) {
    handleTie();
    ws.send(
      JSON.stringify({
        type: "tie",
      })
    );
  }

  ws.send(
    JSON.stringify({
      type: "move",
      position: position,
      symbol: playerId, // Send the player's symbol
    })
  );

  isMyTurn = false;
  updateTurnIndicator();
}

function handleOpponentMove(position, symbol) {
  const button = buttons[position];
  button.disabled = true;
  button.textContent = symbol; // This is the opponent's symbol
  button.style.color = "black";
  tictactoe.board = setBoardHelper();
  const match = tictactoe.checkMatch();

  if (match) {
    handleWinner(match);
  } else if (tictactoe.board.flat().every((element) => element.textContent)) {
    handleTie();
  }

  isMyTurn = true;
  updateTurnIndicator();
}

/**
 * Handles the mouse entering a button.
 * Temporarily shows the current player's symbol in grey color
 * if the button is not disabled, as a hover preview.
 *
 * @param {HTMLButtonElement} button - The button element being hovered over.
 */
function mouseEnter(button) {
  if (!button.disabled && isMyTurn) {
    button.style.color = "grey";
    button.textContent = playerId; // Use playerId instead of currentCharacter
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

// Add new constant for reset delay
const countdownElement = document.getElementById("countdown");
const RESET_DELAY = 3000;
const COUNTDOWN_STEPS = 3;

function startResetCountdown() {
  let timeLeft = COUNTDOWN_STEPS;
  countdownElement.classList.add("visible");

  const countdown = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdown);
      countdownElement.classList.remove("visible");
      ws.send(JSON.stringify({ type: "reset" }));
      resetBoard();
      return;
    }

    countdownElement.textContent = `New game in ${timeLeft}...`;
    timeLeft--;
  }, 1000);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => handleButtonClick(button));
  button.addEventListener("mouseenter", () => mouseEnter(button));
  button.addEventListener("mouseleave", () => mouseLeave(button));
});

// Initialize WebSocket connection
function initializeWebSocket() {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${window.location.host}`;
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "join",
        roomId: roomId,
      })
    );
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "start":
        playerId = data.playerId;
        isMyTurn = playerId === "X";
        updateTurnIndicator();
        break;

      case "move":
        // Use the opposite symbol of the player's ID
        const opponentSymbol = data.symbol || (playerId === "X" ? "O" : "X");
        handleOpponentMove(data.position, opponentSymbol);
        break;

      case "reset":
        resetBoard();
        break;

      case "tie":
        handleTie();
        break;
    }
  };
}

function updateTurnIndicator() {
  if (gameOver) return; // Don't update if game is over

  resultHeader.style.color = "white";
  resultHeader.textContent = isMyTurn
    ? "Your turn!"
    : "Waiting for opponent...";
}

// Add to the bottom of file
initializeWebSocket();

// Update URL with room ID
if (!window.location.search.includes("room")) {
  window.history.replaceState({}, "", `?room=${roomId}`);
}
