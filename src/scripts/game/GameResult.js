"use strict";
/**
 * Determines the game state: winner, draw, or ongoing.
 * Also tracks the winning line for the victory animation.
 */
export default class GameResult {

    static winningLine = [];

    /**
     * Evaluates the current game state.
     * @param {number[][]} board - The game board (0 = empty, 1 = X, 2 = O)
     * @returns {number} -1 = ongoing, 0 = draw, 1 = X wins, 2 = O wins
     */
    static getGameResult(board) {
        let arr = [];
        board.forEach(element => {
            element.forEach(ele => {
                arr.push(ele);
            })
        })

        if (this._determine_winner(board) === 0 && arr.includes(0)) {
            return -1; // Game still in progress
        } else return this._determine_winner(board);
    }

    /**
     * Checks all rows, columns, and diagonals for a winner.
     * Stores the winning line for the victory animation.
     * @param {number[][]} board - The game board
     * @returns {number} 0 = draw/no winner, 1 = X wins, 2 = O wins
     */
    static _determine_winner(board) {
        let rows = GameResult.get_rows(board);
        let cols = GameResult.get_columns(board);
        let diags = GameResult.get_diagonals(board);
        let winner = 0;

        // Check for X (player 1) wins
        if (this._win_conditions(rows) === 1) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("row", rows);
            }
            winner = 1;
        } else if (this._win_conditions(cols) === 1) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("cols", cols);
            }
            winner = 1;
        } else if (this._win_conditions(diags) === 1) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("diags", diags);
            }
            winner = 1;
        }

        // Check for O (player 2) wins
        if (this._win_conditions(rows) === 2) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("row", rows);
            }
            winner = 2;
        } else if (this._win_conditions(cols) === 2) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("cols", cols);
            }
            winner = 2;
        } else if (this._win_conditions(diags) === 2 ) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("diags", diags);
            }
            winner = 2;
        }
        return winner;
    }

    /**
     * Checks if any line contains three matching symbols.
     * @param {string[]} direction - Array of lines (rows, cols, or diags as strings)
     * @returns {number} 0 = no winner, 1 = X wins, 2 = O wins
     */
    static _win_conditions(direction) {
        let winner = 0;
        direction.forEach(ele => {
            if (ele[0] === "1" && ele[1]  === "1" && ele[2] === "1") {
                winner = 1;
            } else if (ele[0] === "2" && ele[1]  === "2" && ele[2] === "2") {
                winner = 2;
            }
        });
        return winner;
    }

    /**
     * Extracts all rows from the board as strings.
     * @param {number[][]} board - The game board
     * @returns {string[]} Array of row strings (e.g., ["120", "001", "210"])
     */
    static get_rows(board) {
        let rows = [];
        board.forEach(element => {rows.push(element.join(""))});
        return rows;
    }

    /**
     * Extracts all columns from the board as strings.
     * @param {number[][]} board - The game board
     * @returns {string[]} Array of column strings
     */
    static get_columns(board) {
        let cols = [];
        let col1 = [];
        let col2 = [];
        let col3 = [];
        for (let i = 0; i < board.length; i++) {
            col1.push(board[i][0].toString())
        }
        col1 = col1.join("");
        for (let i = 0; i < board.length; i++) {
            col2.push(board[i][1].toString())
        }
        col2 = col2.join("");
        for (let i = 0; i < board.length; i++) {
            col3.push(board[i][2].toString())
        }
        col3 = col3.join("");
        cols.push(col1, col2, col3);
        return cols;
    }

    /**
     * Extracts both diagonals from the board as strings.
     * @param {number[][]} board - The game board
     * @returns {string[]} Array of diagonal strings [main, anti]
     */
    static get_diagonals(board) {
        let diags = [];
        let diag1 = [board[0][0].toString(), board[1][1].toString(), board[2][2].toString()];
        let diag2 = [board[0][2].toString(), board[1][1].toString(), board[2][0].toString()];
        diags.push(diag1.join(""), diag2.join(""));
        return diags;
    }
}
