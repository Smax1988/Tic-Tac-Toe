# Defekte in der Spiellogik
**Erstellt:** 16.09.2026

## Problem

Beim Lesen von `GameResult`, `Computer` und `Board` vor dem Schreiben der Testsuite sind acht
Stellen aufgefallen, die eher zufällig als absichtlich funktionieren. Entscheidung
[0002](../../decisions/0002-tests-pin-current-behaviour.md) hält fest, dass keine davon jetzt
behoben wird: die Tests schreiben das heutige Verhalten fest, Reparaturen folgen später.

Dieses Dokument ist das Gegenstück dazu. 0002 sagt „festschreiben, nicht reparieren" — hier steht,
**was** genau kaputt ist, **wie stark** es heute wiegt und **in welcher Reihenfolge** man es angeht.
Es ist die Vorarbeit für eine spätere, eigene Sitzung; es ändert selbst keinen Produktionscode.

Jede Aussage unten ist nachgemessen. Die Messungen liefen auf Node 24.15.0 gegen die Module unter
`src/scripts/game/`, ohne DOM. Bretter werden als `12_|_1_|__2` notiert, wie im Brett-Baukasten der
[Testsuite-Spec](../../01_Specs/TestSuite/SPEC-TestSuite-16092026.md). Die verbindlichen Begriffe
stehen in [`CONTEXT.md`](../../../CONTEXT.md).

Ein Befund vorweg, weil er die halbe Bewertung trägt: **`Board.computerSetSymbol` wird nur
aufgerufen, wenn `GameResult.getGameResult(board._board) === -1`** (`TicTacToe.js:117-118`). Dieser
eine Wächter maskiert zwei der acht Defekte vollständig. Sie sind falsch, aber sie erreichen den
Spieler nicht — solange niemand einen zweiten Aufrufer hinzufügt.

## Übersicht

| # | Defekt | Ort | Beobachtbar | Schadet heute |
|---|---|---|---|---|
| 1 | `writeToBoard` verwirft das Ergebnis des eigenen `map` | `Board.js:175` | nein (nur am Typ ablesbar) | nein — toter Code |
| 2 | `winningLine` ist veränderlicher statischer Zustand, überlebt Partien | `GameResult.js:8`, `42-72` | ja | nein, aber nur wegen genau eines `resetGame` |
| 3 | `normalChooseSpace` liefert `undefined` bei entschiedener Partie | `Computer.js:186` | ja | nein — durch `TicTacToe.js:117` maskiert |
| 4 | `getEmptySpaces` bildet den Zeilenindex über `indexOf` | `Computer.js:23` | ja (bei geteilter Zeilen-Referenz) | nein — funktioniert zufällig |
| 5 | `getElementIDNeededToWin` sucht die Line über `indexOf` | `Computer.js:72`, `78` | ja | nein — nachgewiesen folgenlos |
| 6 | `chooseRandom`/`easyChooseSpace` liefern `undefined` bei leerer Liste bzw. vollem Board | `Computer.js:37`, `155` | ja | nein — durch `TicTacToe.js:117` maskiert |
| 7 | `_win_conditions` lässt den letzten Treffer gewinnen | `GameResult.js:85-91` | ja | nein — braucht ein illegales Board |
| 8 | `line.includes(0)` sucht eine Zahl im String | `Computer.js:69`, `75` | **nein** | nein — kein Verhalten vorhanden |

Keiner der acht erreicht heute den Spieler. Drei davon (2, 3, 6) nur deshalb nicht, weil je eine
einzige andere Codezeile sie abfängt.

---

## 1 — `writeToBoard` verwirft das Ergebnis des eigenen `map`

### Wo

`src/scripts/game/Board.js:173-188`

```js
static writeToBoard(board, id, player=0) {
    let arr = id.split("-");
    arr.map(element => parseInt(element));
    switch (player) {
        case 1:
            board[arr[0]][arr[1]] = 1;
```

### Was passiert

`Array.prototype.map` gibt ein neues Array zurück und lässt das Original unangetastet. Der
Rückgabewert wird nirgends zugewiesen, also bleibt `arr` das, was `split` geliefert hat: zwei
Strings. Getroffen wird die richtige Cell trotzdem, weil der Indexzugriff `board["1"]["2"]` den
String zur Eigenschaft macht und damit dasselbe Element erwischt wie `board[1][2]`. Die
`parseInt`-Zeile schreibt eine Absicht hin, die sie nicht ausführt.

