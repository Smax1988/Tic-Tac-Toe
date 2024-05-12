"use strict";

export default class HtmlCreator { 

    static createGame(elementToAppendGame) {
        let gameContainer = this._createGameContainer();
        elementToAppendGame.appendChild(gameContainer);
        gameContainer.appendChild(this._createMainMenu());
        gameContainer.appendChild(this._createNavigation());
        gameContainer.appendChild(this._createGameArea());
        this._createStyleSheetLink();
    }

    static _createGameContainer() {
        return this._createDiv("game-wrapper");
    }
    
    static _createDiv(className) {
        let div = document.createElement("div");
        div.className = className;
        
        return div;
    }
    
    static _createButton(id, className, text) {
        let button = document.createElement("button");
        button.id = id;
        button.textContent = text || "";
        if (className) {
            button.className = className;
        }
        
        return button;
    }

    static _createParagraph(id, paragraphText) {
        let paragraph = document.createElement("p");
        paragraph.id = id;
        paragraph.textContent = paragraphText;
        
        return paragraph;
    }

    static _createLink(linkText, url) {
        let link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.textContent = linkText;

        return link;
    }

    static _createHeadline(type, text) {
        let headline = document.createElement(type);
        headline.textContent = text;
        
        return headline;
    }

    static _createMainMenu() {
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
        let paragraph = this._createParagraph("img-src");
        let link1 = this._createLink("Image by Starline", "https://www.freepik.com/author/starline")
        let link2 = this._createLink("on Freepik", "https://www.freepik.com");
        paragraph.appendChild(link1);
        paragraph.appendChild(link2);
        footer.appendChild(paragraph);
        footer.appendChild(this._createParagraph("me", "by Smax"));
        
        menu.appendChild(footer);
        overlay.appendChild(menu);

        return overlay;
    }

    static _createNavigation() {
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

    static _createGameArea() {
        let gameArea = this._createDiv("game-area");

        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                gameArea.appendChild(this._createButton(`${i}-${j}`, "spaces", null));
            }
        }
        return gameArea;
    }

    static _createStyleSheetLink() {
        let link = document.createElement("link");
        link.href = "./src/styles/styles.css";
        link.type = "text/css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }
}