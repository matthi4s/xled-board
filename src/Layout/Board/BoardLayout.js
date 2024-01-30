import fs from 'node:fs/promises';
import LED from "../../LED.js";
import {Frame} from "xled-js";

export default class BoardLayout {
    /** @type {LED[]} */ leds = [];
    /** @type {Map<number,Map<number,LED>>} */ coordinatesIndex = new Map;
    /** @type {Map<string,Map<number>>} */ deviceIndex = new Map;

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
            for (let index in layout[deviceId]) {
                index = parseInt(index);
                let led = new LED(device, index).setFromObject(layout[deviceId][index]);
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
        this.indexDevices();
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
    indexDevices() {
        for (let led of this.leds) {
            let device = led.getDevice().getId();
            if (!this.deviceIndex.has(device)) {
                this.deviceIndex.set(device, new Map);
            }
            this.deviceIndex.get(device).set(led.getIndex(), led);
        }
    }

    /**
     * @param {Position} position
     * @return {LED|null}
     */
    getByPosition(position) {
        return this.coordinatesIndex.get(position.getX())?.get(position.getY()) ?? null;
    }

    /**
     * @param {string} device
     * @param {number} index
     * @return {LED|null}
     */
    getByIndex(device, index) {
        return this.deviceIndex.get(device)?.get(index) ?? null;
    }

    /**
     * @return {LED}
     */
    getRandom() {
        let index = Math.floor(Math.random() * this.leds.length);
        return this.leds[index];
    }

    /**
     * @return {LED[]}
     */
    getAllActive() {
        let leds = [];
        for (let led of this.leds) {
            if (led.isActive()) {
                leds.push(led);
            }
        }
        return leds;
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
        for (let device of this.deviceIndex.keys()) {
            result[device] = [];
            for (let i = 0; i < this.deviceIndex.get(device).size; i++) {
                result[device].push(this.deviceIndex.get(device).get(i).getAsObject());
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

    /**
     * @param {Device} device
     * @return {Frame}
     */
    getFrame(device) {
        let leds = [];
        for (let i = 0; i < this.deviceIndex.get(device.getId()).size; i++) {
            leds.push(this.deviceIndex.get(device.getId()).get(i).getColor().getLed());
        }
        return new Frame(leds);
    }
}