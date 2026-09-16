# Tests pin current behaviour, including the odd parts

Reading the code before writing tests, and then measuring it, turned up eight places that work by
accident rather than by design. None of them is being fixed as part of this work: the tests describe
what the code does today, and each of these gets a test stating the present behaviour plainly, with a
comment saying it is observed rather than intended.

Seven are observable and therefore pinnable:

1. **`Board.writeToBoard`** discards the result of its own `map`. The cell index arrives as a string
   and hits the right cell only because array indexing coerces it.
2. **`GameResult.winningLine`** is mutable static state that survives between games, written only
   while empty, and reset from two different modules — `Board.resetGame` and, mid-loop,
   `Computer.godlikeChooseSpace`. Despite the name it holds a category tag plus every line of that
   category, not the deciding line.
3. **`Computer.normalChooseSpace`** returns `undefined` once the game is decided. It never reaches
   the DOM: `Board.computerSetSymbol` has exactly one caller, and it sits behind
   `if (GameResult.getGameResult(board._board) === -1)` in `TicTacToe.js:117`. The broken promise is
   real, the harm is masked by that one guard.
4. **`Computer.getEmptySpaces`** derives the row index with `board.indexOf(board[i])` instead of `i`.
   It only works because each row is a distinct object; boards built from one shared row array
   report every empty cell as being in row 0.
5. **`Computer.getElementIDNeededToWin`** locates a line with `indexOf(line)`. Two identical lines in
   the same category both resolve to the first one's index, so the second threat comes back with the
   wrong CellId. It never produces an *invalid* move: an exhaustive sweep of all 19 683 boards found
   no position where `normalChooseSpace` answers with an occupied cell, a non-threat cell, or a miss
   of an available winning cell — the wrong index points at the identical twin line, whose gap sits
   at the same offset. But the CellId set differs on 416 boards, of which **34 are reachable in
   legal play**, so fixing this changes which cell the computer picks there. Unlike 1, 4 and 8, it
   is not a behaviour-neutral repair.
6. **`Computer.chooseRandom`** and `easyChooseSpace` return `undefined` on a full board. Masked by
   the same guard: an ongoing game always has an empty Cell.
7. **`GameResult._win_conditions`** iterates with `forEach` and lets the last match win, so its
   answer depends on line order: `["111","222","000"]` gives 2, the same lines reversed give 1.
   A board with a line for each player is unreachable in legal play, which is why it has never
   mattered.

One cannot be pinned at all: `getElementIDNeededToWin` searches a string for the number `0`, and
`includes(0)` is indistinguishable from `includes("0")` after coercion. It is recorded here and
deliberately has no test — there is no behaviour to assert.

## Consequences

The suite is a safety net for changing this code, not a specification of how tic tac toe ought to
work. A later fix to any of these is expected to change a test — that is the signal working as
designed, not a regression.

None of these is urgent. Number 5 looks like the one that should be fixed, and the exhaustive sweep
is the reason it is not: the code is wrong in a way that never reaches the player. Fixing any of
them before the tests exist would mean changing behaviour with nothing to catch the change, which is
the wrong order; the test that pins each one is what makes a later fix safe.
