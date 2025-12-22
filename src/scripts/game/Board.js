"use strict";
import GameResult from './GameResult.js';
import RandomColorAnimation from './RandomColorAnimation.js';
import Computer from './Computer.js';

/**
 * Manages the game state, board logic, and UI updates.
 * Handles player turns, computer moves, score tracking, and game reset.
 */
export default class Board {

    /**
     * Initializes the game board state and DOM references.
     * Board is represented as a 3x3 matrix: 0 = empty, 1 = X, 2 = O
     */
    constructor() {
        this.player = 1;
        this.computer = false;
        this.difficulty = "";
        this._board =
                        [
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0]
                        ];

        this.spaces = document.querySelectorAll(".spaces");
        this.result = document.querySelector("#game-result");
        this.player1 = document.getElementById("player-1");
        this.player2 = document.getElementById("player-2")
        this.totalWinsX = 0;
        this.totalWinsO = 0;
    }

    /**
     * Sets whether the opponent is a computer or human.
     * @param {boolean} trueORfalse - true for computer opponent, false for human
     */
    setComputer(trueORfalse) {
        switch (trueORfalse) {
            case true:
                this.computer = true;
                break;
            case false:
                this.computer = false;
                break;
            default:
                break;
        }
    }

    /**
     * Sets the computer difficulty level.
     * @param {string} mode - "easy", "normal", or "godlike"
     */
    setDifficulty(mode) {
        this.difficulty = mode;
    }

    /**
     * Switches the active player (1 -> 2 or 2 -> 1).
     */
    switchPlayer() {
        switch (this.player) {
            case 1:
                this.player = 2;
                break;
            case 2:
                this.player = 1;
                break;
            default:
                break;
        }
    }

    /**
     * Resets the board for a new game while keeping the score.
     */
    resetGame() {
        this.spaces.forEach(space => {
            space.innerHTML = "";
        })

        this._board =
        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.result.removeAttribute('style');
        this.spaces.forEach(space => space.removeAttribute('style'));
        GameResult.winningLine = [];
        this.player = 1;
        this.displayPlayer();
        document.getElementById("total-player-1").style.color = "white";
        document.getElementById("total-player-2").style.color = "white";
    }

    /**
     * Resets both players' win counts to zero.
     */
    resetTotalWins() {
        this.totalWinsO = 0;
        this.totalWinsX = 0;
        this.displayTotalWins();
    }

    /**
     * Places the current player's symbol (X or O) on the clicked cell.
     * @param {HTMLElement} space - The clicked button element
     */
    playerSetSymbol(space) {
            switch(this.player) {
                case 1:
                    space.innerHTML = "X";
                    space.style.color = "#29007A";
                    break;
                case 2:
                    space.innerHTML = "O";
                    space.style.color = "#C70554";
                    break;
                default:
                    break;
            }
        }

    /**
     * Executes the computer's move based on the selected difficulty.
     * Updates both the DOM and the internal board state.
     * @param {number[][]} board - Current board state
     */
    computerSetSymbol(board) {
        switch (this.difficulty) {
            case "easy":
                let choiceEasy = Computer.easyChooseSpace(board);
                document.getElementById(choiceEasy).innerHTML = "O";
                document.getElementById(choiceEasy).style.color = "#C70554";
                Board.writeToBoard(board, choiceEasy, this.player);
                break;
            case "normal":
                let choiceNormal = Computer.normalChooseSpace(board);
                document.getElementById(choiceNormal).innerHTML = "O";
                document.getElementById(choiceNormal).style.color = "#C70554";
                Board.writeToBoard(board, choiceNormal, this.player);
                break;
            case "godlike":
                let choiceGodlike = Computer.godlikeChooseSpace(this._board, this.player).id;
                document.getElementById(choiceGodlike).innerHTML = "O";
                document.getElementById(choiceGodlike).style.color = "#C70554";
                Board.writeToBoard(board, choiceGodlike, this.player);
                break;
            default:
                break;
        }
    }

    /**
     * Extracts the element ID from a click event.
     * @param {Event} event - The click event
     * @returns {string} The element's ID (e.g., "0-1", "2-2")
     */
    getElementId(event) {
        return event.target.id;
    }

    /**
     * Updates the board matrix with a player's move.
     * @param {number[][]} board - The board state matrix
     * @param {string} id - Cell ID in "row-col" format (e.g., "1-2")
     * @param {number} [player=0] - 1 for X, 2 for O, 0 to clear
     * @returns {number[][]} The updated board
     */
    static writeToBoard(board, id, player=0) {
        let arr = id.split("-");
        arr.map(element => parseInt(element));
        switch (player) {
            case 1:
                board[arr[0]][arr[1]] = 1;
                break;
            case 2:
                board[arr[0]][arr[1]] = 2;
                break;
            default:
                board[arr[0]][arr[1]] = 0;
                break;
        }
        return board;
    }

    /**
     * Updates the status display to show whose turn it is.
     */
    displayPlayer() {
        if (this.computer) {
            switch (this.player) {
                case 1:
                    this.result.innerHTML = "Your Turn";
                    break;
                case 2:
                    this.result.innerHTML = "Computer";
                    break;
                default:
                    break;
            }
        } else {
            switch (this.player) {
                case 1:
                    this.result.innerHTML = "Player X";
                    break;
                case 2:
                    this.result.innerHTML = "Player O";
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Updates the score display and shows the current difficulty level.
     * @param {number} [winner=0] - 0 = draw, 1 = X wins, 2 = O wins, -1 = ongoing
     */
    displayTotalWins(winner=0) {
        switch (winner) {
            case 1:
                this.totalWinsX++;
                document.querySelector("#total-player-1").innerHTML = this.totalWinsX;
                break;
            case 2:
                this.totalWinsO++;
                document.querySelector("#total-player-2").innerHTML = this.totalWinsO;
                break;
            default:
                document.querySelector("#total-player-2").innerHTML = this.totalWinsO;
                document.querySelector("#total-player-1").innerHTML = this.totalWinsX;
                break;
        }

        if (this.computer) {
            this.player1.innerHTML = "You";
            this.player2.innerHTML = "AI";
            switch (this.difficulty) {
                case "easy":
                    document.querySelector("#difficulty-display").innerHTML = "easy";
                    break;
                case "normal":
                    document.querySelector("#difficulty-display").innerHTML = "normal";
                    break;
                case "godlike":
                    document.querySelector("#difficulty-display").innerHTML = "godlike";
                    break;
                default:
                    break;
            }
        } else {
            this.player1.innerHTML = "Wins X";
            this.player2.innerHTML = "Wins O";
            document.getElementById('difficulty-display').innerHTML = "";
        }
    }

    /**
     * Displays the game result and triggers the win animation.
     * @param {number} winner - 0 = draw, 1 = X wins, 2 = O wins
     */
    displayGameResult(winner) {
        switch (winner) {
            case 0:
                this.result.innerHTML = "Draw!";
                RandomColorAnimation.startRepeatFunction(200, winner);
                break;
            case 1:
                if(this.computer) {
                    this.result.innerHTML = "You win!";
                    RandomColorAnimation.startRepeatFunction(200, winner);
                } else {
                    this.result.innerHTML = "Player X wins!";
                    RandomColorAnimation.startRepeatFunction(200, winner);
                }
                break;
            case 2:
                if (this.computer) {
                    this.result.innerHTML = "Computer wins!";
                    RandomColorAnimation.startRepeatFunction(200, winner);
                } else {
                    this.result.innerHTML = "Player O wins!";
                    RandomColorAnimation.startRepeatFunction(200, winner);
                }
                break;
            default:
                break;
        }
    }
}