### Belegt durch

```
after writeToBoard("1-2",1): [[0,0,0],[0,0,1],[0,0,0]]
typeof arr[0] after map: string ["1","2"]
row["2"] === 7 / row[2] === 7
after clear: [[0,0,0],[0,0,0],[0,0,0]]
returns same ref: true [[2,0,0],[0,0,0],[0,0,0]]
```

Also: die CellId trifft die richtige Cell, `arr` besteht danach unverändert aus Strings, und der
Zugriff über den String liefert dasselbe Element wie der über die Zahl.

### Auswirkung heute

**Keine.** Die Zeile ist toter Code; das Verhalten ist identisch mit und ohne sie. Der Schaden ist
ausschließlich Lesbarkeit: wer die Methode liest, glaubt, `arr` enthalte Zahlen, und baut darauf eine
spätere Änderung — etwa einen Vergleich `arr[0] === 0` statt `arr[0] === "0"`, der dann still
fehlschlägt.

### Empfohlene Behebung

`let [row, col] = id.split("-").map(Number);` und danach `board[row][col]`. **Keine sichtbare
Verhaltensänderung** — solange die CellId dem Format `"row-col"` entspricht, was sie im gesamten
Code tut (`getEmptySpaces` erzeugt sie, die Button-Ids im DOM tragen sie).

### Reihenfolge

