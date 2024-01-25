import fs from 'node:fs/promises';
import LED from "./LED.js";

export default class BoardLayout {
    /** @type {LED[]} */ leds = [];
    /** @type {Map<number,Map<number,LED>>} */ coordinatesIndex = new Map;
    /** @type {Map<string,Map<number>>} */ positionIndex = new Map;

    /**
     * @param {Board} board
     * @param {{}} layout
     * @return {BoardLayout}
     */
    static loadFromObject(board, layout) {
        let boardLayout = new BoardLayout();
        for (let deviceId of Object.keys(layout)) {
            let device = board.getDevice(deviceId);
            if (!device) {
                throw new Error(`Device ${deviceId} not found`);
            }
            for (let position in layout[deviceId]) {
                let led = new LED(device, position).setFromObject(layout[deviceId][position]);
                boardLayout.addLED(led);
            }
        }
        boardLayout.index();
        return boardLayout;
    }

    /**
     * @param {Board} board
     * @param {string} layout
     * @return {BoardLayout}
     */
    static loadFromString(board, layout) {
        return this.loadFromObject(board, JSON.parse(layout));
    }

    /**
     * @param {Board} board
     * @param {string} path
     * @return {Promise<BoardLayout>}
     */
    static async loadFromFile(board, path) {
        let layout = (await fs.readFile(path)).toString();
        return this.loadFromString(board, layout);
    }

    /**
     * @param {LED} led
     * @return {this}
     */
    addLED(led) {
        this.leds.push(led);
        return this;
    }

    /**
     * @return {this}
     */
    index() {
        this.indexCoordinates();
        this.indexPositions();
        return this;
    }

    /**
     * @protected
     */
    indexCoordinates() {
        for (let led of this.leds) {
            let x = led.getX();
            let y = led.getY();
            if (!this.coordinatesIndex.has(x)) {
                this.coordinatesIndex.set(x, new Map);
            }
            this.coordinatesIndex.get(x).set(y, led);
        }
    }

    /**
     * @protected
     */
    indexPositions() {
        for (let led of this.leds) {
            let device = led.getDevice().getId();
            if (!this.positionIndex.has(device)) {
                this.positionIndex.set(device, new Map);
            }
            this.positionIndex.get(device).set(led.position, led);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {LED|null}
     */
    getByCoordinates(x, y) {
        return this.coordinatesIndex.get(x)?.get(y) ?? null;
    }

    /**
     * @param {string} device
     * @param {number} position
     * @return {LED|null}
     */
    getByPosition(device, position) {
        return this.positionIndex.get(device)?.get(position) ?? null;
    }

    /**
     * @return {string}
     */
    getAsString() {
        return JSON.stringify(this.getAsObject());
    }

    /**
     * @return {{}}
     */
    getAsObject() {
        let result = {};
        for (let device of this.positionIndex.keys()) {
            result[device] = [];
            for (let i = 0; i < this.positionIndex.get(device).size; i++) {
                result[device].push(this.positionIndex.get(device).get(i).getAsObject());
            }
        }
        return result;
    }

    /**
     * @param {string} path
     * @return {Promise<void>}
     */
    async saveToFile(path) {
        await fs.writeFile(path, this.getAsString());
    }
}