# Testsuite für die Spiellogik — Implementierungsplan

**Erstellt:** 16.09.2026

> **For agentic workers:** REQUIRED SUB-SKILL: Use smax:subagent-driven-development (recommended) or smax:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine Testsuite über `GameResult`, `Computer` und `Board.writeToBoard`, die das heutige Verhalten festschreibt und mit `npm test` aus `src/` ohne Installation läuft.

**Architecture:** Charakterisierungstests gegen bestehenden, unveränderten Produktionscode. Drei Testdateien nach Modul, ein gemeinsamer `helpers.js` mit Brett-Baukasten und Zustands-Reset. Kein DOM, keine Abhängigkeiten.

**Tech Stack:** Node 22+ (Entwicklung auf 24), `node:test`, `node:assert/strict`, ES-Module.

**Spec:** `docs/01_Specs/TestSuite/SPEC-TestSuite-16092026.md`

## Global Constraints

- **Terminology is defined in `CONTEXT.md`.** Namen in Tests, Beschreibungen und Kommentaren benutzen den kanonischen Begriff — Board, Cell, CellId, Line, Mark, Player, Difficulty, Threat, Outcome, WinningLine. Eine Abweichung ist ein Defekt, keine Stilfrage. Die unter `_Avoid_` gelisteten Varianten dürfen nicht auftauchen. Fehlt ein Begriff, kommt er ins Glossar, nicht in den Code.
- **Node 22 oder neuer**, `engines.node` sagt `>=22`. Nicht 18: den Glob `test/*.test.js` löst Nodes Test-Runner auf, nicht die Shell, und cmd.exe globbt gar nicht.
- **`docs/decisions/0001-node-test-runner-no-dependencies.md`** — der Runner ist `node --test`. Eine Test- oder Assertion-Bibliothek zu ergänzen, weil etwas damit bequemer wäre, ist ein Defekt, keine Verbesserung. `npm install` darf nie nötig werden.
- **`docs/decisions/0002-tests-pin-current-behaviour.md`** — die Tests schreiben das heutige Verhalten fest, auch wo es falsch aussieht. Produktionscode in `src/scripts/` zu reparieren, weil beim Testschreiben ein Fehler auffällt, ist ein Defekt, keine Aufräumarbeit. Solche Tests tragen einen Kommentar, der auf 0002 verweist.
- **`docs/decisions/0003-package-json-stays-in-src.md`** — `package.json` bleibt in `src/`, das Testskript zählt seine Dateien auf. Auf bloßes `node --test` zu wechseln, weil es kürzer ist, zieht `helpers.js` als Testdatei mit hinein.

## Charakterisierungstests: der Zyklus ist ein anderer

**Klassisches TDD gilt hier nicht.** Der Produktionscode existiert bereits; ein Test, der sein Verhalten beschreibt, ist sofort grün. Damit sagt sein Grün zunächst gar nichts — er könnte genauso gut nichts prüfen.

Der Ersatz für „erst rot sehen" ist die **Mutationsprobe**: den Produktionscode absichtlich kaputtmachen, sehen, dass der neue Test rot wird, und die Änderung zurücknehmen. Jede Aufgabe unten nennt ihre Mutation konkret.

```
1. Test schreiben, mit dem gemessenen Erwartungswert
2. Laufen lassen  -> muss GRÜN sein (das Verhalten gibt es schon)
3. Mutationsprobe -> Produktionscode brechen, Test muss ROT werden
4. Zurücknehmen   -> git checkout -- <datei>
5. Laufen lassen  -> wieder GRÜN
6. Committen
```

**Schritt 3 ist nicht optional.** Ohne ihn entsteht eine Suite aus grünen Tests, von denen niemand weiß, ob sie etwas halten. Wird ein Test bei seiner Mutation nicht rot, ist der Test falsch — nicht die Mutation.

### Warum eine grüne Suite hier trotzdem ehrlich ist

Ein Charakterisierungstest behauptet nicht „das ist richtig", sondern „das tut der Code heute". Grün heißt: unverändert, nicht: in Ordnung. Damit das nicht nur im Kommentar steht, sondern in der Testausgabe, kommt in **Task 10** eine eigene Datei dazu: je Defekt ein `test(..., { todo: ... })`, der das **gewünschte** Verhalten beschreibt und deshalb heute fehlschlägt.

Nachgemessen: `todo`-Tests zählen in `# todo`, nicht in `# pass`, `# fail` bleibt 0 und der Exitcode 0. Alle `# pass N` unten bleiben davon unberührt. Wer die Suite laufen lässt, sieht `todo 5` und weiß, dass Baustellen offen sind.

Alle Erwartungswerte in diesem Plan sind am echten Code gemessen, nicht hergeleitet.

## Dateien

| Datei | Verantwortung |
|---|---|
| `src/package.json` | ändern: Testskript und `engines` |
| `src/test/helpers.js` | Brett-Baukasten `board()`, Zustands-Reset `resetGameState()` |
| `src/test/helpers.test.js` | prüft den Baukasten selbst, dient zugleich als Rauchtest der Discovery |
| `src/test/Board.test.js` | `Board.writeToBoard` |
| `src/test/GameResult.test.js` | Linienzerlegung, Siegerkennung, WinningLine |
| `src/test/Computer.test.js` | Cells, Zufall, Threats, `normalChooseSpace`, `godlikeChooseSpace` |
| `src/test/defects.test.js` | fünf der bekannten Defekte als `todo`-Tests: was der Code tun *sollte* |

Alle Kommandos laufen aus `C:\Projects\Tic-Tac-Toe\src`.

---

### Task 1: Testgerüst

**Files:**
- Modify: `src/package.json`
- Create: `src/test/helpers.js`
- Create: `src/test/helpers.test.js`

**Interfaces:**
- Consumes: nichts
- Produces: `board(pattern: string): number[][]` und `resetGameState(): void` aus `./helpers.js`. Jede folgende Testdatei importiert beide.

