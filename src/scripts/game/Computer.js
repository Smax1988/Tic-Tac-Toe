"use strict";

import GameResult from './GameResult.js';
import Board from './Board.js';

/**
 * AI opponent logic for all difficulty levels.
 * Provides strategies from random moves (easy) to unbeatable Minimax (godlike).
 */
export default class Computer {

    /**
     * Returns all empty cells on the board.
     * @param {number[][]} board - The game board (0 = empty, 1 = X, 2 = O)
     * @returns {string[]} Array of cell IDs (e.g., ["0-1", "2-2"])
     */
    static getEmptySpaces(board) {
        let emptySpaces = [];

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === 0) {
                    emptySpaces.push(`${board.indexOf(board[i])}-${j}`);
                }
            }
        }
        return emptySpaces;
    }

    /**
     * Selects a random cell from available empty spaces.
     * @param {string[]} emptySpaces - Array of empty cell IDs
     * @returns {string} Randomly selected cell ID
     */
    static chooseRandom(emptySpaces) {
        const random_number = () => Math.floor(Math.random() * (emptySpaces.length));
         return emptySpaces[random_number()];
    }


    /**
     * Finds cells that would complete a winning line for either player.
     * Used by the "normal" difficulty to block opponent wins and take winning moves.
     * @param {number[][]} board - The game board
     * @returns {Object[]} Array of {player, elementID} for potential winning moves
     */
    static getElementIDNeededToWin(board) {

        // Collect all rows, columns, and diagonals
        let allLines = {
            "row": GameResult.get_rows(board),
            "column": GameResult.get_columns(board),
            "diagonal": GameResult.get_diagonals(board)
        };

        let collection = [];

        // Find lines with 2 matching symbols and 1 empty space
        for (const property in allLines) {
            allLines[property].forEach(line => {
                let countOnes = line.replace(/[^1]/g, "").length;
                let countTwos = line.replace(/[^2]/g, "").length;
                const almostWon = {
                    player: 0,
                    line: "",
                    indexOfLine: 0,
                    values: ""
                };
                if (countOnes === 2 && line.includes(0)) {
                    almostWon['player'] = 1;
                    almostWon['line'] = property;
                    almostWon['indexOfLine'] = allLines[property].indexOf(line);
                    almostWon['values'] = line.split("");
                    collection.push(almostWon);
                } else if (countTwos === 2 && line.includes(0)) {
                    almostWon['player'] = 2;
                    almostWon['line'] = property;
                    almostWon['indexOfLine'] = allLines[property].indexOf(line);
                    almostWon['values'] = line.split("");
                    collection.push(almostWon);
                }
            });
        }

        // Convert line info to cell IDs
        let ids = [];
        collection.forEach(object => {
            const obj = {
                player: "",
                elementID: ""
            }
            if (object["line"] === "row") {
                obj['player'] = object['player'];
                obj['elementID'] = `${object['indexOfLine']}-${object['values'].indexOf("0")}`;
                ids.push(obj);
            } else if (object["line"] === "column") {
                obj['player'] = object['player'];
                obj['elementID'] = `${object['values'].indexOf("0")}-${object['indexOfLine']}`;
                ids.push(obj);
            } else if (object["line"] === "diagonal") {
                if (object['indexOfLine'] === 0) {
                    // Main diagonal (top-left to bottom-right)
                    switch (object['values'].indexOf("0")) {
                        case 0:
                            obj['player'] = object['player'];
                            obj['elementID'] = "0-0";
                            ids.push(obj);
                            break;
                        case 1:
                            obj['player'] = object['player'];
                            obj['elementID'] = "1-1";
                            ids.push(obj);
                            break;
                        case 2:
                            obj['player'] = object['player'];
                            obj['elementID'] = "2-2";
                            ids.push(obj);
                            break;
                        default:
                            break;
                    }
                } else if (object['indexOfLine'] === 1) {
                    // Anti-diagonal (top-right to bottom-left)
                    switch (object['values'].indexOf("0")) {
                        case 0:
                            obj['player'] = object['player'];
                            obj['elementID'] = "0-2";
                            ids.push(obj);
                            break;
                        case 1:
                            obj['player'] = object['player'];
                            obj['elementID'] = "1-1";
                            ids.push(obj);
                            break;
                        case 2:
                            obj['player'] = object['player'];
                            obj['elementID'] = "2-0";
                            ids.push(obj);
                            break;
                        default:
                            break;
                    }
                }
            }
        })
        return ids;
    }

    /**
     * Easy difficulty: picks a random empty cell.
     * @param {number[][]} board - The game board
     * @returns {string} Cell ID for the move
     */
    static easyChooseSpace(board) {
        return Computer.chooseRandom(this.getEmptySpaces(board))
    }

    /**
     * Normal difficulty: blocks opponent wins and takes winning moves.
     * Falls back to random if no tactical moves available.
     * Prioritizes own wins over blocking opponent.
     * @param {number[][]} board - The game board
     * @returns {string} Cell ID for the move
     */
    static normalChooseSpace(board) {
        let elementIDsNeededToWin = this.getElementIDNeededToWin(board);
        let choice;
        if (GameResult.getGameResult(board) === -1) {
            if (elementIDsNeededToWin.length === 0) {
                return this.easyChooseSpace(board);
            } else if (elementIDsNeededToWin.length !== 0) {
                // First, look for blocking moves (opponent about to win)
                elementIDsNeededToWin.forEach(object => {
                    if (object['player'] === 1) {
                        choice = object['elementID'];
                    }
                })
                // Then, prioritize winning moves (overrides blocking)
                elementIDsNeededToWin.forEach(object => {
                    if (object['player'] === 2) {
                        choice = object['elementID'];
                    }
                })
            }
        }
        return choice;
    }

    /**
     * Godlike difficulty: uses Minimax algorithm for optimal play.
     * Computer (O) is the maximizer, Player (X) is the minimizer.
     * @param {number[][]} currentBoard - The game board
     * @param {number} player - Current player (1 = X, 2 = O)
     * @returns {Object} Best move with {id, evaluation}
     */
    static godlikeChooseSpace(currentBoard, player) {
        // Base cases: return evaluation if game is over
        if (GameResult.getGameResult(currentBoard) === 1) {
            return {evaluation: -1}; // X wins = bad for computer
        } else if (GameResult.getGameResult(currentBoard) === 2) {
            return {evaluation: 1};  // O wins = good for computer
        } else if (GameResult.getGameResult(currentBoard) === 0) {
            return {evaluation: 0};  // Draw
        }

        let emptySpaces = this.getEmptySpaces(currentBoard);
        let moves = [];

        // Evaluate each possible move
        for (let i = 0; i < emptySpaces.length; i++) {
            let id = emptySpaces[i];
            let move = {};
            move.id = id;

            let saveMoveID = id;

            // Make the move
            Board.writeToBoard(currentBoard, id, player);

            // Recursively evaluate (alternate players)
            if (player === 2) {
                move.evaluation = (this.godlikeChooseSpace(currentBoard, 1)).evaluation;
            } else {
                move.evaluation = (this.godlikeChooseSpace(currentBoard, 2)).evaluation;
            }

            moves.push(move);

            // Undo the move
            Board.writeToBoard(currentBoard, saveMoveID);

            // Reset winning line (used for animations)
            GameResult.winningLine = [];
        }

        // Minimax: find best move
        let bestMove;

        if (player === 2) {
            // Computer is maximizer
            let bestEvaluation = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].evaluation > bestEvaluation) {
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        } else {
            // Player is minimizer
            let bestEvaluation = +Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].evaluation < bestEvaluation) {
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }
        return bestMove;
    }
}
