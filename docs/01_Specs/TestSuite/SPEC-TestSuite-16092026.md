# Testsuite für die Spiellogik

**Erstellt:** 16.09.2026

## Problem

Das Repo hat keine Tests. `src/package.json` trägt den Platzhalter
`"test": "echo \"Error: no test specified\" && exit 1"`, und jede Änderung an `GameResult`,
`Computer` oder `Board` wird von Hand im Browser geprüft — wenn überhaupt.

Das trifft gerade die Stellen, an denen es wehtut. Die Gewinnerkennung läuft über
String-Vergleiche auf Zeilen, Spalten und Diagonalen; die Zuordnung von Diagonal-Treffern auf
CellIds ist eine Kaskade aus `switch`-Blöcken; Minimax rechnet rekursiv auf einem Brett, das es
dabei verändert und wieder herstellt. Das sind die drei Stellen, die ein Refactoring am ehesten
still kaputtmacht, und ausgerechnet dort gibt es kein Netz.

Zweiter Anlass: der Code soll als Grundlage für eine Benchmark-Suite dienen, die Sprachmodelle an
echten Aufgaben misst. Deren Erfolgskriterien sind maschinelle Testläufe — ohne Testsuite kein
Benchmark. Das Repo profitiert unabhängig davon.

## Ubiquitous Language

Die verbindlichen Begriffe stehen in [`CONTEXT.md`](../../../CONTEXT.md). Sie sind mit dieser Spec
neu festgelegt worden, weil der Code für dieselben Dinge verschiedene Namen führt: `spaces`,
`emptySpaces` und Element-Ids meinen alle die **Cell**; `direction` und `line` meinen dieselbe
**Line**; `getElementIDNeededToWin` liefert das, was das Glossar **Threat** nennt.

**Die Tests benutzen die Glossarnamen, der Produktionscode bleibt vorerst, wie er ist.**
Umbenennungen sind ein eigener Schritt und gehören nicht in dieselbe Änderung wie die Tests, die
sie absichern sollen.

## Entscheidungen, die diese Spec voraussetzt

- [0001](../../decisions/0001-node-test-runner-no-dependencies.md) — `node --test`, keine Abhängigkeiten
- [0002](../../decisions/0002-tests-pin-current-behaviour.md) — Tests schreiben das heutige Verhalten fest, auch die Eigenheiten
- [0003](../../decisions/0003-package-json-stays-in-src.md) — `package.json` bleibt in `src/`, Testdateien werden explizit aufgezählt

## Umfang

**Getestet wird, was ohne DOM läuft:**

| Modul | Was | Warum |
|---|---|---|
| `GameResult` | vollständig | DOM-frei, statisch, arbeitet nur auf `number[][]` |
| `Computer` | vollständig | DOM-frei, statisch; `chooseRandom` über einen Stub auf `Math.random` |
| `Board.writeToBoard` | die statische Methode | DOM-frei; der Rest von `Board` ist DOM-gebunden |

„DOM-frei" und nicht „rein": `writeToBoard` verändert das übergebene Brett an Ort und Stelle, und
`godlikeChooseSpace` greift in `GameResult.winningLine`. Testbar ohne Browser sind sie trotzdem.

**Nicht getestet:** `HtmlCreator`, `RandomColorAnimation`, `TicTacToe.initialize`, der
`Board`-Konstruktor und alle `display*`-Methoden. Sie brauchen ein `document` und damit eine
Abhängigkeit, die Entscheidung 0001 ausschließt. Es ist Darstellung, keine Spiellogik.

Verifiziert: die drei Logik-Module lassen sich in reinem Node importieren, ohne dass beim Laden ein
`document`-Zugriff erfolgt. Die Suite braucht kein Setup.

## Aufbau

```
src/
  package.json          "test": "node --test test/*.test.js"
  test/
    helpers.js          Brett-Baukasten und gemeinsamer Zustands-Reset
    GameResult.test.js
    Computer.test.js
    Board.test.js
```

Die Tests liegen unter `src/`, `npm test` läuft von dort (Entscheidung 0003).

**Die Testdateien werden im Skript ausdrücklich aufgezählt.** Nachgemessen auf Node 24.15.0: bloßes
`node --test` behandelt **jede** `.js`-Datei unterhalb eines `test/`-Verzeichnisses als Testdatei,
unabhängig vom Namen und auch in Unterverzeichnissen. `helpers.js` würde also ausgeführt und als
bestandene Testdatei gezählt, und jeder Fehler auf oberster Ebene darin ließe die Suite aus dem
falschen Grund scheitern. Der Glob `test/*.test.js` verhindert das.

