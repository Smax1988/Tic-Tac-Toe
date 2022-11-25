"use strict";
/**
 * Klasse stellt alle Methoden zur Verfügung, die für den Computer-Gegner benötigt werden.
 */
class Computer {

    /**
     * Diese Methode bestimmt alle unbestzten Felder des Spielfeldes.
     * @param {array} board - multidimensionales Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds =Ergebnismatrix.
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @returns {array} emptySpaces - eindimensionales Array mit den id's aller leeren Felder.
     */
    getEmptySpaces(board) {
        let emptySpaces = [];
    
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === 0) {
                    emptySpaces.push(`${board.indexOf(board[i])}-${j}`);
                } 
            }
        }
        return emptySpaces;
    }

    /**
     * Diese Methode wählt ein zufälliges leeres Feld aus.
     * @param {array} emptySpaces - eindimensionales Array mit den id's der leeren Felder.
     * @returns {string} id eines einzelnen leeren Feldes 
     */
    chooseRandom(emptySpaces) {
        const random_number = () => Math.floor(Math.random() * (emptySpaces.length));
         return emptySpaces[random_number()];
    }

    
    /**
     * Diese Methode ermittelt die id des Feldes, welches zum Sieg führen würde. Sie tut dies für alle Spieler.
     * @param {array} board - multidimensionales Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds =Ergebnismatrix
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @returns {array} - bestehend aus Objekten. Beispiel: [{"player": 2, "elementID": "2-0"}, {"player": 1, "elementID": "2-0"}]
     * Jedes Objekt enthält den Spieler und die id des Feldes, welches zum Sieg des Spielers führen würde.
     */
    getElementIDNeededToWin(board) {
        
        // Sammelt alle Zeilen, Spalten und Reihen der Ergebnismatrix in einem Objekt.
        let allLines = {
            "row": GameResult.get_rows(board), 
            "column": GameResult.get_columns(board),
            "diagonal": GameResult.get_diagonals(board)
        };

        let collection = [];

        // For-Loop iteriert über alle Zeilen, Spalten und Diagonalen und befüllt das Array collection mit Objekten, welches die
        // Zeile, Spalte und Diagonale enthält, die aus 2 gleichen Zahlen und einem freien Feld bestehen.
        for (const property in allLines) {
            allLines[property].forEach(line => {
                let countOnes = line.replace(/[^1]/g, "").length;
                let countTwos = line.replace(/[^2]/g, "").length;
                const almostWon = {
                    player: 0,
                    line: "",
                    indexOfLine: 0,
                    values: ""
                };
                if (countOnes === 2 && line.includes(0)) {
                    almostWon['player'] = 1;
                    almostWon['line'] = property;
                    almostWon['indexOfLine'] = allLines[property].indexOf(line);
                    almostWon['values'] = line.split("");
                    collection.push(almostWon);
                } else if (countTwos === 2 && line.includes(0)) {
                    almostWon['player'] = 2;
                    almostWon['line'] = property;
                    almostWon['indexOfLine'] = allLines[property].indexOf(line);
                    almostWon['values'] = line.split("");
                    collection.push(almostWon);
                }
            });
        }

        // Diese Schleife iteriert nun über das Array collection um aus den darin enthaltenen Objekten 
        // die id des Feldes zu ermittelt, welches zum Sieg führen würde. 
        let ids = [];
        collection.forEach(object => {
            const obj = {
                player: "",
                elementID: ""
            }
            if (object["line"] === "row") {
                obj['player'] = object['player'];
                obj['elementID'] = `${object['indexOfLine']}-${object['values'].indexOf("0")}`;
                ids.push(obj);
            } else if (object["line"] === "column") {
                obj['player'] = object['player'];
                obj['elementID'] = `${object['values'].indexOf("0")}-${object['indexOfLine']}`;
                ids.push(obj);
            } else if (object["line"] === "diagonal") {
                if (object['indexOfLine'] === 0) {
                    switch (object['values'].indexOf("0")) {
                        case 0:
                            obj['player'] = object['player'];
                            obj['elementID'] = "0-0";
                            ids.push(obj);
                            break;
                        case 1:
                            obj['player'] = object['player'];
                            obj['elementID'] = "1-1";
                            ids.push(obj);
                            break;
                        case 2:
                            obj['player'] = object['player'];
                            obj['elementID'] = "2-2";
                            ids.push(obj);
                            break;
                        default:
                            break;
                    }
                } else if (object['indexOfLine'] === 1) {
                    switch (object['values'].indexOf("0")) {
                        case 0:
                            obj['player'] = object['player'];
                            obj['elementID'] = "0-2";
                            ids.push(obj);
                            break;
                        case 1:
                            obj['player'] = object['player'];
                            obj['elementID'] = "1-1";
                            ids.push(obj);
                            break;
                        case 2:
                            obj['player'] = object['player'];
                            obj['elementID'] = "2-0";
                            ids.push(obj);
                            break;
                        default:
                            break;
                    }
                }
            }
        })
        return ids;
    }

    /**
     * Diese Methode ermittelt ein zufälliges unbesetztes Feld.
     * Der Computer-Gegner der Schwierigkeitsstufe "easy" bedient sich dieser Methode, um ein Feld auszuwählen.
     * @returns {string} - id des gewählten Feldes
     */
    easyChooseSpace() {
        return this.chooseRandom(this.getEmptySpaces(board._board))
    }

    /**
     * Diese Methode verhindert, dass der Spieler drei in einer Linie bekommt und versucht selbst drei einer Linie zu setzen.
     * Der Computer der Schwierigkeitsstufe "godlike" bedient sich dieser Methode.
     * Falls der Spieler zwei Symbole in einer Linie hat, wird das Feld gewählt, welches zum Sieg des Spielers führen würde.
     * Hat der Computer zwei Symbole in einer Linie, wählt er das Feld, welches zu seinem eigenen Sieg führen wird.
     * Sollte es beide Möglichkeiten geben, priorisiert der Computer das Feld, das ihn selbst gewinnen lässt, bevor er den Sieg des Spielers verhindert. 
     * @returns {string} - id des gewählten Feldes
     */
    normalChooseSpace() {
        let elementIDsNeededToWin = this.getElementIDNeededToWin(board._board);
        let choice;
        if (gameResult.getGameResult(board._board) === -1) {
            if (elementIDsNeededToWin.length === 0) {
                return this.easyChooseSpace();
            } else if (elementIDsNeededToWin.length !== 0) {
                elementIDsNeededToWin.forEach(object => {
                    if (object['player'] === 1) {
                        choice = object['elementID'];
                    }
                })
                elementIDsNeededToWin.forEach(object => {
                    if (object['player'] === 2) {
                        choice = object['elementID'];
                    }
                })
            }
        }
        return choice;
    }

    /**
     * Diese Methode bestimmt mit einem Minimax-Algorithmus den best-möglichen Zug für den Computer. 
     * Der Computer der Schwierigkeitsstufe "godlike" bedient sich dieser Methode.
     * @param {array} currentBoard - multidimensionales Array [[0, 1, 2], [0, 1, 2], [0, 1, 0]] als Repräsentation des Spielfelds =Ergebnismatrix.
     * Enthält die derzeitigen Züge der Spieler: 0 entpricht leeres Feld, 1 entspricht Spieler X, 2 entspricht spieler O.
     * @param {number} player - - 1 für Spieler X, 2 für Spieler O.
     * @returns {object} bestMove - enthält die id des Feldes und die evaluation des Zuges
     */
    godlikeChooseSpace(currentBoard, player) {
        // Base
        if (gameResult.getGameResult(currentBoard) === 1) {
            return {evaluation: -1};
        } else if (gameResult.getGameResult(currentBoard) === 2) {
            return {evaluation: 1};
        } else if (gameResult.getGameResult(currentBoard) === 0) {
            return {evaluation: 0};
        } 
        // Bestimme alle leeren Felder    
        let emptySpaces = this.getEmptySpaces(currentBoard);

        // Speichere alle Züge und ihre Bewertung
        let moves = [];

        // Iteriere über das emptySpaces Array um jeden Zug zu bewerten
        for (let i = 0; i < emptySpaces.length; i++) {
            let id = emptySpaces[i];
            let move = {};
            move.id = id;

            // Erstelle ein Backup des Zuges, um ihn im Anschluss wieder rückgängig machen zu können
            let saveMoveID = id;

            // Schreibe den Zug in die Ergebnismatrix
            board.writeToBoard(currentBoard, id, player);
            

            // Bewerte den Zug
            if (player === 2) {
                move.evaluation = (this.godlikeChooseSpace(currentBoard, 1)).evaluation;
            } else {
                move.evaluation = (this.godlikeChooseSpace(currentBoard, 2)).evaluation;
            }

            // Speichere den Zug mit seiner id und der Bewertung im array moves
            moves.push(move);

            // Wiederherstellung der Ergebnismatrix auf die Situation vor dem Zug.
            board.writeToBoard(currentBoard, saveMoveID);

            // Das array winningLine, welches für die Win-Animation benötigt wird und bei jedem Aufruf von getGameResult() erstellt wird,
            // muss am Ende wieder geleert werden. 
            gameResult.winningLine = [];
        }
        
        // MINIMAX ALGORITHMUS
        let bestMove;

        if (player === 2) {
            // Compouter ist Maximizer
            let bestEvaluation = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].evaluation > bestEvaluation) {
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        } else {
            // Spieler is Minimizer
            let bestEvaluation = +Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].evaluation < bestEvaluation) {
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }
        return bestMove;
    }
}