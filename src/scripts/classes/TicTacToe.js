"use strict";

import HtmlCreator from './HtmlCreator.js';
import Board from './Board.js';
import GameResult from './GameResult.js';
import RandomColorAnimation from './RandomColorAnimation.js';

/**
 * Diese Klasse repräsentiert das TicTacToe-Spiel. Sie enthält die statische Methode initialize,
 * die das Spiel initialisiert, das HTML-Layout erstellt und alle erforderlichen Event-Listener
 * für die Interaktion mit dem Spiel hinzufügt. Die Klasse nutzt dabei die Board-Klasse, um das
 * Spielbrett zu verwalten und die Spielmechanik zu handhaben.
 */
export default class TicTacToe {

    /**
     * Diese Methode initialisiert das TicTacToe-Spiel. Sie erstellt das HTML-Layout für das Spiel,
     * fügt Event-Listener für die Benutzerinteraktion hinzu und konfiguriert die Spielparameter.
     * Die Methode akzeptiert zwei optionale Parameter: elementToAppendGameTo und cssFile.
     * Wenn diese Parameter nicht angegeben werden, werden Standardwerte verwendet.
     * 
     * @param {HTMLElement} [elementToPrependGame=document.body] - Das HTML-Element, an das das Spiel angehängt wird. Default: document.body
     * @param {string} [cssFile="./src/styles/styles.css"] - Der Pfad zur CSS-Datei, die für das Spiel verwendet wird. Default: "./src/styles/styles.css"
     */
    static initialize(elementToPrependGame = document.body, cssFile = "./src/styles/styles.css") {
        
        // Create the html
        HtmlCreator.createGame(elementToPrependGame, cssFile);
        
        const board = new Board();

        let winner = -1;

        /**
         * Selektierungen der Elemente des Menu-Overlays:
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        const overlay = document.querySelector(".overlay");
        const computerButton = document.querySelector("#computer");
        const human = document.querySelector("#human");
        const difficulty = document.querySelector(".difficulty");
        const easy = document.querySelector("#easy");
        const normal = document.querySelector("#normal");
        const godlike = document.querySelector("#godlike");
        const closeMenu = document.querySelector("#bt-cancel");


        /**
         * Selektierung der Buttons in der Game-Area:
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        const newGame = document.querySelector("#bt-new-game");
        const menu = document.querySelector("#bt-menu");


        /**
         * Click Events für Buttons im Menu-Overlay:
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        // Dieser Button schließt das Menu-Overlay
        closeMenu.addEventListener("click", () => {
            overlay.style.display = "none";
        });

        // Dieser Button toggelt das Untermenü zur Auswahl der Schwierigkeitsstufen des Computergegners
        computerButton.addEventListener("click", () => {
            if (difficulty.style.visibility === "hidden") {
                difficulty.style.visibility = "visible";
            } else {
                difficulty.style.visibility = "hidden";
            }
        });

        // Dieser Button setzt den Computer auf true, setzt die Schwierigkeit auf "easy",
        // setzt die Total Wins aller Spieler auf 0 zurück und setzt das gesamte Spiel auf Anfang zurück,
        // schleißt das Menu-Overlay und stoppt die Winanimation.
        easy.addEventListener("click", () => {
            board.setComputer(true);
            board.setDifficulty("easy");
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });

        // Dieser Button setzt den Computer auf true, setzt die Schwierigkeit auf "normal",
        // setzt die Total Wins aller Spieler auf 0 zurück und setzt das gesamte Spiel auf Anfang zurück,
        // schleißt das Menu-Overlay und stoppt die Winanimation.
        normal.addEventListener("click", () => {
            board.setComputer(true);
            board.setDifficulty("normal");
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });

        // Dieser Button setzt den Computer auf true, setzt die Schwierigkeit auf "godlike",
        // setzt die Total Wins aller Spieler auf 0 zurück, setzt das gesamte Spiel auf Anfang zurück,
        // schleißt das Menu-Overlay und stoppt die Winanimation.
        godlike.addEventListener("click", () => {
            board.setComputer(true);
            board.setDifficulty("godlike");
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });

        // Dieser Button setzt den computer auf false, setzt die Total Wins aller Spieler auf 0 zurück,
        // setzt das gesamte Spiel auf Anfang zurück, schließt das Menu-Overlay und stoppt die Winanimation.
        human.addEventListener("click", () => {
            board.setComputer(false);
            board.resetTotalWins();
            board.resetGame();
            overlay.style.display = "none";
            RandomColorAnimation.stopRepeatFunction();
        });


        /**
         * Click Events für alle Felder (=Spaces) auf dem Spielfeld (=Board):
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        board.spaces.forEach(space => {
            space.addEventListener("click", (event) => {
                
                // Verhindern, dass auf ein Feld gesetzt werden kann, das bereits belegt ist bzw. wenn ein Gewinner feststeht
                if (space.innerHTML === "X" || 
                    space.innerHTML === "O" ||
                    [1, 2].includes(GameResult.getGameResult(board._board))
                    ) return;

                // Computer als Gegner:
                // Spieler X beginnt und setzt seinen Zug. Dieser Wird in die Ergebnismatrix eingetragen.
                // Danach wird der Spieler gewechselt und der Spieler, welcher nun an der Reihe ist im Game-Display angezeigt.
                if (board.computer) {
                    board.playerSetSymbol(space);
                    let id = board.getElementId(event);
                    Board.writeToBoard(board._board, id, board.player);
                    board.switchPlayer();
                    board.displayPlayer();

                    // Wenn noch kein Gewinner feststeht, ist der Computer nun an der Reihe und setzt sein Symbol.
                    // Danach wird der Spieler gewechselt und der Spieler, welcher nun an der Reihe ist im Game-Display angezeigt.
                    if (GameResult.getGameResult(board._board) === -1) {
                        board.computerSetSymbol(board._board);
                        board.switchPlayer();
                        board.displayPlayer();
                    }

                // Mensch als Gegner:
                // Spieler X beginnt und setzt seinen Zug. Dieser wird in die Ergebnismatrix eingetragen.
                // Danach wird der Spieler gewechselt und der Spieler, welcher nun an der Reihe ist im Game-Display angezeigt.
                } else {
                    board.playerSetSymbol(space);
                    let id = board.getElementId(event);
                    Board.writeToBoard(board._board, id, board.player);
                    board.switchPlayer();
                    board.displayPlayer();
                }

                // Wenn ein Gewinner feststeht wird dieser im Game-Display angezeigt und die Total Wins beider Spieler angezeigt. 
                winner = GameResult.getGameResult(board._board);
                if (winner !== -1) {
                    board.displayGameResult(winner);
                    board.displayTotalWins(winner);
                }
            })
        });


        /**
         * Click Events für Buttons in der Game-Area:
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        // Dieser Button stoppt die Win-Animation und setzt das gesamte Spiel auf Anfang zurück.
        newGame.addEventListener("click", () => {
            RandomColorAnimation.stopRepeatFunction();
            board.resetGame();
        })

        // Dieser Button öffnet das Menu-Overlay
        menu.addEventListener("click", () => {
            overlay.removeAttribute("style");
            difficulty.style.visibility = "hidden";
        });
    }
}