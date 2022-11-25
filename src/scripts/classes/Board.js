"use strict";
/**
 * Die Klasse stellt alle Methoden zur Verfügung, die für die generelle Abwicklung des Spiels 
 * benötigt werden.
 */
class Board {

    /**
     * Der Konstruktor erstellt bei Instanziierung der Klasse "Board" die Ergebnismatrix (this._borad) als Repräsentation
     * des Spielfeldes und alle weiteren Variablen, die für die Methoden der Klasse benötigten werden.
     */
    constructor() {
        this.player = 1;
        this.computer = false;
        this.difficulty = "";
        this._board = 
                        [
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0]
                        ];
        
        this.spaces = document.querySelectorAll(".spaces");
        this.result = document.querySelector("#game-result");
        this.player1 = document.getElementById("player-1");
        this.player2 = document.getElementById("player-2")
        this.totalWinsX = 0;
        this.totalWinsO = 0;
    }

    /**
     * Setter-Methode, welche die property computer auf true oder false setzt.
     * @param {boolean} trueORfalse - true: Computer ist der Gegner. False: Mensch ist der Gegner
     */
    setComputer(trueORfalse) {
        switch (trueORfalse) {
            case true:
                this.computer = true;
                break;
            case false:
                this.computer = false; 
                break;
            default:
                break;
        }
    }

    /**
     * Setter-Methode, welche die property difficulty setzt;
     * @param {string} mode - accepts "easy", "normal" or "godlike";
     */
    setDifficulty(mode) {
        this.difficulty = mode;
    }

    /**
     * Diese Methode wechselt den aktiven Spieler
     */
    switchPlayer() {
        switch (this.player) {
            case 1:
                this.player = 2;
                break;
            case 2:
                this.player = 1;
                break;
            default:
                break;
        }
    }

    /**
     * Diese Methode setzt das Spiel zurück sodass von Vorne begonnen werden kann.
     */
    resetGame() {
        this.spaces.forEach(space => {
            space.innerHTML = "";
        })

        this._board = 
        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.result.removeAttribute('style');
        this.spaces.forEach(space => space.removeAttribute('style'));
        gameResult.winningLine = [];
        this.player = 1;
        this.displayPlayer();
        document.getElementById("total-player-1").style.color = "white";
        document.getElementById("total-player-2").style.color = "white";
    }

    /**
     * Diese Methode setzt die total Wins beider Spieler wieder auf Null zurück und aktualisiert auch die Anzeige
     */
    resetTotalWins() {
        this.totalWinsO = 0;
        this.totalWinsX = 0;
        this.displayTotalWins();
    }

    /**
     * Diese Methode schreibt das Symbol des Spielers, der gerade an der Reihe ist, in das Feld "space" 
     * @param {object} space - html-button, der vom Spieler angeklickt wurde.
     */
    playerSetSymbol(space) {
            switch(this.player) {
                case 1:
                    space.innerHTML = "X";
                    space.style.color = "#29007A";
                    break;
                case 2:
                    space.innerHTML = "O";
                    space.style.color = "#C70554";
                    break;
                default:
                    break;
            }
        }
    
    /**
     * Diese Methode lässt den Computer je nach gewählter Schwierigkeitsstufe auf ein Feld setzen
     * und schreibt dann seine Wahl in die Ergebnismatrix
     */
    computerSetSymbol() {
        switch (this.difficulty) {
            case "easy":
                let choiceEasy = computer.easyChooseSpace();
                document.getElementById(choiceEasy).innerHTML = "O";
                document.getElementById(choiceEasy).style.color = "#C70554";
                this.writeToBoard(board._board, choiceEasy, this.player);
                break;
            case "normal":
                let choiceNormal = computer.normalChooseSpace();
                document.getElementById(choiceNormal).innerHTML = "O";
                document.getElementById(choiceNormal).style.color = "#C70554";
                this.writeToBoard(board._board, choiceNormal, this.player);
                break;
            case "godlike":
                let choiceGodlike = computer.godlikeChooseSpace(this._board, this.player).id;
                document.getElementById(choiceGodlike).innerHTML = "O";
                document.getElementById(choiceGodlike).style.color = "#C70554";
                this.writeToBoard(board._board, choiceGodlike, this.player);
                break;
            default:
                break;
        }
    }

    /**
     * Diese Methode holt sich die id eines geklickten html-elements
     * @param {object} event - es wird das event-object beim Klick übergeben.
     * @returns {string} - die id des html-elements als string
     */
    getElementId(event) {
        return event.target.id;
    }

    /**
     * Diese Methode schreibt eine 1 für Spieler X, eine 2 für Spieler O an die jeweilige Stelle in der Ergebnismatrix.
     * Sie schreibt eine 0, wenn kein Spieler übergeben wird. 
     * @param {array} board - multidimensionales Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds =Ergebnismatrix.
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @param {string} id - die id des html-Buttons (=Feld) in das ein Symbol gesetzt wurde.
     * @param {number} player - 1 für Spieler X, 2 für Spieler O, 0 für keinen Spieler = default;
     * @returns {array} board - das nun um einen Spielzug aktualisierte Spielfeld =Ergebnismatrix
     */
    writeToBoard(board, id, player=0) {
        let arr = id.split("-");
        arr.map(element => parseInt(element));
        switch (player) {
            case 1:
                board[arr[0]][arr[1]] = 1;
                break;
            case 2:
                board[arr[0]][arr[1]] = 2;
                break;
            default:
                board[arr[0]][arr[1]] = 0;
                break;
        }
        return board;
    }

    /**
     * Diese Methode Zeigt den aktuellen Spieler im Game-Display an.
     */
    displayPlayer() {
        if (this.computer) {
            switch (this.player) {
                case 1:
                    this.result.innerHTML = "Your Turn";
                    break;
                case 2:
                    this.result.innerHTML = "Computer";
                    break;
                default:
                    break;
            }
        } else {
            switch (this.player) {
                case 1:
                    this.result.innerHTML = "Player X";
                    break;
                case 2:
                    this.result.innerHTML = "Player O";
                    break;
                default:
                    break;
            }    
        }
    }

    /**
     * Diese Methode kümmert sich um die Anzeige des total Win counts und
     * der Anzeige der Schwierigkeitsstufe des Computer-Gegners, sofern einer gewählt wurde.
     * @param {number} winner - 0 für Unentschieden, 1 für Spiler X, 2 für Spieler O, -1 falls noch kein Gewinner feststeht
     */
    displayTotalWins(winner=0) {
        switch (winner) {
            case 1:
                this.totalWinsX++;
                document.querySelector("#total-player-1").innerHTML = this.totalWinsX;
                break;
            case 2:
                this.totalWinsO++;
                document.querySelector("#total-player-2").innerHTML = this.totalWinsO;
                break;
            default:
                document.querySelector("#total-player-2").innerHTML = this.totalWinsO;
                document.querySelector("#total-player-1").innerHTML = this.totalWinsX;
                break;
        }
        
        if (this.computer) {
            this.player1.innerHTML = "You";
            this.player2.innerHTML = "AI";
            switch (this.difficulty) {
                case "easy":
                    document.querySelector("#difficulty-display").innerHTML = "easy";
                    break;
                case "normal":
                    document.querySelector("#difficulty-display").innerHTML = "normal";
                    break;
                case "godlike":
                    document.querySelector("#difficulty-display").innerHTML = "godlike";
                    break;
                default:
                    break;
            }
        } else {
            this.player1.innerHTML = "Wins X";
            this.player2.innerHTML = "Wins O";
            document.getElementById('difficulty-display').innerHTML = "";
        }
    }

    /**
     * Diese Methode zeigt das Ergebnis des Spiels oberhalb des Spielfeldes an.
     * Außerdem wird die Win-Animation gestartet.
     * @param {number} winner - 0 für Unentschieden, 1 für Spiler X, 2 für Spieler O, -1 falls noch kein Gewinner feststeht
     */
    displayGameResult(winner) {
        switch (winner) {
            case 0:
                this.result.innerHTML = "Draw!";
                randomColorAnimation.startRepeatFunction(200);
                break;
            case 1:
                if(this.computer) {
                    this.result.innerHTML = "You win!";
                    randomColorAnimation.startRepeatFunction(200);
                } else {
                    this.result.innerHTML = "Player X wins!";
                    randomColorAnimation.startRepeatFunction(200);
                }
                break;
            case 2:
                if (this.computer) {
                    this.result.innerHTML = "Computer wins!";
                    randomColorAnimation.startRepeatFunction(200);
                } else {
                    this.result.innerHTML = "Player O wins!";
                    randomColorAnimation.startRepeatFunction(200);
                }
                break;
            default:
                break;
        }
    }
}