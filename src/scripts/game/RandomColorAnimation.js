"use strict";

import GameResult from "./GameResult.js";

/**
 * Handles the victory/draw animation by flashing random colors
 * on the winning cells (or all cells for a draw).
 */
export default class RandomColorAnimation {

    static intervalID;

    /**
     * Applies random colors to game elements based on the winner.
     * - Draw: All cells flash
     * - Win: Only the winning line cells flash
     * @param {number} winner - 0 = draw, 1 = X wins, 2 = O wins
     */
    static backgroundColor(winner) {

        // Color palette for the animation
        let colorPool = ["#140420", "#310A3F", "#C70554", "#DC327B", "#FF7486", "#161433", "#08F4FD", "#FFF"];

        /**
         * Picks a random color from the pool.
         * @param {string[]} colorPool - Array of hex color codes
         * @returns {string} Random hex color
         */
        function chooseRandomColorFrom(colorPool) {
            const random_number = () => Math.floor(Math.random() * (colorPool.length));
            const color = colorPool[random_number()];
            return color;
        }

        /**
         * Converts winning line data to cell IDs.
         * @param {Array} winningLine - [lineType, linesArray] from GameResult
         * @returns {string[]} Array of winning cell IDs
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
        }

        switch (winner) {
            case 0:
                // Draw: flash all cells
                document.querySelectorAll(".spaces").forEach(space => {
                    space.style.background = chooseRandomColorFrom(colorPool);
                    space.style.color = chooseRandomColorFrom(colorPool);
                    document.querySelector("#game-result").style.color = chooseRandomColorFrom(colorPool);
                });
                break;
            case 1:
                // X wins: flash winning cells and X's score
                getWinningSpacesID(GameResult.winningLine).forEach(id => {
                    document.getElementById(`${id}`).style.background = chooseRandomColorFrom(colorPool);
                    document.getElementById(`${id}`).style.color = chooseRandomColorFrom(colorPool);
                    document.querySelector("#game-result").style.color = chooseRandomColorFrom(colorPool);
                    document.getElementById("total-player-1").style.color = chooseRandomColorFrom(colorPool);
                })
                break;
            case 2:
                // O wins: flash winning cells and O's score
                getWinningSpacesID(GameResult.winningLine).forEach(id => {
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
     * Starts the color animation at the specified interval.
     * @param {number} interval - Milliseconds between color changes
     * @param {number} winner - 0 = draw, 1 = X wins, 2 = O wins
     */
    static startRepeatFunction(interval, winner) {
        this.intervalID = setInterval(() => {
            this.backgroundColor(winner);
        }, interval);
    }

    /**
     * Stops the color animation.
     */
    static stopRepeatFunction() {
        clearInterval(this.intervalID);
    }
}
