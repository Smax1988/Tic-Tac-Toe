# Tic Tac Toe Game

## Usage

### npm:

Download:

```bash
npm install ttt-game
```

Import TicTacToe and call the initialize method within a document ready:

```javascript
import TicTacToe from 'ttt-game';

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.initialize(document.body);
});
```

### Github:

Clone from github:

```bash
git clone https://github.com/Smax1988/Tic-Tac-Toe.git
```
Import TicTacToe and call the initialize method within a document ready:

```javascript
import TicTacToe from './path/to' + '/src/scripts/classes/TicTacToe.js';

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.initialize(document.body);
});
```