- [ ] **Step 1: `src/test/helpers.js` anlegen**

```js
"use strict";

import GameResult from "../scripts/game/GameResult.js";

/**
 * Builds a Board from a compact pattern: "12_|_1_|__2".
 * 1 = X, 2 = O, _ = empty. Three rows of three, separated by "|".
 */
export function board(pattern) {
    return pattern.split("|").map(row => [...row].map(cell => (cell === "_" ? 0 : Number(cell))));
}

/**
 * Clears the static state GameResult carries between games.
 * Every test file calls this from a beforeEach: _determine_winner writes
 * WinningLine only while it is empty, so a leftover from an earlier test
 * silently changes what the next one observes.
 */
export function resetGameState() {
    GameResult.winningLine = [];
}
```

- [ ] **Step 2: `src/test/helpers.test.js` anlegen**

```js
"use strict";

import { test } from "node:test";
import assert from "node:assert/strict";

import GameResult from "../scripts/game/GameResult.js";
import { board, resetGameState } from "./helpers.js";

test("board() builds an empty Board", () => {
    assert.deepEqual(board("___|___|___"), [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
});

test("board() maps 1 to X and 2 to O in row-major order", () => {
    assert.deepEqual(board("12_|_1_|__2"), [[1, 2, 0], [0, 1, 0], [0, 0, 2]]);
});

test("resetGameState() clears WinningLine", () => {
    GameResult.winningLine = ["row", ["111", "000", "000"]];
    resetGameState();
    assert.deepEqual(GameResult.winningLine, []);
});
```

- [ ] **Step 3: `src/package.json` ändern**

`"scripts"` und ein neuer `"engines"`-Block. Der Rest der Datei bleibt unangetastet:

```json
  "scripts": {
    "test": "node --test test/*.test.js"
  },
  "engines": {
    "node": ">=22"
  },
```

- [ ] **Step 4: Suite laufen lassen**

Run: `npm test`
Expected: PASS, `# tests 3`, `# pass 3`, `# fail 0`

- [ ] **Step 5: Discovery-Probe — `helpers.js` darf nicht mitgezählt werden**

Das ist die Mutationsprobe dieser Aufgabe. Erst der Beleg, dass bloßes `node --test` zu viel einsammelt:

Run: `node --test`
Expected: mehr Testdateien als eine — `test\helpers.js` erscheint als bestandene Testdatei, obwohl sie keine Tests enthält.

Dann der Beleg, dass das Skript es richtig macht:

Run: `npm test`
Expected: nur `helpers.test.js` läuft; `helpers.js` taucht in der Ausgabe nicht auf.

- [ ] **Step 6: Commit**

```bash
git add src/package.json src/test/helpers.js src/test/helpers.test.js
git commit -m "test: Testgeruest mit Brett-Baukasten und node --test"
```

---

### Task 2: `Board.writeToBoard`

**Files:**
- Create: `src/test/Board.test.js`
- Reference: `src/scripts/game/Board.js:173-188`

**Interfaces:**
- Consumes: `board()`, `resetGameState()` aus `./helpers.js`
- Produces: nichts für spätere Aufgaben

- [ ] **Step 1: `src/test/Board.test.js` schreiben**

```js
"use strict";

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import Board from "../scripts/game/Board.js";
import { board, resetGameState } from "./helpers.js";

beforeEach(resetGameState);

test("writeToBoard places X at the addressed Cell", () => {
    assert.deepEqual(
        Board.writeToBoard(board("___|___|___"), "1-2", 1),
        [[0, 0, 0], [0, 0, 1], [0, 0, 0]]
    );
});

test("writeToBoard places O at the addressed Cell", () => {
    assert.deepEqual(
        Board.writeToBoard(board("___|___|___"), "2-0", 2),
        [[0, 0, 0], [0, 0, 0], [2, 0, 0]]
    );
});

test("writeToBoard clears the Cell when no Player is given", () => {
    assert.deepEqual(
        Board.writeToBoard(board("12_|_1_|__2"), "0-1"),
        [[1, 0, 0], [0, 1, 0], [0, 0, 2]]
    );
});

test("writeToBoard mutates in place and returns the same Board", () => {
    const b = board("___|___|___");
    assert.equal(Board.writeToBoard(b, "0-0", 1), b);
    assert.equal(b[0][0], 1);
});

// Pinned oddity, see docs/decisions/0002. writeToBoard throws away the result of
// its own arr.map(parseInt), so the CellId parts stay strings. It reaches the
// right Cell only because array indexing coerces "2" to 2. Observed, not intended.
test("writeToBoard addresses the Cell through string indices", () => {
    const b = board("___|___|___");
    Board.writeToBoard(b, "2-1", 2);
    assert.equal(b[2][1], 2);
});
```

- [ ] **Step 2: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 8`

- [ ] **Step 3: Mutationsprobe**

In `src/scripts/game/Board.js` im `writeToBoard`-`switch` den Zweig `case 1:` von
`board[arr[0]][arr[1]] = 1;` auf `board[arr[0]][arr[1]] = 2;` ändern.

Run: `npm test`
Expected: FAIL — mindestens „writeToBoard places X at the addressed Cell" und „writeToBoard mutates in place" werden rot.

- [ ] **Step 4: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/Board.js
```

Run: `npm test`
Expected: PASS, `# pass 8`

- [ ] **Step 5: Commit**

```bash
git add src/test/Board.test.js
git commit -m "test: writeToBoard, inklusive String-Index-Eigenheit"
```

---

### Task 3: `GameResult` — Linienzerlegung

**Files:**
- Create: `src/test/GameResult.test.js`
- Reference: `src/scripts/game/GameResult.js:100-143`

**Interfaces:**
- Consumes: `board()`, `resetGameState()`
- Produces: die Datei `GameResult.test.js`, an die Task 4 und 5 anhängen

- [ ] **Step 1: `src/test/GameResult.test.js` schreiben**

