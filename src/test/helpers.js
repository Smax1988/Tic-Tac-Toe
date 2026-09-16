"use strict";

import GameResult from '../scripts/game/GameResult.js';

const MARKS = { "1": 1, "2": 2, "_": 0 };

/**
 * Builds a board from a compact pattern: three lines of three characters each,
 * separated by "|", where "1" is X, "2" is O and "_" is an empty cell.
 * board("12_|_1_|__2") -> [[1, 2, 0], [0, 1, 0], [0, 0, 2]]
 * @param {string} pattern - The board as three rows, e.g. "12_|_1_|__2"
 * @returns {number[][]} The board
 */
export function board(pattern) {
    const rows = pattern.split("|");
    if (rows.length !== 3) {
        throw new Error(`Board pattern needs three rows separated by "|": "${pattern}"`);
    }
    return rows.map(row => {
        if (row.length !== 3) {
            throw new Error(`Board row needs three cells: "${row}"`);
        }
        return row.split("").map(cell => {
            if (!(cell in MARKS)) {
                throw new Error(`Board cell must be "1", "2" or "_", got "${cell}"`);
            }
            return MARKS[cell];
        });
    });
}

/**
 * Clears the static GameResult.winningLine, which survives between calls and is
 * only ever written while empty. Every test file calls this in a beforeEach,
 * otherwise a line left behind by one test silently changes the next.
 */
export function resetWinningLine() {
    GameResult.winningLine = [];
}
