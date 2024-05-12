## Usage

### Npm

Download:

```bash
npm install ttt-game
```

Import TicTacToe and call the initialize method within a document ready.
You can pass the element to which the game should be appended as a parameter to the initialize method:
```javascript
import TicTacToe from 'ttt-game';

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.initialize(document.body);
});
```

### Github

Clone from github:
```bash
git clone https://github.com/Smax1988/Tic-Tac-Toe.git
```

Import TicTacToe and call the initialize method within a document ready. 
You can pass the element to which the game should be appended as a parameter to the initialize method:
```javascript
import TicTacToe from './path/to' + '/src/scripts/classes/TicTacToe.js';

document.addEventListener('DOMContentLoaded', () => {
    TicTacToe.initialize(document.body);
});
```

Alternatively, include the 'ttt-game.js' file directly in your HTML. 
The game will be appended to the body element:
```html
<script type="module" src="./src/scripts/ttt-game.js" defer></script>
```