```js
"use strict";

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import GameResult from "../scripts/game/GameResult.js";
import { board, resetGameState } from "./helpers.js";

beforeEach(resetGameState);

test("get_rows returns each row as a Line", () => {
    assert.deepEqual(GameResult.get_rows(board("12_|_1_|__2")), ["120", "010", "002"]);
    assert.deepEqual(GameResult.get_rows(board("121|212|212")), ["121", "212", "212"]);
});

test("get_rows returns three zero Lines for an empty Board", () => {
    assert.deepEqual(GameResult.get_rows(board("___|___|___")), ["000", "000", "000"]);
});

test("get_columns returns each column as a Line, left to right", () => {
    assert.deepEqual(GameResult.get_columns(board("12_|_1_|__2")), ["100", "210", "002"]);
    assert.deepEqual(GameResult.get_columns(board("___|___|___")), ["000", "000", "000"]);
    assert.deepEqual(GameResult.get_columns(board("121|212|212")), ["122", "211", "122"]);
});

test("get_diagonals returns the main diagonal first, the anti-diagonal second", () => {
    assert.deepEqual(GameResult.get_diagonals(board("12_|_1_|__2")), ["112", "010"]);
    assert.deepEqual(GameResult.get_diagonals(board("___|___|___")), ["000", "000"]);
    assert.deepEqual(GameResult.get_diagonals(board("121|212|212")), ["112", "112"]);
});
```

- [ ] **Step 2: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 12`

- [ ] **Step 3: Mutationsprobe**

In `GameResult.get_diagonals` die beiden Diagonalen vertauschen: `diags.push(diag2.join(""), diag1.join(""));`

Run: `npm test`
Expected: FAIL — „get_diagonals returns the main diagonal first" wird rot.

- [ ] **Step 4: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/GameResult.js
```

Run: `npm test`
Expected: PASS, `# pass 12`

- [ ] **Step 5: Commit**

```bash
git add src/test/GameResult.test.js
git commit -m "test: Linienzerlegung in GameResult"
```

---

### Task 4: `GameResult` — Siegerkennung

**Files:**
- Modify: `src/test/GameResult.test.js` (anhängen)
- Reference: `src/scripts/game/GameResult.js:15-93`

**Interfaces:**
- Consumes: alles aus Task 3
- Produces: nichts Neues

- [ ] **Step 1: An `GameResult.test.js` anhängen**

```js
test("_win_conditions reports no winner when no Line is complete", () => {
    assert.equal(GameResult._win_conditions(["120", "001", "210"]), 0);
});

test("_win_conditions reports X for a complete X Line", () => {
    assert.equal(GameResult._win_conditions(["111", "000", "000"]), 1);
});

test("_win_conditions reports O for a complete O Line", () => {
    assert.equal(GameResult._win_conditions(["222", "000", "000"]), 2);
});

test("_win_conditions reports the Player of two Lines belonging to the same Player", () => {
    assert.equal(GameResult._win_conditions(["111", "111", "000"]), 1);
});

// Pinned oddity, see docs/decisions/0002. _win_conditions iterates with forEach
// and lets the last match win, so with one Line per Player the answer depends on
// the order it is handed. Such a Board cannot arise in legal play.
test("_win_conditions lets the last Line win when both Players have one", () => {
    assert.equal(GameResult._win_conditions(["111", "222", "000"]), 2);
    assert.equal(GameResult._win_conditions(["222", "111", "000"]), 1);
    // The order dependence reaches the Outcome: X holds the first Line on this
    // Board, yet getGameResult answers 2.
    assert.equal(GameResult.getGameResult(board("111|222|___")), 2);
});

test("_determine_winner finds X in a row, a column and both diagonals", () => {
    assert.equal(GameResult._determine_winner(board("111|22_|___")), 1);
    resetGameState();
    assert.equal(GameResult._determine_winner(board("1_2|1_2|1__")), 1);
    resetGameState();
    assert.equal(GameResult._determine_winner(board("1_2|_1_|2_1")), 1);
    resetGameState();
    assert.equal(GameResult._determine_winner(board("__1|_1_|1_2")), 1);
});

test("_determine_winner finds O in a row, a column and both diagonals", () => {
    assert.equal(GameResult._determine_winner(board("222|11_|___")), 2);
    resetGameState();
    assert.equal(GameResult._determine_winner(board("2_1|2_1|2__")), 2);
    resetGameState();
    assert.equal(GameResult._determine_winner(board("2_1|_2_|1_2")), 2);
    resetGameState();
    assert.equal(GameResult._determine_winner(board("__2|_2_|2_1")), 2);
});

test("_determine_winner reports no winner on a full Board without a Line", () => {
    assert.equal(GameResult._determine_winner(board("121|212|212")), 0);
});

test("getGameResult reports an ongoing game for an empty Board", () => {
    assert.equal(GameResult.getGameResult(board("___|___|___")), -1);
});

test("getGameResult reports an ongoing game while Cells are still free", () => {
    assert.equal(GameResult.getGameResult(board("12_|_1_|___")), -1);
});

test("getGameResult reports a draw on a full Board without a winner", () => {
    assert.equal(GameResult.getGameResult(board("121|212|212")), 0);
});

test("getGameResult reports X before the Board is full", () => {
    assert.equal(GameResult.getGameResult(board("111|22_|___")), 1);
});

test("getGameResult reports O before the Board is full", () => {
    assert.equal(GameResult.getGameResult(board("222|11_|___")), 2);
});
```

