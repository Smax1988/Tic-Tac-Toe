"use strict";

/**
 * HtmlCreator ist eine Hilfsklasse zur Erstellung von HTML-Elementen für ein Tic Tac Toe Spiel.
 * Diese Klasse enthält statische Methoden zur Erstellung und Manipulation von verschiedenen
 * HTML-Komponenten wie Spielcontainer, Buttons, Paragraphen, Links, Überschriften, Hauptmenü,
 * Navigationsleiste und Spielbereich.
 */
export default class HtmlCreator { 

    /**
     * Erstellt und hängt das Spiel an ein angegebenes HTML-Element an und fügt das CSS-Stylesheet hinzu.
     * @param {HTMLElement} elementToPrependGame - Das HTML-Element, an das das Spiel angehängt werden soll.
     * @param {string} cssFile - Der Pfad zur CSS-Datei.
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
     * Erstellt einen Container für das Spiel.
     * @returns {HTMLDivElement} - Das div-Element, das den Spiel-Container darstellt.
     */
    static _createGameContainer() {
        return this._createDiv("game-wrapper");
    }
    
    /**
     * Erstellt ein div-Element mit einer angegebenen Klasse.
     * @param {string} className - Der Name der CSS-Klasse.
     * @returns {HTMLDivElement} - Das erstellte div-Element.
     */
    static _createDiv(className) {
        let div = document.createElement("div");
        div.className = className;
        
        return div;
    }
    
    /**
     * Erstellt ein Button-Element mit der angegebenen ID, Klasse und Text.
     * @param {string} id - Die ID des Buttons.
     * @param {string} className - Die CSS-Klasse des Buttons.
     * @param {string} text - Der Text des Buttons.
     * @returns {HTMLButtonElement} - Das erstellte Button-Element.
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
     * Erstellt ein Paragraph-Element mit der angegebenen ID und Text.
     * @param {string} id - Die ID des Paragraphen.
     * @param {string} paragraphText - Der Text des Paragraphen.
     * @returns {HTMLParagraphElement} - Das erstellte Paragraph-Element.
     */
    static _createParagraph(id, paragraphText) {
        let paragraph = document.createElement("p");
        paragraph.id = id;
        paragraph.textContent = paragraphText;
        
        return paragraph;
    }

    /**
     * Erstellt ein Link-Element mit dem angegebenen Text und der URL.
     * @param {string} linkText - Der Text des Links.
     * @param {string} url - Die URL, auf die der Link verweist.
     * @returns {HTMLAnchorElement} - Das erstellte Link-Element.
     */
    static _createLink(linkText, url) {
        let link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.textContent = linkText;

        return link;
    }

    /**
     * Erstellt eine Überschrift mit dem angegebenen Typ und Text.
     * @param {string} type - Der Typ der Überschrift (z.B. "h1", "h2").
     * @param {string} text - Der Text der Überschrift.
     * @returns {HTMLElement} - Das erstellte Überschriften-Element.
     */
    static _createHeadline(type, text) {
        let headline = document.createElement(type);
        headline.textContent = text;
        
        return headline;
    }

    /**
     * Erstellt das Hauptmenü des Spiels.
     * Das Hauptmenü besteht aus einem Overlay, dem eigentlichen Menü, Schwierigkeitsoptionen und einem Footer.
     * @returns {HTMLDivElement} - Das div-Element, das das Hauptmenü-Overlay darstellt.
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
     * Erstellt die Navigationsleiste des Spiels.
     * Die Navigation besteht aus Navigationsmenü, Spielanzeige und Gesamtergebniss.
     * @returns {HTMLElement} - Das nav-Element, das die Navigationsleiste darstellt.
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
     * Erstellt den Spielbereich mit einem 3x3 Raster.
     * @returns {HTMLDivElement} - Das div-Element, das den Spielbereich darstellt.
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
     * Erstellt ein Link-Element für das CSS-Stylesheet und fügt es dem Dokumentenkopf hinzu.
     * @param {string} cssFile - Der Pfad zur CSS-Datei.
     */
    static _createStyleSheetLink(cssFile) {
        let link = document.createElement("link");
        link.href = cssFile;
        link.type = "text/css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }
}