"use strict";

import HtmlCreator from './HtmlCreator.js';
import Board from './Board.js';
import GameResult from './GameResult.js';
import RandomColorAnimation from './RandomColorAnimation.js';

/**
 * Main entry point for the Tic Tac Toe game.
 * Handles initialization, creates the UI, and sets up all event listeners
 * for user interaction. Uses the Board class for game state management.
 */
export default class TicTacToe {

    /**
     * Initializes the game by creating the HTML layout and attaching event listeners.
     * @param {HTMLElement} [elementToPrependGame=document.body] - Container element for the game.
     * @param {string} [cssFile="./src/styles/styles.css"] - Path to the CSS stylesheet.
     */
    static initialize(elementToPrependGame = document.body, cssFile = "./src/styles/styles.css") {

        // Create the HTML structure
        HtmlCreator.createGame(elementToPrependGame, cssFile);

        const board = new Board();
        let winner = -1;

        // Menu overlay elements
        const overlay = document.querySelector(".overlay");
        const computerButton = document.querySelector("#computer");
        const human = document.querySelector("#human");
        const difficulty = document.querySelector(".difficulty");
        const easy = document.querySelector("#easy");
        const normal = document.querySelector("#normal");
        const godlike = document.querySelector("#godlike");
        const closeMenu = document.querySelector("#bt-cancel");

        // Game area buttons
        const newGame = document.querySelector("#bt-new-game");
        const menu = document.querySelector("#bt-menu");

        // --- Menu overlay event handlers ---

        // Close menu button
        closeMenu.addEventListener("click", () => {
            overlay.style.display = "none";
        });

        // Toggle difficulty submenu
        computerButton.addEventListener("click", () => {
            if (difficulty.style.visibility === "hidden") {
                difficulty.style.visibility = "visible";
            } else {
                difficulty.style.visibility = "hidden";
            }
        });

        // Difficulty: Easy - random moves
        easy.addEventListener("click", () => {
            board.setComputer(true);
            board.setDifficulty("easy");
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });

        // Difficulty: Normal - blocks wins and takes winning moves
        normal.addEventListener("click", () => {
            board.setComputer(true);
            board.setDifficulty("normal");
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });

        // Difficulty: Godlike - unbeatable (Minimax algorithm)
        godlike.addEventListener("click", () => {
            board.setComputer(true);
            board.setDifficulty("godlike");
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });

        // Human vs Human mode
        human.addEventListener("click", () => {
            board.setComputer(false);
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });

        // --- Game board click handlers ---

        board.spaces.forEach(space => {
            space.addEventListener("click", (event) => {

                // Ignore clicks on occupied cells or if game is over
                if (space.innerHTML === "X" ||
                    space.innerHTML === "O" ||
                    [1, 2].includes(GameResult.getGameResult(board._board))
                    ) return;

                if (board.computer) {
                    // Player makes a move
                    board.playerSetSymbol(space);
                    let id = board.getElementId(event);
                    Board.writeToBoard(board._board, id, board.player);
                    board.switchPlayer();
                    board.displayPlayer();

                    // Computer responds if game is still ongoing
                    if (GameResult.getGameResult(board._board) === -1) {
                        board.computerSetSymbol(board._board);
                        board.switchPlayer();
                        board.displayPlayer();
                    }

                } else {
                    // Human vs Human: alternate turns
                    board.playerSetSymbol(space);
                    let id = board.getElementId(event);
                    Board.writeToBoard(board._board, id, board.player);
                    board.switchPlayer();
                    board.displayPlayer();
                }

                // Check for winner and update display
                winner = GameResult.getGameResult(board._board);
                if (winner !== -1) {
                    board.displayGameResult(winner);
                    board.displayTotalWins(winner);
                }
            })
        });

        // --- Game area button handlers ---

        // New Game button - reset board but keep scores
        newGame.addEventListener("click", () => {
            RandomColorAnimation.stopRepeatFunction();
            board.resetGame();
        })

        // Menu button - open overlay
        menu.addEventListener("click", () => {
            overlay.removeAttribute("style");
            difficulty.style.visibility = "hidden";
        });
    }
}
