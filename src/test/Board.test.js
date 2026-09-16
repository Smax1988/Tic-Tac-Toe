"use strict";

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import Board from '../scripts/game/Board.js';
import GameResult from '../scripts/game/GameResult.js';
import { board, resetWinningLine } from './helpers.js';

// GameResult.winningLine is static and survives between tests. writeToBoard does
// not touch it, but the reset keeps this file independent of the others and of
// its own execution order.
beforeEach(resetWinningLine);

describe("the winningLine reset", () => {

    // These two tests only make sense together and in this order: the first
    // leaves state behind, the second proves the beforeEach cleared it. A single
    // test cannot observe its own beforeEach.
    it("leaves a filled winningLine behind", () => {
        GameResult.winningLine = ["row", ["111", "000", "000"]];
        assert.equal(GameResult.winningLine.length, 2);
    });

    it("starts the next test with an empty winningLine", () => {
        assert.deepEqual(GameResult.winningLine, []);
    });
});

describe("writeToBoard", () => {

    it("writes an X into the named cell", () => {
        assert.deepEqual(Board.writeToBoard(board("___|___|___"), "1-2", 1), board("___|__1|___"));
    });

    it("writes an O into the named cell", () => {
        assert.deepEqual(Board.writeToBoard(board("___|___|___"), "2-0", 2), board("___|___|2__"));
    });

    it("clears the cell when no player is given", () => {
        assert.deepEqual(Board.writeToBoard(board("12_|_1_|__2"), "0-1"), board("1__|_1_|__2"));
    });

    it("changes the board it was given in place", () => {
        const currentBoard = board("___|___|___");
        Board.writeToBoard(currentBoard, "0-0", 1);
        assert.deepEqual(currentBoard, board("1__|___|___"));
    });

    it("returns the very board it was given", () => {
        const currentBoard = board("___|___|___");
        assert.equal(Board.writeToBoard(currentBoard, "0-0", 1), currentBoard);
    });

    // Observed behaviour, pinned rather than intended (decision 0002, item 1):
    // writeToBoard throws away the result of its own map, so both indices stay
    // strings. The right cell is hit only because array indexing coerces them.
    it("hits the right cell although the indices stay strings", () => {
        const currentBoard = board("___|___|___");
        const arr = "2-1".split("-");
        assert.deepEqual(arr, ["2", "1"]);
        Board.writeToBoard(currentBoard, "2-1", 2);
        assert.equal(currentBoard[2][1], 2);
        assert.deepEqual(currentBoard, board("___|___|_2_"));
    });
});
