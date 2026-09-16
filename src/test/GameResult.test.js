"use strict";

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import GameResult from '../scripts/game/GameResult.js';
import Computer from '../scripts/game/Computer.js';
import { board, resetWinningLine } from './helpers.js';

// GameResult.winningLine is static and survives between tests; _determine_winner
// only writes it while it is empty. Without this reset the suite would depend on
// execution order.
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

describe("get_rows", () => {

    it("reads an empty board as three empty lines", () => {
        assert.deepEqual(GameResult.get_rows(board("___|___|___")), ["000", "000", "000"]);
    });

    it("reads a mixed board row by row", () => {
        assert.deepEqual(GameResult.get_rows(board("12_|_1_|__2")), ["120", "010", "002"]);
    });

    it("reads a full board row by row", () => {
        assert.deepEqual(GameResult.get_rows(board("121|122|211")), ["121", "122", "211"]);
    });
});

describe("get_columns", () => {

    it("reads an empty board as three empty lines", () => {
        assert.deepEqual(GameResult.get_columns(board("___|___|___")), ["000", "000", "000"]);
    });

    it("reads a mixed board column by column", () => {
        assert.deepEqual(GameResult.get_columns(board("12_|_1_|__2")), ["100", "210", "002"]);
    });

    it("reads a full board column by column", () => {
        assert.deepEqual(GameResult.get_columns(board("121|122|211")), ["112", "221", "121"]);
    });
});

describe("get_diagonals", () => {

    it("reads an empty board as two empty lines", () => {
        assert.deepEqual(GameResult.get_diagonals(board("___|___|___")), ["000", "000"]);
    });

    it("reads a mixed board as main diagonal and anti-diagonal", () => {
        assert.deepEqual(GameResult.get_diagonals(board("12_|_1_|__2")), ["112", "010"]);
    });

    it("returns the main diagonal first and the anti-diagonal second", () => {
        // On "1_2|_1_|2_1" the main diagonal is all X and the anti-diagonal is
        // O-X-O. A board whose diagonals differ is the only way to pin the order.
        assert.deepEqual(GameResult.get_diagonals(board("1_2|_1_|2_1")), ["111", "212"]);
    });

    it("reads a full board as main diagonal and anti-diagonal", () => {
        assert.deepEqual(GameResult.get_diagonals(board("121|122|211")), ["121", "122"]);
    });
});

describe("_win_conditions", () => {

    it("reports no winner when no line is complete", () => {
        assert.equal(GameResult._win_conditions(["120", "001", "210"]), 0);
    });

    it("reports X for a line of X", () => {
        assert.equal(GameResult._win_conditions(["000", "111", "200"]), 1);
    });

    it("reports O for a line of O", () => {
        assert.equal(GameResult._win_conditions(["222", "100", "010"]), 2);
    });

    it("reports the player holding two complete lines", () => {
        assert.equal(GameResult._win_conditions(["111", "111", "000"]), 1);
    });

    // Observed behaviour, pinned rather than intended (decision 0002, item 7):
    // _win_conditions iterates with forEach and lets the last match overwrite the
    // previous one, so with one line per player the order of the lines decides.
    // A board holding a line for each player cannot arise in legal play, which is
    // why this has never mattered.
    it("lets the last complete line win when both players have one", () => {
        assert.equal(GameResult._win_conditions(["111", "222", "000"]), 2);
    });

    it("answers the other way round for the same lines reversed", () => {
        assert.equal(GameResult._win_conditions(["000", "222", "111"]), 1);
    });

    // The same peculiarity, seen through the public entry point.
    it("makes getGameResult report O on a board with a line for each player", () => {
        assert.equal(GameResult.getGameResult(board("111|222|___")), 2);
    });
});