Der Test aus der Testsuite-Spec („Eine CellId mit String-Indizes trifft die richtige Cell") muss
vorher existieren. Er bleibt nach der Behebung grün, weil Zahlen wie Strings dieselbe Cell treffen —
was dieser Behebung ihr geringes Risiko gibt.

---

## 2 — `winningLine` ist veränderlicher statischer Zustand

### Wo

`src/scripts/game/GameResult.js:8`, beschrieben in `42-72`, zurückgesetzt in `Board.js:92` und
`Computer.js:233`

```js
static winningLine = [];
...
if (this._win_conditions(rows) === 1) {
    if (this.winningLine.length === 0) {
        this.winningLine.push("row", rows);
    }
    winner = 1;
}
```

### Was passiert

Drei Eigenschaften greifen ineinander:

1. **Der Zustand überlebt Partien.** Er hängt an der Klasse, nicht an einem Board.
2. **Geschrieben wird nur, solange er leer ist.** Ist etwas drin, bleibt es drin — auch wenn die
   nächste Partie ganz anders ausgeht.
3. **Geleert wird er aus zwei Modulen**, `Board.resetGame()` und mitten in der Schleife von
   `Computer.godlikeChooseSpace()` (`Computer.js:233`). Die Suche braucht das, weil ihre
   Basisfall-Aufrufe von `getGameResult` sonst die WinningLine hypothetischer Bretter festhalten.

Dazu passt der Name nicht zum Wert: gespeichert wird ein Kategorie-Tag plus **alle** Lines dieser
Kategorie. Die Tags sind zudem uneinheitlich — `"row"` im Singular, `"cols"` und `"diags"` im Plural.

### Belegt durch

```
res 111|22_|___ = 1
winningLine = ["row",["111","220","000"]]
res 222|11_|___ = 2
winningLine still = ["row",["111","220","000"]]
```

Die zweite Partie hat einen anderen Outcome und eine andere Gewinn-Line, `winningLine` zeigt
weiterhin auf die erste. Weitere Formen, je nach Kategorie:

```
1_2|1_2|1__  ->  ["cols",["111","000","220"]]
1_2|_1_|2_1  ->  ["diags",["111","212"]]
```

Nebenwirkung der Suche, gemessen mit vorbelegtem `winningLine`:

```
after godlike on undecided board, winningLine = []
decided board: before = ["row",["111","220","000"]]  after = ["row",["111","220","000"]]
```

Bei entschiedenem Board kehrt der Basisfall vor der Schleife zurück und lässt den Wert stehen.

Was daraus im Konsumenten wird, gemessen mit einem Nachbau der lokalen Funktion
`getWinningSpacesID` aus `RandomColorAnimation.js:40-71`:

```
game 1: 111|22_|___ -> 1
  winningLine        : ["row",["111","220","000"]]
  highlighted cells  : ["0-0","0-1","0-2"]      (richtig)
game 2 WITHOUT reset: __2|1_2|1_2 -> 2
  winningLine (stale): ["row",["111","220","000"]]
  highlighted cells  : ["0-0","0-1","0-2"]      (falsch: O gewinnt Spalte 2)
game 2 WITH reset    : ["cols",["011","000","222"]] -> ["0-2","1-2","2-2"]
```

### Auswirkung heute

**Falsch, aber strukturell maskiert — durch eine einzige Zeile.** Jeder Weg in eine neue Partie führt
über `Board.resetGame()` (Buttons „New Game", „Human" und alle drei Difficulty-Buttons in
`TicTacToe.js`), und dort steht `GameResult.winningLine = []`. Fällt dieser eine Aufruf weg oder kommt
ein vierter Einstieg dazu, der ihn vergisst, leuchtet die Animation sofort die falschen Cells an — die
Messung oben zeigt genau das.

Wo der Zustand heute schon kostet, ist der Test: **jede** Testdatei braucht ein `beforeEach` mit
`GameResult.winningLine = []`, sonst hängt das Ergebnis von der Ausführungsreihenfolge ab. Die
Testsuite-Spec macht daraus eine eigene Abnahmebedingung. Das ist der reale Preis: nicht ein Fehler
im Spiel, sondern ein Aufschlag auf alles, was den Code anfasst.

### Empfohlene Behebung

Zwei Schritte, in dieser Ordnung:

1. `_determine_winner` gibt die WinningLine als Rückgabewert mit, statt sie in ein statisches Array
   zu schieben — etwa `{outcome, winningLine}`. Die Bedingung `if (this.winningLine.length === 0)`
   fällt damit ersatzlos weg, und der Reset in `Computer.js:233` ebenfalls.
2. Der Wert wird zu dem, was der Name sagt: die eine entscheidende Line samt ihrer drei CellIds,
   nicht Kategorie-Tag plus alle Lines.

Schritt 2 **ändert sichtbares Verhalten nicht**, verlangt aber, `RandomColorAnimation.getWinningSpacesID`
im selben Zug umzubauen — die Funktion lebt von der heutigen Form und bastelt sich die CellIds über
`indexOf("111")` selbst zusammen. Das ist der Grund, warum diese Behebung nicht lokal bleibt.

### Reihenfolge

Voraussetzung sind die `winningLine`-Tests aus der Testsuite-Spec (gesetzt beim ersten Treffer, nicht
überschrieben solange nicht leer, von `godlikeChooseSpace` auf offenem Board geleert). Sie werden bei
Schritt 1 **rot** und müssen mitgeändert werden — das ist laut 0002 das erwartete Signal, keine
Regression. `RandomColorAnimation` hat keine Tests und bekommt auch keine (kein DOM, Entscheidung
0001); dieser Teil der Behebung muss von Hand im Browser geprüft werden.

---

## 3 — `normalChooseSpace` liefert `undefined` bei entschiedener Partie

### Wo

`src/scripts/game/Computer.js:165-187`, Aufrufer `src/scripts/game/Board.js:141-144`

```js
static normalChooseSpace(board) {
    let elementIDsNeededToWin = this.getElementIDNeededToWin(board);
    let choice;
    if (GameResult.getGameResult(board) === -1) {
        ...
    }
    return choice;
}
```

### Was passiert

`choice` wird deklariert und nur innerhalb des `if` beschrieben. Ist der Outcome nicht `-1`, läuft die
Methode am Block vorbei und gibt `undefined` zurück. Ein zweiter Zweig für diesen Fall existiert nicht.

Beim Aufrufer trifft das auf:

```js
let choiceNormal = Computer.normalChooseSpace(board);
document.getElementById(choiceNormal).innerHTML = "O";
```

`document.getElementById(undefined)` wandelt sein Argument in den String `"undefined"` um, findet kein
Element und liefert `null`; der `.innerHTML`-Zugriff darauf wirft einen `TypeError`.

### Belegt durch

```
111|22_|___ result 1 -> normalChooseSpace = undefined
222|11_|___ result 2 -> normalChooseSpace = undefined
121|221|112 (full draw) result 0 -> normalChooseSpace = undefined
typeof: undefined
```

Alle drei nicht-laufenden Outcomes (1, 2, 0) führen zum selben Ergebnis.

### Auswirkung heute

**Falsch, aber strukturell maskiert.** `computerSetSymbol` hat genau einen Aufrufer, und der steht
hinter dem Wächter in `TicTacToe.js:117`:

```js
if (GameResult.getGameResult(board._board) === -1) {
    board.computerSetSymbol(board._board);
```

Damit ist der einzige Zustand, in dem `normalChooseSpace` `undefined` liefert, genau der, in dem sie
nie aufgerufen wird. Der Spieler sieht nichts. Die Zusicherung der Methode („liefert eine CellId", so
auch das JSDoc: `@returns {string} Cell ID for the move`) ist trotzdem gebrochen, und sie wird nur
außerhalb der Methode eingehalten.

### Empfohlene Behebung

Den Vertrag explizit machen, nicht den Rückgabewert verändern: am Anfang der Methode

```js
if (GameResult.getGameResult(board) !== -1) {
    throw new Error("normalChooseSpace called on a decided board");
}
```

Damit ist der Zustand ein Programmierfehler statt eines stillen `undefined`. **Keine sichtbare
Verhaltensänderung**, weil der Wächter in `TicTacToe.js:117` diesen Pfad ohnehin nie erreicht. Die
Alternative — eine CellId aus den freien Cells zurückgeben — wäre schlechter: sie würde einen Zug auf
einem beendeten Board erfinden.

### Reihenfolge

Der Test „ist die Partie bereits entschieden, kommt `undefined` zurück" aus der Testsuite-Spec muss
vorher stehen und wird durch die Behebung rot — er kehrt sich um zu „wirft". Sinnvollerweise zusammen
mit Defekt 6 behoben, es ist derselbe Fehler in zwei Methoden.

---

## 4 — `getEmptySpaces` bildet den Zeilenindex über `indexOf`

### Wo

`src/scripts/game/Computer.js:17-28`

```js
for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 0) {
            emptySpaces.push(`${board.indexOf(board[i])}-${j}`);
        }
    }
}
```

### Was passiert

Die Laufvariable `i` ist der Zeilenindex und steht direkt zur Verfügung. Stattdessen wird das
Zeilen-Array genommen und im Board wieder gesucht. `indexOf` vergleicht mit `===`, bei Arrays also
über die Referenz, nicht über den Inhalt. Solange jede Zeile ein eigenes Array ist, findet `indexOf`
sie an ihrer eigenen Stelle und das Ergebnis stimmt. Teilen sich zwei Zeilen eine Referenz, liefert
`indexOf` für beide den Index der ersten.

### Belegt durch

```
empty board:                ["0-0","0-1","0-2","1-0","1-1","1-2","2-0","2-1","2-2"]
12_|_1_|__2:                ["0-2","1-0","1-2","2-0","2-1"]
distinct equal rows:        ["0-0","0-1","0-2","1-0","1-1","1-2","2-0","2-1","2-2"]
shared row [row,row,row]:   ["0-0","0-1","0-2","0-0","0-1","0-2","0-0","0-1","0-2"]
shared row [1,0,0]x3:       ["0-1","0-2","0-1","0-2","0-1","0-2"]
```

Inhaltsgleiche, aber getrennt angelegte Zeilen sind unauffällig. Ein Board aus `[row, row, row]`
meldet jede freie Cell in Zeile 0 — neun Einträge, alle in der ersten Zeile, dreimal derselbe Satz.

### Auswirkung heute

**Funktioniert zufällig.** Jedes Board im Produktionscode entsteht als Literal mit drei getrennten
Zeilen-Arrays (`Board`-Konstruktor, `resetGame`), und `writeToBoard` verändert an Ort und Stelle, ohne
Referenzen zu teilen. Die Voraussetzung ist also immer erfüllt, aber sie steht nirgends geschrieben,
und die Methode prüft sie nicht.

Der Sprengsatz liegt nicht beim heutigen Spiel, sondern bei jeder künftigen Änderung, die Bretter
anders erzeugt: `Array(3).fill([0,0,0])` und `Array.from({length: 3}, () => row)` sind genau die
Schreibweisen, zu denen man beim Aufräumen greift. Danach liefert Minimax Züge auf besetzte Cells, und
die Ursache steht drei Ebenen tiefer.

### Empfohlene Behebung

`board.indexOf(board[i])` durch `i` ersetzen. Eine Zeile, ein Zeichen. **Keine sichtbare
Verhaltensänderung** für jedes Board mit getrennten Zeilen — also für jedes, das der Code heute
erzeugt.

### Reihenfolge

Der Test aus der Testsuite-Spec, der `[row, row, row]` festschreibt, wird durch die Behebung rot und
kehrt sich um: statt „meldet alles in Zeile 0" behauptet er dann „meldet die richtigen Zeilen". Genau
dafür ist er da. Die drei normalen `getEmptySpaces`-Tests bleiben grün und sind das Netz.

---

## 5 — `getElementIDNeededToWin` sucht die Line über `indexOf`

### Wo

`src/scripts/game/Computer.js:69-81`

```js
if (countOnes === 2 && line.includes(0)) {
    almostWon['player'] = 1;
    almostWon['line'] = property;
    almostWon['indexOfLine'] = allLines[property].indexOf(line);
```

### Was passiert

`forEach` liefert den Index als zweites Argument frei Haus; der Code sucht die Line stattdessen im
Array wieder. Lines sind Strings, `indexOf` vergleicht also über den Inhalt. Zwei inhaltsgleiche Lines
derselben Kategorie — etwa zwei Zeilen `"110"` — lösen beide zum Index der ersten auf. Die zweite
Threat bekommt damit die CellId der ersten.

### Belegt durch

Auf `11_|11_|___`:

```
rows   = ["110","110","000"]
cols   = ["110","110","000"]
diags  = ["110","010"]
threats = [{"player":1,"elementID":"0-2"},{"player":1,"elementID":"0-2"},
           {"player":1,"elementID":"2-0"},{"player":1,"elementID":"2-0"},
           {"player":1,"elementID":"2-2"}]
count = 5
normalChooseSpace = 2-2
```

Fünf Threats, davon zwei Paare mit identischer CellId. Richtig wären `0-2`, `1-2`, `2-0`, `2-1`,
`2-2`; geliefert werden `0-2`, `0-2`, `2-0`, `2-0`, `2-2`. Zwei echte Threat-Cells fehlen, zwei sind
doppelt.

Dasselbe trifft die Diagonalen. Auf `1_1|_1_|___` sind beide Diagonalen `"110"`, die Gegendiagonale
löst zum Index 0 auf und wird als Hauptdiagonale abgebildet:

```
{"str":"1_1|_1_|___","bugSet":"0-1,2-2","refSet":"0-1,2-0,2-2"}
```

**Vollständiger Durchlauf über alle 19.683 Bretter.** Verglichen wurde gegen eine Referenzfassung, die
identisch ist bis auf den Zeilenindex (`forEach((line, idx) => …)` statt `indexOf(line)`). Gewertet
wurden nur Bretter mit Outcome `-1` und mindestens einer Threat — sonst fällt `normalChooseSpace` auf
`easyChooseSpace` zurück und das Ergebnis ist zufällig:

```
boards total           : 19683
boards considered      : 10020   (Outcome -1 UND mindestens eine Threat)
CellId set differs     : 416
choice on occupied     : 0
choice not a threat    : 0
own winning move missed: 0
block missed           : 0
```

„own winning move missed" prüft: existiert eine eigene Threat, muss die gewählte Cell mit einem
O-Mark tatsächlich gewinnen. „block missed" prüft dasselbe für den X-Mark, wenn keine eigene Threat da
ist. Beide Zähler stehen auf null. Von den 416 abweichenden Brettern sind nach Markanzahl 34 im
legalen Spiel überhaupt erreichbar, Beispiele `121|21_|___`, `212|121|___`, `1_1|212|___`.

### Auswirkung heute

**Mechanisch falsch, nachweislich folgenlos.** Der falsche Index zeigt immer auf die inhaltsgleiche
Zwillings-Line, und weil die Lines identisch sind, sitzt deren Lücke an derselben Stelle. Die
zurückgegebene CellId ist dadurch stets selbst eine echte Threat-Cell — nur nicht die, die zu dieser
Line gehört. In 416 von 10.020 gewerteten Brettern kommt eine andere Menge von CellIds heraus als
korrekt wäre; in keinem einzigen führt das dazu, dass `normalChooseSpace` eine besetzte Cell, eine
Nicht-Threat-Cell oder einen verpassten eigenen Gewinnzug liefert.

Das ist keine Vermutung und keine Stichprobe: der Suchraum ist vollständig abgesucht. Damit ist dieser
Defekt trotz seiner Sichtbarkeit im Rückgabewert der harmloseste der beobachtbaren fünf.

### Empfohlene Behebung

`allLines[property].forEach((line, indexOfLine) => { … })` und `indexOf(line)` durch `indexOfLine`
ersetzen — an beiden Stellen, `Computer.js:72` und `:78`.

**Das ändert sichtbares Verhalten.** Auf den 34 legal erreichbaren der 416 Bretter enthält die
Threat-Liste danach andere CellIds, und weil `normalChooseSpace` den **letzten** passenden Eintrag
nimmt, kann der gewählte Zug ein anderer sein. Der neue Zug ist nicht schlechter — beide sind echte
Threat-Cells — aber er ist ein anderer, und die Difficulty `normal` spielt auf diesen Brettern sichtbar
anders. Diese Behebung braucht daher eine bewusste Zustimmung, nicht nur einen grünen Test.

### Reihenfolge

Zwingend nach dem Test, der die heutige Ausgabe auf `11_|11_|___` festschreibt. Er wird rot und muss
auf die korrekten fünf CellIds umgeschrieben werden. Zusätzlich sollte der oben beschriebene
vollständige Durchlauf **nach** der Behebung erneut laufen: er belegt dann, dass die korrigierte
Fassung dieselben vier Eigenschaften einhält. Vorher sollte Defekt 2 erledigt sein — der Durchlauf
setzt `winningLine` zwischen den Brettern von Hand zurück, und das fällt mit 2 weg.

---

## 6 — `chooseRandom` und `easyChooseSpace` liefern `undefined`

### Wo

`src/scripts/game/Computer.js:35-38` und `154-156`

```js
static chooseRandom(emptySpaces) {
    const random_number = () => Math.floor(Math.random() * (emptySpaces.length));
     return emptySpaces[random_number()];
}
```

### Was passiert

Bei leerer Liste ist `emptySpaces.length` gleich 0, `Math.random() * 0` ist 0, und `emptySpaces[0]`
gibt es nicht. Heraus kommt `undefined`, ohne Fehler und ohne Hinweis. `easyChooseSpace` reicht das
weiter: auf einem vollen Board liefert `getEmptySpaces` eine leere Liste, und damit trifft
`easyChooseSpace` denselben Fall. Bei `Board.computerSetSymbol` landet der Wert wie bei Defekt 3 in
`document.getElementById`.

### Belegt durch

```
chooseRandom([]) = undefined
chooseRandom(["1-1"]) = 1-1
easyChooseSpace(full board 121|221|112) = undefined
easyChooseSpace(empty) = 2-0
```

### Auswirkung heute

**Falsch, aber strukturell maskiert** — durch denselben Wächter wie Defekt 3. Ein volles Board hat nie
den Outcome `-1`: `getGameResult` liefert dort 0 oder den gewinnenden Player. Damit ist
`computerSetSymbol` auf vollem Board unerreichbar und `easyChooseSpace` wird nie in diesem Zustand
aufgerufen.

Der Unterschied zu Defekt 3 ist die Reichweite: `chooseRandom` ist eine allgemeine Hilfsmethode ohne
jeden Bezug zum Spiel. Sie ist der wahrscheinlichste Kandidat für einen zweiten Aufrufer, und der erbt
den stillen `undefined`-Fall.

### Empfohlene Behebung

In `chooseRandom` bei leerer Liste werfen, analog zu Defekt 3:

```js
if (emptySpaces.length === 0) {
    throw new Error("chooseRandom called with no cells");
}
```

`easyChooseSpace` braucht dann nichts Eigenes — der Fehler kommt von unten durch. **Keine sichtbare
Verhaltensänderung**, weil der Pfad im Spiel nicht erreichbar ist.

### Reihenfolge

Nach den Tests „aus einer leeren Liste `undefined`" und „auf vollem Board kommt `undefined` zurück".
Beide werden rot und kehren sich um. Gemeinsam mit Defekt 3 behandeln: ein Commit, eine Entscheidung,
dieselbe Begründung.

---

## 7 — `_win_conditions` lässt den letzten Treffer gewinnen

### Wo

`src/scripts/game/GameResult.js:83-93`

```js
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
```

### Was passiert

`forEach` läuft immer über alle Lines durch; es gibt kein `return` und kein `break`. Jeder Treffer
überschreibt den vorigen. Enthält eine Kategorie eine volle Line für **jeden** Player, entscheidet
allein, welche weiter hinten steht.

### Belegt durch

```
_win_conditions(["111","222","000"]) = 2
_win_conditions(["000","222","111"]) = 1
_win_conditions(["222","111","000"]) = 1
_win_conditions(["111","000","000"]) = 1
_win_conditions(["111","111","000"]) = 1
getGameResult(b("111|222|___")) = 2
   winningLine = ["row",["111","222","000"]]
getGameResult(b("222|111|___")) = 1
   winningLine = ["row",["222","111","000"]]
_determine_winner(b("111|222|___")) = 2
```

Dieselben zwei Lines, einmal so und einmal umgekehrt, ergeben unterschiedliche Outcomes. Zwei Lines
**desselben** Players sind unauffällig.

Wie oft das Board überhaupt so aussehen kann, über alle 19.683 Bretter gezählt:

```
boards with a complete line for BOTH players : 312
  of those, mark counts plausible            : 156
  examples: ["222|111|___","111|222|___","222|111|1__","111|222|1__"]
```

Die Markanzahl allein schließt 156 dieser Bretter nicht aus. Erreichbar sind sie trotzdem nicht: der
Klick-Handler bricht bei `[1, 2].includes(GameResult.getGameResult(board._board))` ab
(`TicTacToe.js:105`), sobald die erste volle Line steht. Der zweite Gewinn-Mark kann also gar nicht
mehr gesetzt werden.

### Auswirkung heute

**Keine — der Defekt braucht ein Board, das im Spiel nicht vorkommt.** Es ist die schwächste der acht
Meldungen: mechanisch unsauber, aber ohne jeden Pfad dorthin. Zu beachten ist nur, dass `getGameResult`
eine allgemeine Funktion auf `number[][]` ist. Sie prüft die Herkunft ihres Arguments nicht, und wer
sie außerhalb des Klick-Handlers aufruft — eine Analyse, ein Puzzle-Betrieb, ein Test — bekommt für
`111|222|___` die Antwort 2, ohne eine Warnung.

### Empfohlene Behebung

Beide Kategorien voneinander trennen, statt eine Zahl zurückzugeben: `_win_conditions` liefert die
Menge der Player mit voller Line. `_determine_winner` entscheidet dann ausdrücklich — bei zwei Playern
gleichzeitig ist das Board ungültig und die Funktion wirft.

**Keine sichtbare Verhaltensänderung**, weil der Zustand im Spiel nicht auftritt. Das ist zugleich der
Grund, diese Behebung nicht allein zu machen: sie fasst die Kernfunktion der Gewinnerkennung an und
zahlt nichts zurück. Sinnvoll nur zusammen mit dem Umbau aus Defekt 2, der `_determine_winner` ohnehin
umschreibt.

### Reihenfolge

Nach dem Test, der `["111","222","000"] → 2`, die Umkehrung `→ 1` und `getGameResult("111|222|___") → 2`
festschreibt. Er wird rot. **Und nach Defekt 2**, weil beide dieselbe Funktion betreffen und zwei
Änderungen an `_determine_winner` in Folge zweimal dieselben Tests aufreißen.

---

## 8 — `line.includes(0)` sucht eine Zahl im String

### Wo

`src/scripts/game/Computer.js:69` und `:75`

```js
if (countOnes === 2 && line.includes(0)) {
...
} else if (countTwos === 2 && line.includes(0)) {
```

### Was passiert

`line` ist ein String wie `"110"`. `String.prototype.includes` wandelt sein Argument in einen String
um, bevor es sucht — `includes(0)` wird also zu `includes("0")`. Gemeint war offensichtlich das
Zeichen; geschrieben steht die Zahl. Ein Typfehler, den die Sprache still wegräumt.

Die gleiche Verwechslung steht in `GameResult.js:23` — dort allerdings korrekt, weil `arr` tatsächlich
Zahlen enthält.

### Belegt durch

```
"110".includes(0)   = true
"110".includes("0") = true
"112".includes(0)   = false
"112".includes("0") = false
lines out of 27 where includes(0) !== includes("0"): 0
```

Über alle 27 möglichen Lines aus den Zeichen `0`, `1`, `2` stimmen beide Fassungen überein. Es gibt
keine Eingabe, bei der sich die Varianten unterscheiden.

### Auswirkung heute

**Keine, und das ist beweisbar statt geschätzt.** Der Wertebereich einer Line ist auf 27 Fälle
begrenzt, alle sind geprüft, keiner weicht ab. Der Defekt ist **nicht beobachtbar** — es gibt kein
Verhalten, das man behaupten könnte, und deshalb hat er als einziger der acht laut Testsuite-Spec
bewusst keinen Test.

Der Schaden ist derselbe wie bei Defekt 1: der Code sagt etwas anderes, als er tut. Wer daraus
schließt, dass `line` Zahlen führt, liegt falsch.

### Empfohlene Behebung

`line.includes("0")` an beiden Stellen. **Keine Verhaltensänderung, nachgewiesen für den gesamten
Wertebereich.**

### Reihenfolge

Keine Voraussetzung. Die einzige der acht Behebungen, die kein Netz braucht, weil die Äquivalenz
vollständig durchgerechnet ist. Sinnvollerweise als Beifang bei der nächsten Änderung an
`getElementIDNeededToWin` — also zusammen mit Defekt 5.

---

## Was zuerst

Sortiert nach Nutzen minus Risiko, nicht nach Aufwand.

**1. Defekt 2 — `winningLine`.** Der einzige, für den eine falsche Ausgabe konkret gemessen ist
(`["0-0","0-1","0-2"]` statt `["0-2","1-2","2-2"]`), und der einzige, dessen Schadensfreiheit an einer
einzelnen Zeile hängt, die jeder neue Einstiegspunkt vergessen kann. Dazu belastet er jede Testdatei
mit einem `beforeEach` und jede künftige Änderung mit versteckter Reihenfolgeabhängigkeit. Zugleich
der riskanteste, weil `RandomColorAnimation` mitmuss — deshalb zuerst, solange die Suite frisch ist
und niemand darauf aufbaut.

**2. Defekte 3 und 6 — die stillen `undefined`.** Zwei Methoden brechen ihre eigene Zusicherung, und
nur ein `if` beim Aufrufer verhindert einen `TypeError` im DOM. Die Behebung ist billig, ändert nichts
Sichtbares und macht den Fehler laut statt still. Gemeinsam behandeln, es ist derselbe Fehler.

**3. Defekt 4 — `indexOf` in `getEmptySpaces`.** Ein Zeichen, kein Risiko, kein sichtbarer Unterschied.
Der Wert liegt ganz in der Zukunft: `Array(3).fill(row)` irgendwann später produziert sonst Züge auf
besetzte Cells, und die Ursache steht drei Ebenen tiefer. Landmine für einen Tastendruck entschärft.

**4. Defekt 5 — `indexOf` in `getElementIDNeededToWin`.** Derselbe Fehler, aber teurer: er **ändert**
das Spiel auf 34 erreichbaren Brettern. Deshalb nach 4 und nicht zusammen damit — die Behebung braucht
eine Zustimmung, keinen grünen Test. Dass sie trotzdem lohnt, liegt nicht am heutigen Schaden (es gibt
keinen, 10.020 Bretter geprüft), sondern daran, dass die Harmlosigkeit ein Zufall der Geometrie ist:
sie hält, weil Zwillings-Lines ihre Lücke an derselben Stelle haben. Diese Begründung überlebt keine
Änderung an der Linienzerlegung.

**5. Defekte 1 und 8 — der tote `map`, die Zahl im String.** Beifang. Kein Verhalten, kein Risiko,
kein Test nötig (8) bzw. ein Test, der grün bleibt (1). Nicht als eigene Arbeit einplanen, sondern
mitnehmen, wenn ohnehin jemand in `Board.writeToBoard` und `getElementIDNeededToWin` steht.

### Was ich liegen lassen würde

**Defekt 7 — `_win_conditions`.** Als eigenständige Arbeit nicht. Der Zustand ist im Spiel
unerreichbar, der Eingriff sitzt mitten in der Gewinnerkennung, und der Ertrag ist eine Antwort, die
niemand abfragt. Wenn, dann als Nebenprodukt von Defekt 2 — `_determine_winner` wird dort ohnehin neu
geschrieben, und dann kostet das ordentliche Verhalten bei zwei vollen Lines fast nichts.

**Defekt 8** ist als Einzeländerung ebenfalls nicht die Sitzung wert; er steht oben nur deshalb in der
Beifang-Gruppe, weil er zufällig neben Defekt 5 in derselben Methode liegt.

Alle übrigen sechs würde ich anfassen — aber keinen davon, bevor der Test steht, der sein heutiges
Verhalten festschreibt. Das ist der ganze Zweck von Entscheidung 0002: die Suite ist nicht die
Absicherung eines Zustands, sondern die Erlaubnis, ihn zu verlassen.