- [ ] **Step 2: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 25`

- [ ] **Step 3: Mutationsprobe**

In `GameResult._win_conditions` die X-Bedingung verstümmeln: `ele[2] === "1"` zu `ele[1] === "1"` ändern.

Run: `npm test`
Expected: FAIL, **5 von 25**, und zwar genau diese:

- `_determine_winner finds O in a row, a column and both diagonals`
- `_determine_winner reports no winner on a full Board without a Line`
- `getGameResult reports an ongoing game while Cells are still free`
- `getGameResult reports a draw on a full Board without a winner`
- `getGameResult reports O before the Board is full`

Die X-Fälle bleiben grün — die Mutation verstümmelt die X-Bedingung so, dass sie
*zusätzliche* Linien als X-Sieg liest, nicht weniger. Das trifft die O- und
Unentschieden-Fälle, nicht die X-Fälle. Wundere dich nicht darüber und „repariere"
diese Tests nicht: hier greift die Regel aus dem Kopf dieses Plans nicht, weil die
Mutation gar nicht auf sie zielt.

- [ ] **Step 4: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/GameResult.js
```

Run: `npm test`
Expected: PASS, `# pass 25`

- [ ] **Step 5: Commit**

```bash
git add src/test/GameResult.test.js
git commit -m "test: Siegerkennung, inklusive Reihenfolge-Eigenheit in _win_conditions"
```

---

### Task 5: `GameResult` — WinningLine

**Files:**
- Modify: `src/test/GameResult.test.js` (anhängen)
- Reference: `src/scripts/game/GameResult.js:8`, `:40-72`; `src/scripts/game/Computer.js:233`

**Interfaces:**
- Consumes: alles aus Task 3 und 4; zusätzlich `Computer` für die Nebenwirkungsprüfung
- Produces: nichts Neues

- [ ] **Step 1: Import ergänzen**

Am Kopf von `GameResult.test.js`, nach dem `GameResult`-Import:

```js
import Computer from "../scripts/game/Computer.js";
```

- [ ] **Step 2: An `GameResult.test.js` anhängen**

Die ersten beiden Tests gehören zusammen und **müssen in dieser Reihenfolge stehen**: ein einzelner Test kann sein eigenes `beforeEach` nicht beobachten, deshalb füllt der erste die WinningLine und der zweite belegt, dass sie weg ist.

```js
test("WinningLine reset, part 1: leave a value behind", () => {
    GameResult.winningLine = ["row", ["111", "000", "000"]];
    assert.equal(GameResult.winningLine.length, 2);
});

test("WinningLine reset, part 2: the beforeEach cleared it", () => {
    assert.deepEqual(GameResult.winningLine, []);
});

// WinningLine holds a category tag plus every Line of that category, not the
// single deciding Line. Pinned oddity, see docs/decisions/0002.
test("WinningLine records the category and all its Lines", () => {
    GameResult._determine_winner(board("111|22_|___"));
    assert.deepEqual(GameResult.winningLine, ["row", ["111", "220", "000"]]);
});

// Same pinned oddity as above, see docs/decisions/0002: the category tag plus every
// Line of that category, here for a diagonal win.
test("WinningLine records a diagonal win the same way", () => {
    GameResult._determine_winner(board("1_2|12_|221"));
    assert.deepEqual(GameResult.winningLine, ["diags", ["121", "222"]]);
});

test("WinningLine stays empty while no Line is complete", () => {
    GameResult._determine_winner(board("22_|11_|___"));
    assert.deepEqual(GameResult.winningLine, []);
});

// Pinned oddity, see docs/decisions/0002: _determine_winner writes WinningLine
// only while it is empty, so a stale value survives the next game untouched.
test("WinningLine is not overwritten while it holds a value", () => {
    GameResult.winningLine = ["cols", ["222", "000", "000"]];
    GameResult._determine_winner(board("111|22_|___"));
    assert.deepEqual(GameResult.winningLine, ["cols", ["222", "000", "000"]]);
});

// Pinned oddity, see docs/decisions/0002: godlikeChooseSpace clears another
// class's static state from inside its own loop. On a decided Board it returns
// from the base case before the loop, so the value survives there.
test("godlikeChooseSpace clears WinningLine on an undecided Board", () => {
    GameResult.winningLine = ["row", ["111", "000", "000"]];
    Computer.godlikeChooseSpace(board("12_|21_|1_2"), 2);
    assert.deepEqual(GameResult.winningLine, []);
});

test("godlikeChooseSpace leaves WinningLine alone on a decided Board", () => {
    GameResult.winningLine = ["row", ["111", "000", "000"]];
    Computer.godlikeChooseSpace(board("111|___|___"), 2);
    assert.deepEqual(GameResult.winningLine, ["row", ["111", "000", "000"]]);
});
```

