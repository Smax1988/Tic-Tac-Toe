"use strict";

/**
 * Helper class for dynamically creating the HTML structure of the Tic Tac Toe game.
 * Contains static methods for creating UI components like the game container,
 * buttons, navigation bar, main menu, and the 3x3 game grid.
 */
export default class HtmlCreator {

    /**
     * Creates the complete game UI and prepends it to the specified element.
     * @param {HTMLElement} elementToPrependGame - The container element for the game.
     * @param {string} cssFile - Path to the CSS stylesheet.
     */
    static createGame(elementToPrependGame, cssFile) {
        let gameContainer = this._createGameContainer();
        let firstChild = elementToPrependGame.firstChild;
        elementToPrependGame.insertBefore(gameContainer, firstChild);
        gameContainer.appendChild(this._createMainMenu());
        gameContainer.appendChild(this._createNavigation());
        gameContainer.appendChild(this._createGameArea());
        this._createStyleSheetLink(cssFile);
    }

    /**
     * Creates the main wrapper div for the game.
     * @returns {HTMLDivElement} The game container element.
     */
    static _createGameContainer() {
        return this._createDiv("game-wrapper");
    }

    /**
     * Creates a div element with the specified CSS class.
     * @param {string} className - The CSS class name.
     * @returns {HTMLDivElement} The created div element.
     */
    static _createDiv(className) {
        let div = document.createElement("div");
        div.className = className;

        return div;
    }

    /**
     * Creates a button element.
     * @param {string} id - The button's ID.
     * @param {string} className - The CSS class (optional).
     * @param {string} text - The button text (optional).
     * @returns {HTMLButtonElement} The created button element.
     */
    static _createButton(id, className, text) {
        let button = document.createElement("button");
        button.id = id;
        button.textContent = text || "";
        if (className) {
            button.className = className;
        }

        return button;
    }

    /**
     * Creates a paragraph element.
     * @param {string} id - The paragraph's ID.
     * @param {string} paragraphText - The text content.
     * @returns {HTMLParagraphElement} The created paragraph element.
     */
    static _createParagraph(id, paragraphText) {
        let paragraph = document.createElement("p");
        paragraph.id = id;
        paragraph.textContent = paragraphText;

        return paragraph;
    }

    /**
     * Creates an anchor element that opens in a new tab.
     * @param {string} linkText - The visible link text.
     * @param {string} url - The target URL.
     * @returns {HTMLAnchorElement} The created anchor element.
     */
    static _createLink(linkText, url) {
        let link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.textContent = linkText;

        return link;
    }

    /**
     * Creates a heading element (h1, h2, etc.).
     * @param {string} type - The heading type (e.g., "h1", "h2").
     * @param {string} text - The heading text.
     * @returns {HTMLElement} The created heading element.
     */
    static _createHeadline(type, text) {
        let headline = document.createElement(type);
        headline.textContent = text;

        return headline;
    }

    /**
     * Creates the main menu overlay with game mode selection (Human vs Computer)
     * and difficulty options (Easy, Normal, Godlike).
     * @returns {HTMLDivElement} The menu overlay element.
     */
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

    /**
     * Creates the navigation bar containing menu buttons, game status display,
     * and score tracking for both players.
     * @returns {HTMLElement} The navigation element.
     */
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

    /**
     * Creates the 3x3 game grid with clickable buttons for each cell.
     * Button IDs follow the pattern "row-col" (e.g., "0-0", "1-2").
     * @returns {HTMLDivElement} The game area element.
     */
    static _createGameArea() {
        let gameArea = this._createDiv("game-area");

        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                gameArea.appendChild(this._createButton(`${i}-${j}`, "spaces", null));
            }
        }
        return gameArea;
    }

    /**
     * Injects the CSS stylesheet into the document head.
     * @param {string} cssFile - Path to the CSS file.
     */
    static _createStyleSheetLink(cssFile) {
        let link = document.createElement("link");
        link.href = cssFile;
        link.type = "text/css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }
}
