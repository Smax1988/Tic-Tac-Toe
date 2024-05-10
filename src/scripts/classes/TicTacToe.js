"use strict";

export default class TicTacToe { 

    constructor(elementToAppendGame) {
        this.gameContainer = this._createGameContainer();
        elementToAppendGame.appendChild(this.gameContainer);
        this._createGame();
    }

    _createGame() {
        this.gameContainer.appendChild(this._createMainMenu());
        this.gameContainer.appendChild(this._createNavigation());
        this.gameContainer.appendChild(this._createGameArea());
    }

    _createGameContainer() {
        return this._createDiv("game-wrapper");
    }
    
    _createDiv(className) {
        let div = document.createElement("div");
        div.className = className;
        
        return div;
    }
    
    _createButton(id, className, text) {
        let button = document.createElement("button");
        button.id = id;
        button.textContent = text || "";
        if (className) {
            button.className = className;
        }
        
        return button;
    }

    _createParagraph(id, paragraphText, linkText = null, url = null) {
        let paragraph = document.createElement("p");
        paragraph.id = id;
        paragraph.textContent = paragraphText;

        if (url) {
            let link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.textContent = linkText || "";
            paragraph.appendChild(link);
        }
        
        return paragraph;
    }

    _createHeadline(type, text) {
        let headline = document.createElement(type);
        headline.textContent = text;
        
        return headline;
    }

    _createMainMenu() {
        let overlay = this._createDiv("overlay");
        let menu = this._createDiv("menu");

        menu.appendChild(this._createButton("bt-cancel", null, "🗙"));
        menu.appendChild(this._createHeadline("h1", "Tic Tac Toe"));
        menu.appendChild(this._createHeadline("h5", "vs"));
        menu.appendChild(this._createButton("computer", "bt-menu", "Computer"));
        menu.appendChild(this._createButton("human", "bt-menu", "Human"));
        
        let difficulty = this._createDiv("difficulty");
        difficulty.style.visibility = "hidden";
        difficulty.appendChild(this._createButton("easy", null, "easy"));
        difficulty.appendChild(this._createButton("normal", null, "normal"));
        difficulty.appendChild(this._createButton("godlike", null, "godlike"));
        menu.appendChild(difficulty);

        let footer = document.createElement("footer");
        footer.appendChild(this._createParagraph("img-src", "on Freepik", "Image by Starlink", "https://www.freepik.com/free-vector/retro-80s-landscape-scene-game-style_16738431.htm"));
        footer.appendChild(this._createParagraph("me", "by Smax"));

        overlay.appendChild(menu);

        return overlay;
    }

    _createNavigation() {
        let navigation = document.createElement("nav");
        navigation.appendChild(this._createDiv("empty"));
        
        let navMenu = this._createDiv("nav-menu");
        navMenu.appendChild(this._createButton("bt-menu", null, "Menu"));
        navMenu.appendChild(this._createButton("bt-new-game", null, "New Game"));
        
        navigation.appendChild(navMenu);
        navigation.appendChild(this._createDiv("empty"));
        
        let gameDisplay = this._createDiv("game-display");
        gameDisplay.appendChild(this._createParagraph("game-result"));
        
        navigation.appendChild(gameDisplay);
        navigation.appendChild(this._createDiv("empty"));

        let totalResult = this._createDiv("total-result");
        totalResult.appendChild(this._createParagraph("player-1"));
        totalResult.appendChild(this._createParagraph("player-2"));
        totalResult.appendChild(this._createDiv("empty"));
        totalResult.appendChild(this._createParagraph("difficulty-display"));
        totalResult.appendChild(this._createParagraph("total-player-1"));
        totalResult.appendChild(this._createParagraph("total-player-2"));
        
        navigation.appendChild(totalResult);
        navigation.appendChild(this._createDiv("empty"));

        return navigation;
    }

    _createGameArea() {
        let gameArea = this._createDiv("game-area");

        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                gameArea.appendChild(this._createButton(`${i}-${j}`, "spaces", null));
            }
        }
        return gameArea;
    }
}