describe("_determine_winner", () => {

    it("finds X in a row", () => {
        assert.equal(GameResult._determine_winner(board("111|22_|___")), 1);
    });

    it("finds X in a column", () => {
        assert.equal(GameResult._determine_winner(board("1_2|1_2|1__")), 1);
    });

    it("finds X on the main diagonal", () => {
        assert.equal(GameResult._determine_winner(board("1_2|_1_|2_1")), 1);
    });

    it("finds X on the anti-diagonal", () => {
        assert.equal(GameResult._determine_winner(board("2_1|_1_|1_2")), 1);
    });

    it("finds O in a row", () => {
        assert.equal(GameResult._determine_winner(board("222|11_|___")), 2);
    });

    it("finds O in a column", () => {
        assert.equal(GameResult._determine_winner(board("2_1|2_1|2__")), 2);
    });

    it("finds O on the main diagonal", () => {
        assert.equal(GameResult._determine_winner(board("2_1|_2_|1_2")), 2);
    });

    it("finds O on the anti-diagonal", () => {
        assert.equal(GameResult._determine_winner(board("1_2|_2_|2_1")), 2);
    });

    it("reports no winner on a full board without a complete line", () => {
        assert.equal(GameResult._determine_winner(board("121|122|211")), 0);
    });
});

describe("getGameResult", () => {

    it("reports an ongoing game on an empty board", () => {
        assert.equal(GameResult.getGameResult(board("___|___|___")), -1);
    });

    it("reports an ongoing game on a partly filled board", () => {
        assert.equal(GameResult.getGameResult(board("1_2|___|___")), -1);
    });

    it("reports a draw on a full board without a complete line", () => {
        assert.equal(GameResult.getGameResult(board("121|122|211")), 0);
    });

    it("reports X as the winner", () => {
        assert.equal(GameResult.getGameResult(board("111|22_|2__")), 1);
    });

    it("reports O as the winner", () => {
        assert.equal(GameResult.getGameResult(board("222|11_|1__")), 2);
    });

    it("reports a win on a board that is not yet full", () => {
        assert.equal(GameResult.getGameResult(board("1_2|1_2|1__")), 1);
    });
});

describe("winningLine", () => {

    // Observed behaviour, pinned rather than intended (decision 0002, item 2):
    // despite its name winningLine holds a category tag plus *all* lines of that
    // category, not the deciding line.
    it("records the category tag and every line of that category", () => {
        GameResult.getGameResult(board("111|__2|__2"));
        assert.deepEqual(GameResult.winningLine, ["row", ["111", "002", "002"]]);
    });

    it("tags a win in a column with \"cols\"", () => {
        GameResult.getGameResult(board("1_2|1_2|1__"));
        assert.deepEqual(GameResult.winningLine, ["cols", ["111", "000", "220"]]);
    });

    it("tags a win on a diagonal with \"diags\"", () => {
        GameResult.getGameResult(board("1_2|_2_|2_1"));
        assert.deepEqual(GameResult.winningLine, ["diags", ["121", "222"]]);
    });

    it("stays empty while no game is decided", () => {
        GameResult.getGameResult(board("12_|_1_|__2"));
        assert.deepEqual(GameResult.winningLine, []);
    });

    // The same peculiarity: winningLine is written only while empty, so the first
    // win recorded survives every later one until something resets it.
    it("is not overwritten while it still holds a line", () => {
        GameResult.getGameResult(board("111|__2|__2"));
        GameResult.getGameResult(board("2_1|2_1|2__"));
        assert.deepEqual(GameResult.winningLine, ["row", ["111", "002", "002"]]);
    });

    // The same peculiarity: the reset sits in two unrelated places, one of them
    // in the middle of the Minimax loop.
    it("is cleared as a side effect of godlikeChooseSpace on an undecided board", () => {
        GameResult.winningLine = ["row", ["111", "000", "000"]];
        Computer.godlikeChooseSpace(board("11_|22_|___"), 2);
        assert.deepEqual(GameResult.winningLine, []);
    });

    it("survives godlikeChooseSpace on a decided board", () => {
        // There the base case returns before the loop, so its reset never runs.
        GameResult.winningLine = ["row", ["111", "000", "000"]];
        Computer.godlikeChooseSpace(board("111|22_|___"), 2);
        assert.deepEqual(GameResult.winningLine, ["row", ["111", "000", "000"]]);
    });
});