- [ ] **Step 3: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 33`

- [ ] **Step 4: Mutationsprobe**

In `GameResult._determine_winner` im ersten Zweig (X, `rows`) die Wächterbedingung
`if (this.winningLine.length === 0) {` durch `if (true) {` ersetzen.

Run: `npm test`
Expected: FAIL, **zwei** Tests: „WinningLine is not overwritten while it holds a value" und
„godlikeChooseSpace leaves WinningLine alone on a decided Board". Der zweite ist berechtigt —
ohne den Wächter lässt auch der Basisfall den alten Wert nicht mehr stehen.

- [ ] **Step 5: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/GameResult.js
```

Run: `npm test`
Expected: PASS, `# pass 33`

- [ ] **Step 6: Jede Datei einzeln prüfen**

Abnahmekriterium 4 der Spec. Keine Datei darf von einem Zustand abhängen, den eine andere hinterlässt:

```bash
node --test test/helpers.test.js
node --test test/Board.test.js
node --test test/GameResult.test.js
```

Expected: jede für sich PASS.

- [ ] **Step 7: Commit**

```bash
git add src/test/GameResult.test.js
git commit -m "test: WinningLine samt statischem Zustand und Nebenwirkung aus Computer"
```

---

### Task 6: `Computer` — Cells und Zufall

**Files:**
- Create: `src/test/Computer.test.js`
- Reference: `src/scripts/game/Computer.js:17-38`, `:154-156`

**Interfaces:**
- Consumes: `board()`, `resetGameState()`
- Produces: die Datei `Computer.test.js`, an die Task 7, 8 und 9 anhängen

- [ ] **Step 1: `src/test/Computer.test.js` schreiben**

```js
"use strict";

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import Computer from "../scripts/game/Computer.js";
import { board, resetGameState } from "./helpers.js";

beforeEach(resetGameState);

test("getEmptySpaces lists every Cell of an empty Board in row-major order", () => {
    assert.deepEqual(Computer.getEmptySpaces(board("___|___|___")),
        ["0-0", "0-1", "0-2", "1-0", "1-1", "1-2", "2-0", "2-1", "2-2"]);
});

test("getEmptySpaces lists only the free Cells", () => {
    assert.deepEqual(Computer.getEmptySpaces(board("12_|_1_|__2")),
        ["0-2", "1-0", "1-2", "2-0", "2-1"]);
});

test("getEmptySpaces returns nothing for a full Board", () => {
    assert.deepEqual(Computer.getEmptySpaces(board("121|212|212")), []);
});

// Pinned oddity, see docs/decisions/0002: the row index comes from
// board.indexOf(board[i]) rather than from i. With one row object shared across
// all three rows, indexOf always answers 0 and every free Cell is reported in
// row 0. Distinct row objects are what makes the normal case work.
test("getEmptySpaces reports row 0 for every Cell of a Board built from one shared row", () => {
    const row = [0, 1, 0];
    assert.deepEqual(Computer.getEmptySpaces([row, row, row]),
        ["0-0", "0-2", "0-0", "0-2", "0-0", "0-2"]);
});

test("chooseRandom returns the first entry when Math.random yields 0", (t) => {
    t.mock.method(Math, "random", () => 0);
    assert.equal(Computer.chooseRandom(["a", "b", "c"]), "a");
});

test("chooseRandom returns the last entry when Math.random approaches 1", (t) => {
    t.mock.method(Math, "random", () => 0.999);
    assert.equal(Computer.chooseRandom(["a", "b", "c"]), "c");
});

test("chooseRandom returns the only entry of a single-element list", (t) => {
    t.mock.method(Math, "random", () => 0.5);
    assert.equal(Computer.chooseRandom(["0-0"]), "0-0");
});

// Pinned oddity, see docs/decisions/0002.
test("chooseRandom returns undefined for an empty list", () => {
    assert.equal(Computer.chooseRandom([]), undefined);
});

test("easyChooseSpace always answers with a free Cell", (t) => {
    t.mock.method(Math, "random", () => 0);
    const b = board("12_|_1_|__2");
    assert.ok(Computer.getEmptySpaces(b).includes(Computer.easyChooseSpace(b)));
});

// Pinned oddity, see docs/decisions/0002.
test("easyChooseSpace returns undefined on a full Board", () => {
    assert.equal(Computer.easyChooseSpace(board("121|212|212")), undefined);
});
```

- [ ] **Step 2: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 43`

- [ ] **Step 3: Mutationsprobe**

In `Computer.getEmptySpaces` den Zeilenindex reparieren:
`emptySpaces.push(`${board.indexOf(board[i])}-${j}`);` zu `emptySpaces.push(`${i}-${j}`);` ändern.

Run: `npm test`
Expected: FAIL — **genau ein** Test wird rot: „getEmptySpaces reports row 0 for every Cell of a Board built from one shared row". Alle übrigen bleiben grün. Das ist der Beweis, dass dieser Test die Eigenheit festhält und sonst nichts.

- [ ] **Step 4: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/Computer.js
```

Run: `npm test`
Expected: PASS, `# pass 43`

- [ ] **Step 5: Commit**

```bash
git add src/test/Computer.test.js
git commit -m "test: freie Cells und Zufallswahl, inklusive indexOf-Eigenheit"
```

---

### Task 7: `Computer` — Threats

**Files:**
- Modify: `src/test/Computer.test.js` (anhängen)
- Reference: `src/scripts/game/Computer.js:47-146`

**Interfaces:**
- Consumes: alles aus Task 6
- Produces: nichts Neues

`getElementIDNeededToWin` liefert eine Liste aus `{player, elementID}`. Die Reihenfolge folgt der Reihenfolge der Kategorien: erst Zeilen, dann Spalten, dann Diagonalen.

- [ ] **Step 1: An `Computer.test.js` anhängen**

```js
test("getElementIDNeededToWin finds a Threat in a row", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("11_|___|___")),
        [{ player: 1, elementID: "0-2" }]);
});

test("getElementIDNeededToWin finds a Threat in a column", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("1__|1__|___")),
        [{ player: 1, elementID: "2-0" }]);
});

test("getElementIDNeededToWin finds the gap at either end of a row", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("_11|___|___")),
        [{ player: 1, elementID: "0-0" }]);
    assert.deepEqual(Computer.getElementIDNeededToWin(board("1_1|___|___")),
        [{ player: 1, elementID: "0-1" }]);
});

test("getElementIDNeededToWin resolves all three gaps of the main diagonal", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("___|_1_|__1")),
        [{ player: 1, elementID: "0-0" }]);
    assert.deepEqual(Computer.getElementIDNeededToWin(board("1__|___|__1")),
        [{ player: 1, elementID: "1-1" }]);
    assert.deepEqual(Computer.getElementIDNeededToWin(board("1__|_1_|___")),
        [{ player: 1, elementID: "2-2" }]);
});

test("getElementIDNeededToWin resolves all three gaps of the anti-diagonal", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("___|_1_|1__")),
        [{ player: 1, elementID: "0-2" }]);
    assert.deepEqual(Computer.getElementIDNeededToWin(board("__1|___|1__")),
        [{ player: 1, elementID: "1-1" }]);
    assert.deepEqual(Computer.getElementIDNeededToWin(board("__1|_1_|___")),
        [{ player: 1, elementID: "2-0" }]);
});

test("getElementIDNeededToWin reports a Threat for each Player", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("11_|22_|___")),
        [{ player: 1, elementID: "0-2" }, { player: 2, elementID: "1-2" }]);
});

test("getElementIDNeededToWin reports nothing when no Line is two-thirds full", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("12_|21_|___")),
        [{ player: 1, elementID: "2-2" }]);
    assert.deepEqual(Computer.getElementIDNeededToWin(board("___|___|___")), []);
});

// Pinned oddity, see docs/decisions/0002: the Line is located with indexOf, so
// two identical Lines in one category both resolve to the first one's index and
// the second Threat comes back with the first one's CellId. An exhaustive sweep
// of all 19 683 Boards showed this never makes normalChooseSpace answer with an
// occupied or non-Threat Cell -- the twin Line's gap sits at the same offset.
test("getElementIDNeededToWin duplicates the CellId of identical Lines", () => {
    assert.deepEqual(Computer.getElementIDNeededToWin(board("11_|11_|___")), [
        { player: 1, elementID: "0-2" },
        { player: 1, elementID: "0-2" },
        { player: 1, elementID: "2-0" },
        { player: 1, elementID: "2-0" },
        { player: 1, elementID: "2-2" }
    ]);
});
```

- [ ] **Step 2: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 51`

Läuft einer der Diagonal-Tests rot, ist der **Test** falsch, nicht der Code — die
erwarteten CellIds sind am echten Code gemessen. Erwartungswert korrigieren, nicht
`Computer.js` anfassen (Entscheidung 0002).

- [ ] **Step 3: Mutationsprobe**

In `Computer.getElementIDNeededToWin`, im Zweig für die Gegendiagonale
(`object['indexOfLine'] === 1`), `case 0:` und `case 2:` vertauschen — also `"0-2"`
und `"2-0"` gegeneinander austauschen.

Run: `npm test`
Expected: FAIL — „getElementIDNeededToWin resolves all three gaps of the anti-diagonal" wird rot.

- [ ] **Step 4: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/Computer.js
```

Run: `npm test`
Expected: PASS, `# pass 51`

- [ ] **Step 5: Commit**

```bash
git add src/test/Computer.test.js
git commit -m "test: Threat-Erkennung samt Diagonalzuordnung und Doppellinien-Defekt"
```

---

### Task 8: `Computer.normalChooseSpace`

**Files:**
- Modify: `src/test/Computer.test.js` (anhängen)
- Reference: `src/scripts/game/Computer.js:165-187`

**Interfaces:**
- Consumes: alles aus Task 6 und 7
- Produces: nichts Neues

- [ ] **Step 1: An `Computer.test.js` anhängen**

`normalChooseSpace` fällt ohne Threat auf `easyChooseSpace` zurück, also auf
`Math.random`. Ohne Stub wäre der Test flakig.

```js
test("normalChooseSpace falls back to a random free Cell when there is no Threat", (t) => {
    t.mock.method(Math, "random", () => 0);
    assert.equal(Computer.normalChooseSpace(board("12_|_1_|__2")), "0-2");
});

test("normalChooseSpace takes the last free Cell when Math.random approaches 1", (t) => {
    t.mock.method(Math, "random", () => 0.999);
    assert.equal(Computer.normalChooseSpace(board("12_|_1_|__2")), "2-1");
});

test("normalChooseSpace blocks the Threat of the opposing Player", () => {
    assert.equal(Computer.normalChooseSpace(board("11_|___|___")), "0-2");
});

test("normalChooseSpace takes its own Threat", () => {
    assert.equal(Computer.normalChooseSpace(board("22_|___|___")), "0-2");
});

test("normalChooseSpace prefers its own win over blocking", () => {
    assert.equal(Computer.normalChooseSpace(board("11_|22_|___")), "1-2");
});

// Pinned oddity, see docs/decisions/0002: once the game is decided the guard in
// normalChooseSpace never assigns a choice and undefined comes back. It does not
// reach the DOM today -- computerSetSymbol has one caller, behind an
// "outcome is still -1" check -- so this pins a broken promise, not a live fault.
test("normalChooseSpace returns undefined once the game is decided", () => {
    assert.equal(Computer.normalChooseSpace(board("111|22_|___")), undefined);
    assert.equal(Computer.normalChooseSpace(board("121|212|212")), undefined);
});
```

- [ ] **Step 2: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 57`

- [ ] **Step 3: Mutationsprobe**

In `Computer.normalChooseSpace` die beiden `forEach`-Blöcke vertauschen, so dass der
Block mit `object['player'] === 1` nach dem mit `=== 2` steht — dann überschreibt das
Blocken den eigenen Gewinnzug.

Run: `npm test`
Expected: FAIL — „normalChooseSpace prefers its own win over blocking" wird rot.

- [ ] **Step 4: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/Computer.js
```

Run: `npm test`
Expected: PASS, `# pass 57`

- [ ] **Step 5: Commit**

```bash
git add src/test/Computer.test.js
git commit -m "test: normalChooseSpace mit gestubbtem Zufall und Vorrang des eigenen Siegs"
```

---

### Task 9: `Computer.godlikeChooseSpace`

**Files:**
- Modify: `src/test/Computer.test.js` (anhängen)
- Reference: `src/scripts/game/Computer.js:196-259`

**Interfaces:**
- Consumes: alles aus Task 6 bis 8
- Produces: nichts Neues

Zwei Dinge, die beim Schreiben leicht schiefgehen:

- **Der zweite Parameter ist Pflicht.** Ohne `player` läuft der Code in den
  Minimizer-Zweig und `writeToBoard` *leert* mit seinem Default Felder, statt sie zu
  setzen. Heraus kommt ein plausibel aussehendes Ergebnis. Ein Test ohne `player`
  schreibt Unsinn fest.
- **Minimax nimmt unter gleich bewerteten Zügen den ersten in `getEmptySpaces`-Reihenfolge**,
  nicht den taktisch naheliegenden. Auf `11_|22_|___` kommt `0-2`, obwohl `1-2` sofort
  gewinnt. Deshalb wird `evaluation` als Aussage über die Stellung geprüft und `id` nur
  dort, wo die Tie-Break-Regel sie eindeutig macht.

- [ ] **Step 1: An `Computer.test.js` anhängen**

```js
test("godlikeChooseSpace returns only an evaluation on a decided Board", () => {
    assert.deepEqual(Computer.godlikeChooseSpace(board("111|22_|___"), 2), { evaluation: -1 });
    resetGameState();
    assert.deepEqual(Computer.godlikeChooseSpace(board("222|11_|___"), 2), { evaluation: 1 });
    resetGameState();
    assert.deepEqual(Computer.godlikeChooseSpace(board("121|212|212"), 2), { evaluation: 0 });
});

test("godlikeChooseSpace evaluates a won position as 1 for O", () => {
    assert.equal(Computer.godlikeChooseSpace(board("11_|22_|___"), 2).evaluation, 1);
});

test("godlikeChooseSpace evaluates a lost position as -1 for O", () => {
    assert.equal(Computer.godlikeChooseSpace(board("1_2|_2_|11_"), 2).evaluation, -1);
});

// The tie-break is not tactical: among equally rated moves Minimax keeps the
// first one in getEmptySpaces order. On this Board 1-2 wins immediately, yet 0-2
// comes back because it is rated 1 as well and comes first.
test("godlikeChooseSpace keeps the first of the equally rated Cells", () => {
    assert.deepEqual(Computer.godlikeChooseSpace(board("11_|22_|___"), 2),
        { id: "0-2", evaluation: 1 });
    resetGameState();
    assert.deepEqual(Computer.godlikeChooseSpace(board("1_2|_2_|11_"), 2),
        { id: "0-1", evaluation: -1 });
});

// Every other godlike test drives the maximizer; the minimizer selection loop is
// otherwise only reached through recursion and never checked directly.
test("godlikeChooseSpace minimizes when asked to play as X", () => {
    assert.deepEqual(Computer.godlikeChooseSpace(board("11_|22_|___"), 1),
        { id: "0-2", evaluation: -1 });
});

test("godlikeChooseSpace leaves the Board it was given unchanged", () => {
    const b = board("12_|_1_|__2");
    const before = JSON.stringify(b);
    Computer.godlikeChooseSpace(b, 2);
    assert.equal(JSON.stringify(b), before);
});

test("godlikeChooseSpace evaluates a two-Mark position cheaply", () => {
    assert.deepEqual(Computer.godlikeChooseSpace(board("1__|_2_|___"), 2),
        { id: "0-1", evaluation: 0 });
});

// The single full-depth test. Roughly 1.5 to 1.9 seconds depending on the
// machine -- see the runtime budget in the spec. Do not add a second one.
test("godlikeChooseSpace plays an empty Board to a draw", () => {
    assert.deepEqual(Computer.godlikeChooseSpace(board("___|___|___"), 2),
        { id: "0-0", evaluation: 0 });
});
```

- [ ] **Step 2: Laufen lassen, muss grün sein**

Run: `npm test`
Expected: PASS, `# pass 65`

- [ ] **Step 3: Laufzeit prüfen**

Run: `npm test`
Expected: die Gesamtdauer in der `duration_ms`-Zeile liegt **unter 5000 ms**. Reißt sie
die Marke, ist ein zweiter tiefer Test hineingeraten — Abnahmekriterium 3 der Spec.

- [ ] **Step 4: Mutationsprobe**

In `Computer.godlikeChooseSpace` im Maximizer-Zweig `moves[i].evaluation > bestEvaluation`
zu `>=` ändern. Damit gewinnt der *letzte* gleich bewertete Zug statt des ersten.

Run: `npm test`
Expected: FAIL, drei Tests: „godlikeChooseSpace keeps the first of the equally rated
Cells", „godlikeChooseSpace evaluates a two-Mark position cheaply" und
„godlikeChooseSpace plays an empty Board to a draw".

- [ ] **Step 5: Mutation zurücknehmen**

```bash
git checkout -- src/scripts/game/Computer.js
```

Run: `npm test`
Expected: PASS, `# pass 65`

- [ ] **Step 6: Abnahme der Spec vollständig prüfen**

```bash
git status --short
node --test test/helpers.test.js
node --test test/Board.test.js
node --test test/GameResult.test.js
node --test test/Computer.test.js
npm test
```

Expected:
- `git status --short` zeigt **keine** Änderung unter `src/scripts/` — der Produktionscode ist unangetastet (Entscheidung 0002).
- jede Datei einzeln PASS
- `npm test` PASS, unter 5 Sekunden

Task 10 kommt danach und fügt `defects.test.js` hinzu.

- [ ] **Step 7: Commit**

```bash
git add src/test/Computer.test.js
git commit -m "test: godlikeChooseSpace mit Bewertung, Tie-Break und Minimizer-Zweig"
```

---

### Task 10: Die bekannten Defekte als `todo`-Tests

**Files:**
- Create: `src/test/defects.test.js`
- Reference: `docs/00_Analysis/GameLogicDefects/ANALYSIS-GameLogicDefects-16092026.md`, `docs/decisions/0002-tests-pin-current-behaviour.md`

**Interfaces:**
- Consumes: `board()`, `resetGameState()` aus `./helpers.js`
- Produces: nichts

Die bisherigen Tasks halten fest, **was ist**. Diese hält fest, **was sein sollte** — und
zwar so, dass es in der Testausgabe steht statt nur im Kommentar. Jeder Test hier schlägt
heute fehl; `{ todo: … }` sorgt dafür, dass er als `todo` gezählt wird und die Suite nicht
bricht.

**Die Behauptungen müssen schwach genug sein, um unter der tatsächlichen Reparatur grün zu
werden.** Das ist die eigentliche Schwierigkeit hier, und sie ist leicht zu unterschätzen: die
Analyse empfiehlt für Defekt 3 und 6, eine Ausnahme zu **werfen**. Ein Test, der
`!== undefined` prüft, bliebe dann rot — die Reparatur wäre erfolgt und die Suite meldete
weiterhin eine offene Baustelle. Deshalb prüfen diese beiden „antwortet brauchbar **oder**
wirft", und Defekt 7 vergleicht mit `deepEqual` statt `equal`, weil die empfohlene Fassung
eine Menge zurückgibt. Nachgemessen: alle fünf sind heute rot und werden unter der
empfohlenen Reparatur grün.

**Drei der acht Eigenheiten haben hier bewusst keinen Eintrag.** Defekt 1 (verworfenes `map`)
und Defekt 8 (`includes(0)`) verändern kein beobachtbares Verhalten — da gibt es nichts zu
wünschen. Und **Defekt 2** lässt sich nicht formulieren, ohne die Reparatur vorwegzunehmen:
die empfohlene Fassung entfernt den statischen Zustand ganz und lässt `_determine_winner`
Outcome und WinningLine zusammen zurückgeben. Jede Behauptung über `GameResult.winningLine`
würde damit eine Entscheidung festschreiben, die du noch nicht getroffen hast. Defekt 2 steht
nur in der Analyse, nicht hier.

- [ ] **Step 1: `src/test/defects.test.js` anlegen**

```js
"use strict";

import { test, suite, beforeEach } from "node:test";
import assert from "node:assert/strict";

import GameResult from "../scripts/game/GameResult.js";
import Computer from "../scripts/game/Computer.js";
import { board, resetGameState } from "./helpers.js";

beforeEach(resetGameState);

/** True when the call answers with something usable, or refuses loudly. */
function answersOrThrows(call) {
    try {
        return call() !== undefined;
    } catch {
        return true;
    }
}

// Every test in here describes what the code SHOULD do and therefore fails today.
// { todo } keeps them out of the pass count and out of the failure count, so the
// suite stays green while the output still reports how many are open.
// Background and repair order: docs/00_Analysis/GameLogicDefects/.
suite("Known defects — desired behaviour, currently failing", () => {

    test("defect 3: normalChooseSpace should answer or throw, never return undefined",
         { todo: "broken promise, masked by the caller's guard; see ANALYSIS defect 3" }, () => {
        assert.ok(answersOrThrows(() => Computer.normalChooseSpace(board("111|22_|___"))));
    });

    test("defect 4: getEmptySpaces should take the row from its own index",
         { todo: "indexOf on a row instead of i; see ANALYSIS defect 4" }, () => {
        const row = [0, 1, 0];
        assert.deepEqual(Computer.getEmptySpaces([row, row, row]),
            ["0-0", "0-2", "1-0", "1-2", "2-0", "2-2"]);
    });

    test("defect 5: getElementIDNeededToWin should not repeat a CellId",
         { todo: "identical Lines collapse onto one index; see ANALYSIS defect 5" }, () => {
        const ids = Computer.getElementIDNeededToWin(board("11_|11_|___")).map(t => t.elementID);
        assert.equal(new Set(ids).size, ids.length);
    });

    test("defect 6: chooseRandom should answer or throw for an empty list",
         { todo: "broken promise, masked by the caller's guard; see ANALYSIS defect 6" }, () => {
        assert.ok(answersOrThrows(() => Computer.chooseRandom([])));
    });

    // deepEqual, not equal: the recommended repair returns a set of Players, and
    // two distinct Sets are never strictly equal however order-independent they are.
    test("defect 7: _win_conditions should not depend on Line order",
         { todo: "forEach with last-write-wins; see ANALYSIS defect 7" }, () => {
        assert.deepEqual(GameResult._win_conditions(["111", "222", "000"]),
                         GameResult._win_conditions(["222", "111", "000"]));
    });
});
```

- [ ] **Step 2: Laufen lassen**

Run: `npm test`
Expected: `# pass 65`, `# fail 0`, **`# todo 5`**, Exitcode 0. Die Pass-Zahl bleibt
unverändert — `todo`-Tests zählen nicht mit.

Ist einer der fünf **grün**, ist der Defekt behoben oder der Test behauptet das Falsche.
Beides ist ein Grund innezuhalten, nicht weiterzugehen.

- [ ] **Step 3: Gegenprobe an Defekt 4**

Die einzige der sechs, deren Behebung hier eindeutig feststeht. In
`Computer.getEmptySpaces` `${board.indexOf(board[i])}-${j}` zu `${i}-${j}` ändern.

Run: `npm test`
Expected: „defect 4" wird **grün** (die Ausgabe meldet ihn als bestandenen `todo`), und
gleichzeitig wird der gepinnte Test aus Task 6 **rot**. Genau so soll sich eine Reparatur
später anfühlen: das Wunschverhalten erfüllt sich, der Schnappschuss stimmt nicht mehr.

- [ ] **Step 4: Gegenprobe zurücknehmen**

```bash
git checkout -- src/scripts/game/Computer.js
```

Run: `npm test`
Expected: `# pass 65`, `# fail 0`, `# todo 5`

- [ ] **Step 5: Commit**

```bash
git add src/test/defects.test.js
git commit -m "test: bekannte Defekte als todo-Tests mit gewuenschtem Verhalten"
```

---

## Before Landing

The full range of this branch gets reviewed, not just the last task. Fix
everything under `Issues`; `Recommendations` are advisory.

- Working by hand: type `/smax:code-review`.
- Working as an agent: dispatch a `general-purpose` subagent with the reviewer
  template at `C:\Projects\smax-skills\plugin\skills\dev\code-review\code-reviewer.md`,
  using the merge-base as BASE and HEAD as HEAD. **If that path does not resolve, stop
  and ask** — the plugin has been moved or updated since this plan was written. Do not
  guess a replacement path, and do not skip the review.

Then land via `smax:finishing-a-development-branch`, which re-checks that a
review for this HEAD exists before it offers the merge options.
