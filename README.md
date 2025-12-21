# Tic Tac Toe

Ein einfaches Tic-Tac-Toe-Spiel in Vanilla JavaScript - spielbar gegen einen anderen Menschen oder gegen den Computer (3 Schwierigkeitsstufen).

![Tic Tac Toe Demo](docs/demo.gif)

## Features

- Mensch vs. Mensch
- Mensch vs. Computer (Easy / Normal / Godlike)
- Gewinn-Animation
- Punktestand-Anzeige

---

## Schnellstart

### Option 1: Direkt im Browser

1. Repository klonen:
   ```bash
   git clone https://github.com/Smax1988/Tic-Tac-Toe.git
   ```

2. `index.html` im Browser öffnen - fertig!

### Option 2: In dein eigenes Projekt einbinden

1. Dateien kopieren:
   - `src/scripts/` in dein Projekt
   - `src/styles/styles.css` in dein Projekt

2. Im HTML einbinden:
   ```html
   <script type="module">
     import TicTacToe from './src/scripts/classes/TicTacToe.js';

     document.addEventListener('DOMContentLoaded', () => {
       TicTacToe.initialize();
     });
   </script>
   ```

Das Spiel wird automatisch am Anfang des `<body>` eingefuegt.

---

## Optionen

Die `initialize()`-Funktion akzeptiert zwei optionale Parameter:

| Parameter | Beschreibung | Standardwert |
|-----------|--------------|--------------|
| `element` | HTML-Element, in das das Spiel eingefuegt wird | `document.body` |
| `cssPath` | Pfad zur CSS-Datei | `"./src/styles/styles.css"` |

### Beispiele

**Spiel in ein bestimmtes Element einfuegen:**
```javascript
const container = document.getElementById('game-container');
TicTacToe.initialize(container);
```

**Eigenen CSS-Pfad angeben:**
```javascript
TicTacToe.initialize(undefined, '/assets/css/tictactoe.css');
```

**Beides kombinieren:**
```javascript
const container = document.getElementById('game-container');
TicTacToe.initialize(container, '/assets/css/tictactoe.css');
```

---

## Installation via npm

```bash
npm install ttt-game
```

```javascript
import TicTacToe from 'ttt-game';

TicTacToe.initialize();
```

> **Hinweis:** Das CSS muss separat eingebunden werden - entweder als `<link>` im HTML oder ueber den zweiten Parameter.

---

## Projektstruktur

```
Tic-Tac-Toe/
├── index.html                    # Demo-Seite
├── src/
│   ├── scripts/
│   │   ├── classes/
│   │   │   ├── TicTacToe.js      # Hauptklasse (Einstiegspunkt)
│   │   │   ├── Board.js          # Spielfeld-Logik
│   │   │   ├── Computer.js       # KI (inkl. Minimax)
│   │   │   ├── GameResult.js     # Gewinner-Ermittlung
│   │   │   ├── HtmlCreator.js    # DOM-Erstellung
│   │   │   └── RandomColorAnimation.js
│   │   └── ttt-game.js           # npm Entry-Point
│   └── styles/
│       └── styles.css
├── docs/
│   └── demo.gif
└── README.md
```

---

## Fuer ASP.NET Core Projekte

<details>
<summary>Klicken zum Ausklappen</summary>

Da ASP.NET statische Dateien aus `wwwroot` serviert, muss das npm-Paket dorthin kopiert werden.

### Automatisches Kopieren beim Build

Fuege folgendes zu deiner `.csproj`-Datei hinzu:

```xml
<Target Name="CopyTttGame" AfterTargets="Build">
  <ItemGroup>
    <TttFiles Include="node_modules/ttt-game/**/*.*" />
  </ItemGroup>
  <Copy SourceFiles="@(TttFiles)"
        DestinationFiles="@(TttFiles->'wwwroot/lib/ttt-game/%(RecursiveDir)%(Filename)%(Extension)')"
        SkipUnchangedFiles="true" />
</Target>
```

### Einbindung in Razor Page

```html
<div id="game-container"></div>

<script type="module">
  import TicTacToe from '/lib/ttt-game/scripts/ttt-game.js';

  const container = document.getElementById('game-container');
  TicTacToe.initialize(container, '/lib/ttt-game/styles/styles.css');
</script>
```

</details>

---

## Lizenz

MIT
