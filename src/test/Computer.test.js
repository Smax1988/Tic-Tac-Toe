"use strict";

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import Computer from '../scripts/game/Computer.js';
import GameResult from '../scripts/game/GameResult.js';
import { board, resetWinningLine } from './helpers.js';

// GameResult.winningLine is static and survives between tests; godlikeChooseSpace
// both reads and writes it. Without this reset the suite would depend on
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

describe("getEmptySpaces", () => {

    it("lists all nine cells of an empty board in row order", () => {
        assert.deepEqual(Computer.getEmptySpaces(board("___|___|___")), [
            "0-0", "0-1", "0-2",
            "1-0", "1-1", "1-2",
            "2-0", "2-1", "2-2"
        ]);
    });

    it("lists nothing on a full board", () => {
        assert.deepEqual(Computer.getEmptySpaces(board("121|122|211")), []);
    });

    it("lists exactly the free cells of a mixed board", () => {
        assert.deepEqual(Computer.getEmptySpaces(board("12_|_1_|__2")), ["0-2", "1-0", "1-2", "2-0", "2-1"]);
    });

    // Observed behaviour, pinned rather than intended (decision 0002, item 4):
    // the row index comes from board.indexOf(board[i]) instead of i, which only
    // works because each row is a distinct object. A board built from one shared
    // row array reports every free cell as being in row 0.
    it("reports every free cell in row 0 when all rows are the same object", () => {
        const row = [0, 1, 0];
        assert.deepEqual(Computer.getEmptySpaces([row, row, row]), [
            "0-0", "0-2",
            "0-0", "0-2",
            "0-0", "0-2"
        ]);
    });
});

describe("chooseRandom", () => {

    it("picks the first cell when Math.random returns 0", (t) => {
        t.mock.method(Math, 'random', () => 0);
        assert.equal(Computer.chooseRandom(["0-0", "1-1", "2-2"]), "0-0");
    });

    it("picks the last cell when Math.random returns almost 1", (t) => {
        t.mock.method(Math, 'random', () => 0.999);
        assert.equal(Computer.chooseRandom(["0-0", "1-1", "2-2"]), "2-2");
    });

    it("picks the only cell of a one-element list", (t) => {
        t.mock.method(Math, 'random', () => 0.5);
        assert.equal(Computer.chooseRandom(["1-1"]), "1-1");
    });

    // Observed behaviour, pinned rather than intended (decision 0002, item 6):
    // an empty list yields undefined instead of an error. In play this is masked,
    // because an ongoing game always has a free cell.
    it("returns undefined for an empty list", () => {
        assert.equal(Computer.chooseRandom([]), undefined);
    });
});

describe("easyChooseSpace", () => {

    it("always answers with one of the free cells", () => {
        const currentBoard = board("12_|_1_|__2");
        const emptySpaces = Computer.getEmptySpaces(currentBoard);
        for (let i = 0; i < 50; i++) {
            assert.ok(emptySpaces.includes(Computer.easyChooseSpace(currentBoard)));
        }
    });

    it("picks the first free cell when Math.random returns 0", (t) => {
        t.mock.method(Math, 'random', () => 0);
        assert.equal(Computer.easyChooseSpace(board("12_|_1_|__2")), "0-2");
    });

    // Same peculiarity as chooseRandom on an empty list (decision 0002, item 6).
    it("returns undefined on a full board", () => {
        assert.equal(Computer.easyChooseSpace(board("121|122|211")), undefined);
    });
});

describe("getElementIDNeededToWin", () => {

    it("finds a threat in a row", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("11_|___|___")), [
            { player: 1, elementID: "0-2" }
        ]);
    });

    it("finds a threat in a row with the gap in the middle", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("1_1|___|___")), [
            { player: 1, elementID: "0-1" }
        ]);
    });

    it("finds a threat in a column", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("1__|1__|___")), [
            { player: 1, elementID: "2-0" }
        ]);
    });

    it("finds a threat in a column with the gap in the middle", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("_1_|___|_1_")), [
            { player: 1, elementID: "1-1" }
        ]);
    });

    it("finds a threat on the main diagonal with the gap at the top left", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("___|_1_|__1")), [
            { player: 1, elementID: "0-0" }
        ]);
    });

    it("finds a threat on the main diagonal with the gap in the middle", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("1__|___|__1")), [
            { player: 1, elementID: "1-1" }
        ]);
    });

    it("finds a threat on the main diagonal with the gap at the bottom right", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("1__|_1_|___")), [
            { player: 1, elementID: "2-2" }
        ]);
    });

    it("finds a threat on the anti-diagonal with the gap at the top right", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("___|_1_|1__")), [
            { player: 1, elementID: "0-2" }
        ]);
    });

    it("finds a threat on the anti-diagonal with the gap in the middle", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("__1|___|1__")), [
            { player: 1, elementID: "1-1" }
        ]);
    });

    it("finds a threat on the anti-diagonal with the gap at the bottom left", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("__1|_1_|___")), [
            { player: 1, elementID: "2-0" }
        ]);
    });

    it("finds a threat of O just as one of X", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("2__|_2_|___")), [
            { player: 2, elementID: "2-2" }
        ]);
    });

    it("finds the threats of both players at once", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("11_|22_|___")), [
            { player: 1, elementID: "0-2" },
            { player: 2, elementID: "1-2" }
        ]);
    });

    it("finds nothing on a board without a threat", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("1__|_2_|___")), []);
    });

    // Observed behaviour, pinned rather than intended (decision 0002, item 5):
    // the line is located with indexOf(line), so two identical lines of the same
    // category both resolve to the first one's index. On "11_|11_|___" the threat
    // of the second row comes back with the CellId of the first. It never reaches
    // the player: the wrong index points at the identical twin line, whose gap
    // sits at the same offset, so the cell is a real threat cell anyway.
    it("reports both identical rows with the CellId of the first", () => {
        assert.deepEqual(Computer.getElementIDNeededToWin(board("11_|11_|___")), [
            { player: 1, elementID: "0-2" },
            { player: 1, elementID: "0-2" },
            { player: 1, elementID: "2-0" },
            { player: 1, elementID: "2-0" },
            { player: 1, elementID: "2-2" }
        ]);
    });
});