Alles in **einem** Verzeichnis `test/`, nicht neben den Modulen — so ist die Suite als Ganzes
greifbar, zum Ausführen wie zum Weglassen.

### Der Brett-Baukasten

Bretter als verschachtelte Arrays zu schreiben macht Tests unlesbar. `helpers.js` bietet:

```js
board("12_|_1_|__2")   // → [[1,2,0],[0,1,0],[0,0,2]]
```

Drei Zeilen zu je drei Zeichen, getrennt durch `|`: `1` für X, `2` für O, `_` für leer. Eine Zeile
Testcode zeigt damit die Stellung, statt sie zu verbergen.

### Statischer Zustand muss vor jedem Test zurückgesetzt werden

`GameResult.winningLine` ist ein statisches Array, das zwischen Aufrufen überlebt. `_determine_winner`
beschreibt es **nur, solange es leer ist** — ein früherer Test hinterlässt also eine Gewinnlinie,
die den nächsten still falsch bewerten lässt. Zurückgesetzt wird es im Produktionscode an zwei
Stellen: in `Board.resetGame()` und mitten in `Computer.godlikeChooseSpace()`.

**Jede Testdatei setzt `GameResult.winningLine = []` in einem `beforeEach`.** Ohne das ist die
Suite von der Ausführungsreihenfolge abhängig, und der Fehler zeigt sich erst, wenn jemand einen
Test einfügt. `helpers.js` stellt die Funktion bereit, damit sie nicht dreimal abgeschrieben wird.

## Was geprüft wird

Rund 70 Tests. Die folgende Aufstellung ist die Vorgabe, nicht eine Anregung — sie legt fest, wann
die Suite vollständig ist.

### `GameResult`

`_win_conditions` und `_determine_winner` tragen einen Unterstrich und werden trotzdem direkt
getestet: über `getGameResult` allein lässt sich ein Fehlurteil nicht von einem Fehler in der
Linienzerlegung unterscheiden. Die Tests dienen der Eingrenzung, nicht der Absicherung einer
öffentlichen Schnittstelle — wird eine der beiden umbenannt, dürfen ihre Tests mitwandern.

- **`get_rows`, `get_columns`, `get_diagonals`** — leeres Brett, gemischtes Brett, volles Brett.
  Für die Diagonalen ausdrücklich beide Richtungen und die Reihenfolge `[Haupt, Gegen]`.
- **`_win_conditions`** — keine Linie voll; eine X-Linie; eine O-Linie; **zwei Linien desselben
  Spielers** (ergibt unauffällig diesen Spieler). Dazu die Eigenheit: bei **je einer Linie pro
  Spieler** entscheidet die Reihenfolge, weil `forEach` den letzten Treffer gewinnen lässt —
  `["111","222","000"]` ergibt 2, dieselben Linien umgekehrt ergibt 1, und `getGameResult` auf
  `111|222|___` liefert entsprechend 2. Im legalen Spiel ist so ein Brett unerreichbar; deshalb ist
  es nie aufgefallen.
- **`_determine_winner`** — X gewinnt je in Zeile, Spalte, Haupt- und Gegendiagonale; dasselbe für
  O; volles Brett ohne Sieger ergibt 0.
- **`getGameResult`** — leeres Brett und teilbesetztes Brett ergeben -1; volles Brett ohne Sieger
  ergibt 0; Sieg für X ergibt 1, für O ergibt 2; ein Sieg auf noch nicht vollem Brett wird erkannt.
- **`winningLine`** — wird bei der ersten erkannten Gewinnlinie gesetzt; wird **nicht**
  überschrieben, solange sie nicht leer ist; ein Aufruf von `godlikeChooseSpace` auf einem **noch
  nicht entschiedenen** Brett leert sie als Nebenwirkung (bei entschiedenem Brett kehrt der
  Basisfall vor der Schleife zurück und lässt sie stehen).

  Die festzuschreibende Form ist `["row", ["111", "000", "000"]]` — Kategorie-Tag plus **alle**
  Linien dieser Kategorie, nicht die eine Gewinnlinie. Der Name sagt die Absicht, der Wert etwas
  anderes; der Test behauptet den Wert.

### `Computer`

