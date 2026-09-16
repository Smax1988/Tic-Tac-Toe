# Tic Tac Toe

A browser tic tac toe game with a human and a computer opponent at three difficulty levels. The
game logic is pure and lives apart from the DOM; only presentation touches the document.

## Language

### The board

**Board**:
The 3×3 game state, held as `number[][]` where 0 is empty, 1 is X and 2 is O. Always the matrix,
never the rendered grid.
_Avoid_: Grid, Field, Matrix

**Cell**:
One of the nine positions on the board. In the DOM its counterpart is a button; in logic it is a
pair of indices.
_Avoid_: Space, Square, Tile

**CellId**:
A cell addressed as `"row-col"`, e.g. `"1-2"`. The single format shared between logic and DOM,
because it doubles as the button's element id.
_Avoid_: ElementID, Position, Coordinate

**Line**:
A row, column or diagonal read as a three-character string, e.g. `"120"`. The unit every win check
operates on.
_Avoid_: Direction, Triple, Row (when columns or diagonals are also meant)

### Play

**Mark**:
What a player puts in a cell — X or O, encoded as 1 and 2. Distinct from Player, which is whose
turn it is.
_Avoid_: Symbol, Token, Sign

**Player**:
Whose turn it is: 1 for X, 2 for O. In a game against the computer, 1 is the human and 2 is the
computer.
_Avoid_: Turn, Side, Actor

**Difficulty**:
How the computer chooses its move: `easy` plays at random, `normal` answers threats, `godlike`
plays Minimax and cannot be beaten.
_Avoid_: Level, Mode, Strength

**Threat**:
A line holding two equal marks and one empty cell — the next move there wins it. The concept
behind `normal`: take your own threat, otherwise block the opponent's.
_Avoid_: AlmostWon, WinningChance, Opportunity

### Outcome

**Outcome**:
The state of a finished or running game, as `getGameResult` returns it: -1 still running, 0 draw,
1 X has won, 2 O has won.
_Avoid_: Result, Status, Winner (for the whole value)

**WinningLine**:
What `GameResult` records when a game is decided, so the victory animation knows what to highlight.
Despite the name it holds a category tag and *all* lines of that category — `["row", ["111","000",
"000"]]` — not the single deciding line. The name states the intent; the value is the whole
category.
_Avoid_: WinLine, HighlightedLine