describe("normalChooseSpace", () => {

    it("falls back to a free cell when there is no threat", () => {
        const currentBoard = board("1__|_2_|___");
        const emptySpaces = Computer.getEmptySpaces(currentBoard);
        assert.ok(emptySpaces.includes(Computer.normalChooseSpace(currentBoard)));
    });

    it("blocks a threat of the opponent", () => {
        assert.equal(Computer.normalChooseSpace(board("11_|2__|___")), "0-2");
    });

    it("takes its own threat", () => {
        assert.equal(Computer.normalChooseSpace(board("22_|1__|__1")), "0-2");
    });

    it("prefers its own threat over blocking", () => {
        // X threatens at "0-2", O at "1-2" — O takes the win.
        assert.equal(Computer.normalChooseSpace(board("11_|22_|___")), "1-2");
    });

    // Observed behaviour, pinned rather than intended (decision 0002, item 3):
    // once the game is decided nothing assigns to `choice` and undefined comes
    // back. In play this is masked, because the only caller sits behind a check
    // for an ongoing game.
    it("returns undefined once the game is decided", () => {
        assert.equal(Computer.normalChooseSpace(board("111|___|___")), undefined);
    });
});

describe("godlikeChooseSpace", () => {

    it("rates a position won for O as 1", () => {
        assert.equal(Computer.godlikeChooseSpace(board("22_|1_1|___"), 2).evaluation, 1);
    });

    it("rates a drawn position as 0", () => {
        assert.equal(Computer.godlikeChooseSpace(board("1_2|21_|___"), 2).evaluation, 0);
    });

    it("rates a position won for X as -1", () => {
        assert.equal(Computer.godlikeChooseSpace(board("11_|2__|___"), 2).evaluation, -1);
    });

    it("rates the empty board as a draw", () => {
        // The one full-depth test in the suite: from the empty board Minimax runs
        // about 1.5 to 2 seconds, so every other test starts from a position with
        // at least two moves played.
        assert.equal(Computer.godlikeChooseSpace(board("___|___|___"), 2).evaluation, 0);
    });

    it("answers with a CellId and an evaluation while the game is open", () => {
        const move = Computer.godlikeChooseSpace(board("22_|1_1|___"), 2);
        // Tie-break: among equally rated moves the first in getEmptySpaces order
        // wins, and "0-2" is both the first free cell and the winning one.
        assert.deepEqual(move, { id: "0-2", evaluation: 1 });
    });

    it("answers without a CellId once the game is decided", () => {
        // The base case returns before the loop over the free cells.
        assert.deepEqual(Computer.godlikeChooseSpace(board("111|22_|___"), 2), { evaluation: -1 });
    });

    it("answers without a CellId on a board won by O", () => {
        assert.deepEqual(Computer.godlikeChooseSpace(board("222|11_|___"), 2), { evaluation: 1 });
    });

    it("answers without a CellId on a drawn board", () => {
        assert.deepEqual(Computer.godlikeChooseSpace(board("121|122|211"), 2), { evaluation: 0 });
    });

    it("takes the first equally rated move, not the obvious one", () => {
        // Tie-break: "1-2" would win at once, but "0-2" comes first in
        // getEmptySpaces order and is rated just as highly, because after "0-2"
        // O wins anyway. The test pins the selection rule, not good play.
        assert.deepEqual(Computer.godlikeChooseSpace(board("11_|22_|___"), 2), { id: "0-2", evaluation: 1 });
    });

    it("takes the first equally rated move even in a lost position", () => {
        // Tie-break: X threatens at "2-2", but every move is rated -1, so the
        // first free cell "0-1" wins the comparison.
        assert.deepEqual(Computer.godlikeChooseSpace(board("1_2|_2_|11_"), 2), { id: "0-1", evaluation: -1 });
    });

    it("chooses for X through the minimizer branch", () => {
        // player = 1 is the only way to reach the minimizer branch directly; the
        // other tests only touch it through the recursion.
        assert.deepEqual(Computer.godlikeChooseSpace(board("11_|22_|___"), 1), { id: "0-2", evaluation: -1 });
    });

    it("leaves the board it was given unchanged", () => {
        const currentBoard = board("11_|22_|___");
        Computer.godlikeChooseSpace(currentBoard, 2);
        assert.deepEqual(currentBoard, board("11_|22_|___"));
    });
});