- **`getEmptySpaces`** — leeres Brett liefert alle neun CellIds in Zeilenreihenfolge; volles Brett
  liefert eine leere Liste; gemischtes Brett liefert genau die freien. Dazu die Eigenheit: ein Brett
  aus **einer geteilten Zeilen-Referenz** (`[row, row, row]`) meldet jedes freie Feld in Zeile 0,
  weil der Zeilenindex über `indexOf` statt über die Laufvariable bestimmt wird.
- **`chooseRandom`** — mit gestubbtem `Math.random` (`node:test` bringt `t.mock.method` mit) das
  erste und das letzte Element; aus einer einelementigen Liste dieses eine; **aus einer leeren Liste
  `undefined`**.
- **`easyChooseSpace`** — die Rückgabe liegt immer in `getEmptySpaces`; auf vollem Brett kommt
  `undefined` zurück.
- **`getElementIDNeededToWin`** — der umfangreichste Block, weil hier die fehleranfälligste
  Zuordnung sitzt: je eine Threat in Zeile, Spalte, Haupt- und Gegendiagonale, und für die
  Diagonalen **jede der drei Lückenpositionen einzeln** (nachgemessen lösen alle sechs korrekt auf);
  Threats beider Spieler gleichzeitig; Brett ohne Threat liefert eine leere Liste.

  Dazu der **Defekt bei doppelten Linien**: `indexOf(line)` liefert für zwei identische Linien
  derselben Kategorie beide Male den ersten Index. Auf `11_|11_|___` kommt die Threat der zweiten
  Zeile mit der CellId der ersten zurück.

  **Folgenlos, und das ist nachgewiesen, nicht vermutet.** Ein vollständiger Durchlauf aller 19.683
  Bretter findet keine Stellung, in der `normalChooseSpace` deswegen ein besetztes Feld, ein
  Nicht-Threat-Feld oder einen verpassten eigenen Gewinnzug liefert: der falsche Index zeigt stets
  auf die identische Zwillingslinie, deren Lücke an derselben Position sitzt. Festgeschrieben wird
  der mechanische Defekt an `getElementIDNeededToWin` selbst, nicht eine Auswirkung, die es nicht
  gibt.
- **`normalChooseSpace`** — ohne Threat wird auf `easyChooseSpace` zurückgefallen (Rückgabe liegt
  in den freien Feldern); eine gegnerische Threat wird blockiert; eine eigene Threat wird genommen;
  bei beiden zugleich gewinnt die eigene; **ist das Spiel bereits entschieden, kommt `undefined`
  zurück** — festgeschrieben nach Entscheidung 0002.
- **`godlikeChooseSpace(board, player)`** — der zweite Parameter ist **Pflicht**. Fehlt er, läuft
  der Code klaglos in den Minimizer-Zweig und `writeToBoard` *leert* mit seinem Default Felder,
  statt sie zu setzen; heraus kommt ein plausibel aussehendes Ergebnis. Ein Test ohne `player`
  schreibt Unsinn fest.

  Rückgabe: `{id, evaluation}` bei noch offenem Brett, **`{evaluation}` ohne `id`** bei bereits
  entschiedenem — der Basisfall kehrt vor der Schleife zurück.

  **Bewertung und Zugwahl werden getrennt geprüft.** Minimax nimmt unter allen gleich bewerteten
  Zügen den **ersten in `getEmptySpaces`-Reihenfolge**, nicht den taktisch naheliegenden.
  Nachgemessen: auf `11_|22_|___` mit `player = 2` kommt `{id: "0-2", evaluation: 1}`, obwohl `1-2`
  sofort gewinnt; auf `1_2|_2_|11_` kommt `{id: "0-1", evaluation: -1}`, obwohl X auf `2-2` droht.
  Tests, die „nimmt den Gewinnzug" oder „blockt die Niederlage" behaupten, wären also rot — oder,
  schlimmer, auf einem günstig gewählten Brett zufällig grün und würden einen Zufall als Absicht
  festschreiben.

  Geprüft wird daher:
  - **`evaluation` als Wahrheit über die Stellung** — 1 wenn O bei optimalem Spiel gewinnt, 0 bei
    Unentschieden, -1 wenn X gewinnt. Das ist die Aussage über die Suche.
  - **`id` nur dort, wo die Tie-Break-Regel sie eindeutig macht**, und der Test benennt die Regel im
    Kommentar.
  - **Das übergebene Brett ist nach dem Aufruf unverändert** (nachgemessen: trifft zu).
  - Vom leeren Brett aus mit `player = 2` ist die Bewertung 0 — Unentschieden bei beiderseits
    optimalem Spiel. Das ist der eine Volltiefen-Test aus dem Laufzeitbudget.
  - **Mindestens ein Fall mit `player = 1`.** Alle übrigen Godlike-Tests laufen mit `player = 2`,
    und der Minimizer-Auswahlzweig wird dann nur über die Rekursion erreicht — also nie direkt
    geprüft. Nachgemessen: `11_|22_|___` mit `player = 1` ergibt `{id: "0-2", evaluation: -1}`.

