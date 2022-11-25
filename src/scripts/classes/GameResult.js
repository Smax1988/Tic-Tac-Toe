"use strict";
/**
 * Die Klasse stellt alle Methoden zur Ermittlung des aktuellen Spielstandes zur Verfügung
 */
class GameResult {

    /**
     * Der Konstruktor erstellt beim Instanziieren der Klasse GameResult das Array winningLine.
     * Dieses wird für die Win-Animation benötigt (siehe Klasse RandomColorAnimation). 
     */
    constructor() {
        this.winningLine = [];
    }

    /**
     * Diese Methode bestimmt den aktuellen Stand des Spiels mit Hilfe der privaten Methode _determine_winner().
     * @param {arr} board - verschachteltes Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds =Ergebnismatrix
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @returns {number} 
     * Die Zahl -1 wenn das Spiel noch nicht beendet ist und noch kein Gewinner feststeht. 
     * Die Zahl 1 wenn Spieler X gewonnen hat.
     * Die Zahl 2 wenn Spieler O gewonnen hat. 
     * Die Zahl 0 wenn ein Unentschieden vorliegt.
     */
    getGameResult(board) {
        let arr = [];
        board.forEach(element => {
            element.forEach(ele => {
                arr.push(ele);
            })
        })
        
        if (this._determine_winner(board) === 0 && arr.includes(0)) {
            return -1;
        } else return this._determine_winner(board);
    }
    
    /**
     * Diese private Methode bestimmt den Gewinner des Spiels bzw. ob es sich um ein Unentschieden handelt.
     * Sie nutzt dabei die private Methode _win_conditions().
     * Außerdem wird das array winningLine = [] befüllt um zu ermitteln, welche Zeile, Spalte oder Diagonale zum Sieg geführt hat.
     * Dieses Array wird für die Win-Animation benötigt (siehe Klasse RandomColorAnimation).
     * @param {arr} board - verschachteltes Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds.
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @returns {number} - Die Zahl 1 wenn Spieler X gewonnen hat. Die Zahl 2 wenn Spieler O gewonnen hat. 
     * Die Zahl 0 wenn ein Unentschieden vorliegt.
     */
    _determine_winner(board) {
        let rows = GameResult.get_rows(board);
        let cols = GameResult.get_columns(board);
        let diags = GameResult.get_diagonals(board);
        let winner = 0;
        
        if (this._win_conditions(rows) === 1) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("row", rows);
            }
            winner = 1;
        } else if (this._win_conditions(cols) === 1) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("cols", cols);
            }
            winner = 1;
        } else if (this._win_conditions(diags) === 1) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("diags", diags);
            }
            winner = 1;
        }

        if (this._win_conditions(rows) === 2) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("row", rows);
            }
            winner = 2;
        } else if (this._win_conditions(cols) === 2) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("cols", cols);
            }
            winner = 2;
        } else if (this._win_conditions(diags) === 2 ) {
            if (this.winningLine.length === 0) {
                this.winningLine.push("diags", diags);
            }
            winner = 2;
        }
        return winner;
    }
    
    /**
     * Diese private Methode prüft, ob ein Spieler drei Symbole in einer Linie hat. 
     * @param {array} direction - einfaches Array welches die Zeilen, Spalten oder Diagonalen des Spielfeldes repräsentiert.
     * @returns {number} - Die Zahl 1 wenn Spieler X drei Symbole auf einer Linie hat. 
     * Die Zahl 2 wenn Spieler O drei Symbole auf einer Linie hat. 
     * Die Zahl 0 wenn keiner der beiden Spieler drei Symbole auf einer Linie hat.
     */
    _win_conditions(direction) {
        let winner = 0;
        direction.forEach(ele => {
            if (ele[0] === "1" && ele[1]  === "1" && ele[2] === "1") {
                winner = 1;
            } else if (ele[0] === "2" && ele[1]  === "2" && ele[2] === "2") {
                winner = 2;
            }
        });
        return winner;
    }
    
    /**
     * Diese private Methode gewinnt aus dem gesamten Spielfeld alle Zeilen.
     * @param {array} board - verschachteltes Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds.
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @returns {array} - Ein Array welches alle Zeilen des Spielfeldes repräsentiert.
     */
    static get_rows(board) {
        let rows = [];
        board.forEach(element => {rows.push(element.join(""))});
        return rows;
    }
    
    /**
     * Diese private Methode gewinnt aus dem gesamten Spielfeld alle Spalten.
     * @param {array} board - verschachteltes Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds.
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @returns {array} - Ein Array welches alle Spalten des Spielfeldes repräsentiert.
     */
    static get_columns(board) {
        let cols = [];
        let col1 = [];
        let col2 = [];
        let col3 = [];
        for (let i = 0; i < board.length; i++) {
            col1.push(board[i][0].toString())
        }
        col1 = col1.join("");
        for (let i = 0; i < board.length; i++) {
            col2.push(board[i][1].toString())
        }
        col2 = col2.join("");
        for (let i = 0; i < board.length; i++) {
            col3.push(board[i][2].toString())
        }
        col3 = col3.join("");
        cols.push(col1, col2, col3);
        return cols;
    }
    
    /**
     * Diese private Methode generiert aus dem gesamten Spielfeld alle Diagonalen.
     * @param {array} board - verschachteltes Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds.
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @returns {array} - Ein Array welches alle Diagonalen des Spielfeldes repräsentiert.
     */
    static get_diagonals(board) {
        let diags = [];
        let diag1 = [board[0][0].toString(), board[1][1].toString(), board[2][2].toString()];
        let diag2 = [board[0][2].toString(), board[1][1].toString(), board[2][0].toString()];
        diags.push(diag1.join(""), diag2.join(""));
        return diags;
    }
}