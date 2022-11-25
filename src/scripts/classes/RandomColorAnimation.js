"use strict";
/**
 * Diese Klasse stellte alle Methoden zur Verfügung, die für die Win-Animation benötigt werden.
 * Die Win-Animation färbt die drei Felder, die zum Sieg geführt haben, in einem gegebenen Intervall neu ein.
 */
class RandomColorAnimation {
    /**
     * Der Konstruktor erstell beim Instanziieren die Variable intervalID, welche zum beenden der Animation benötigt wird. 
     */
    constructor() {
        this.intervalID;
    }

    /**
     * Methode erzeugt eine zufällige Farbe und färbt bestimmte Felder damit ein.
     * Es werden alle Felder eingefärbt, wenn das Spiel unentschieden endet.
     * Ansonsten werden nur die Felder eingefärbt, die zum Sieg geführt haben. 
     */
    backgroundColor() {

        // Array mit hexcodes der Farben. Bildet den Pool der Farben, aus dem zufällig eine Farbe ausgewählt wird.
        let colorPool = ["#140420", "#310A3F", "#C70554", "#DC327B", "#FF7486", "#161433", "#08F4FD", "#FFF"];

        /**
         * Diese Funktion wählt eine zufällige Farbe aus dem colorPool aus
         * @param {array} - Array mit hexcodes der Farben. Bildet den Pool der Farben, 
         * aus dem zufällig eine Farbe ausgewählt wird.
         * @returns {string} - eine Farbe im hex-code
         */
        function chooseRandomColorFrom(colorPool) {
            const random_number = () => Math.floor(Math.random() * (colorPool.length));
            const color = colorPool[random_number()];
            return color;
        }

        /**
         * Diese Funktion bestimmt die id's aller Spielfelder, die zum Sieg geführt haben.
         * @param {array} arr - multidimensionales array der Form ['string', Array(strings)]. 
         * @returns {array} - eindimensionales array mit den id's als string.
         */
        function getWinningSpacesID(winningLine) {
            let result = [];
            switch (winningLine[0]) {
                case "row":
                    winningLine[1].forEach(element => {
                        if (element === "111" || element === "222") {
                            for (let i = 0; i < 3; i++) {
                                result.push(`${winningLine[1].indexOf(element)}-${i}`);
                            }
                        }
                    })
                    break;
                case "cols":
                    winningLine[1].forEach(element => {
                        if (element === "111" || element === "222") {
                            for (let i = 0; i < 3; i++) {
                                result.push(`${i}-${winningLine[1].indexOf(element)}`);
                            }
                        }
                    })
                    break;
                case "diags":
                    if (winningLine[1].indexOf("111") === 0 || winningLine[1].indexOf("222") === 0) {
                        result.push("0-0", "1-1", "2-2");
                    } else if (winningLine[1].indexOf("111") === 1 || winningLine[1].indexOf("222") === 1) {
                        result.push("0-2", "1-1", "2-0");
                    }
                    break;
                default:
                    break;
            }
            return result;
        } // END of function getWinningSpaces();

        switch (winner) {
            case 0:
                document.querySelectorAll(".spaces").forEach(space => {
                    space.style.background = chooseRandomColorFrom(colorPool);
                    space.style.color = chooseRandomColorFrom(colorPool);
                    document.querySelector("#game-result").style.color = chooseRandomColorFrom(colorPool);
                });
                break;
            case 1:
                getWinningSpacesID(gameResult.winningLine).forEach(id => {
                    document.getElementById(`${id}`).style.background = chooseRandomColorFrom(colorPool);
                    document.getElementById(`${id}`).style.color = chooseRandomColorFrom(colorPool);
                    document.querySelector("#game-result").style.color = chooseRandomColorFrom(colorPool);
                    document.getElementById("total-player-1").style.color = chooseRandomColorFrom(colorPool);
                })
                break;
            case 2:
                getWinningSpacesID(gameResult.winningLine).forEach(id => {
                    document.getElementById(`${id}`).style.background = chooseRandomColorFrom(colorPool);
                    document.getElementById(`${id}`).style.color = chooseRandomColorFrom(colorPool);
                    document.querySelector("#game-result").style.color = chooseRandomColorFrom(colorPool);
                    document.getElementById("total-player-2").style.color = chooseRandomColorFrom(colorPool);
                })
                break;
            default:
                break;
        };
    }

    /**
     * Methode startet die Animation und führt den Farbwechsel im gewünschten Intervall aus
     * @param {number} interval - in Millisekunden  
     */
    startRepeatFunction(interval) {
        this.intervalID = setInterval(this.backgroundColor, interval);
    }

    /**
     * Methode stopt die Animation
     */
    stopRepeatFunction() {
        clearInterval(this.intervalID);
    }
}