### `Board.writeToBoard`

- Setzt 1 und 2 an die richtige Stelle; ohne `player` wird das Feld geleert.
- **Verändert das übergebene Brett an Ort und Stelle** und gibt dieselbe Referenz zurück.
- Eine CellId mit String-Indizes trifft das richtige Feld — das `map` in der Methode wirft sein
  Ergebnis weg, es funktioniert allein über die Typumwandlung beim Indexzugriff. Festgeschrieben
  nach Entscheidung 0002, mit einem Kommentar, der das benennt.

## Laufzeitbudget

Gemessen auf Node 24: `godlikeChooseSpace` braucht vom **leeren Brett 1.445 ms**, nach einem Zug
152 ms, nach drei Zügen 2 ms. Minimax läuft ohne Memoisierung und ohne Alpha-Beta, und jeder Knoten
baut Zeilen-, Spalten- und Diagonal-Strings neu auf.

Auf anderer Hardware gemessen: 1.869 ms statt 1.445 ms für dieselbe Stellung. Der eine
Volltiefen-Test frisst damit rund 40 Prozent des Budgets; auf langsamer CI-Hardware ist der
Spielraum dünner, als die 1,45 s vermuten lassen. Stellungen mit zwei gesetzten Zügen liegen bei
20 bis 31 ms und fallen nicht ins Gewicht.

Daraus folgt eine Vorgabe: **höchstens ein Test rechnet vom leeren Brett.** Alle übrigen
Godlike-Tests setzen mindestens zwei Züge voraus. Zielmarke für die gesamte Suite ist **unter fünf
Sekunden**; wird sie gerissen, sind zu viele tiefe Stellungen im Spiel.

## Abnahme

Die Arbeit ist fertig, wenn:

1. `npm test` aus `src/` grün durchläuft, auf einem frischen Checkout, **ohne `npm install`**.
2. Alle in „Was geprüft wird" aufgezählten Fälle vorhanden sind.
3. Die Suite unter fünf Sekunden bleibt.
4. **Jede Testdatei auch einzeln grün ist** (`node --test test/Computer.test.js` und so fort).
   `node --test` kennt keine Reihenfolgeumkehr, deshalb ist das der praktikable Nachweis, dass
   keine Datei von einem Zustand abhängt, den eine andere hinterlassen hat. Ergänzend belegen
   **zwei** Tests in Deklarationsreihenfolge, dass der `beforeEach` greift: der erste füllt
   `winningLine` absichtlich, der zweite prüft, dass sie leer ist. Ein einzelner Test kann sein
   eigenes `beforeEach` nicht beobachten.
5. Jeder Test, der eine Eigenheit statt einer Absicht festschreibt, einen Kommentar trägt, der das
   sagt und auf Entscheidung 0002 verweist. Das betrifft die **sieben beobachtbaren** Eigenheiten
   aus 0002. Die achte — `includes(0)` auf einem String — hat bewusst **keinen** Test: nach der
   Typumwandlung ist sie von `includes("0")` nicht unterscheidbar, es gibt kein Verhalten zu
   behaupten.

## Nicht Gegenstand dieser Spec

- **Keine Reparaturen.** Die acht gefundenen Eigenheiten werden festgeschrieben, nicht behoben
  (Entscheidung 0002). Eine davon vor den Tests anzufassen hieße, Verhalten ohne Netz zu ändern —
  genau die Reihenfolge, gegen die diese Suite existiert.
- **Keine Umbenennungen.** Der Produktionscode übernimmt die Glossarnamen in einem eigenen Schritt,
  abgesichert durch genau diese Tests.
- **Kein DOM.** Weder jsdom noch ein Browser-Runner (Entscheidung 0001).
- **Keine CI-Anbindung.** Ob `npm test` in einer GitHub Action läuft, ist eine eigene Entscheidung.
