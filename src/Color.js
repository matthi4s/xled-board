import {Led} from "xled-js";

export default class Color {
    static get BLACK() { return new Color(0, 0, 0) };
    static get RED() { return new Color(255, 0, 0) };
    static get GREEN() { return new Color(0, 255, 0) };
    static get BLUE() { return new Color(0, 0, 255) };
    static get WHITE() { return new Color(255, 255, 255) };
    static get YELLOW() { return new Color(255, 255, 0) };
    static get CYAN() { return new Color(0, 255, 255) };
    static get MAGENTA() { return new Color(255, 0, 255) };
    static get GRAY() { return new Color(128, 128, 128) }

    static get RANDOM() {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        return new Color(r, g, b);
    }

    /** @type {number} */ r = 0;
    /** @type {number} */ g = 0;
    /** @type {number} */ b = 0;
    /** @type {number|null} */ w = null;

    /**
     * @param {string} hex
     * @return {Color}
     */
    static fromHex(hex) {
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        return new Color(r, g, b);
    }

    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number|null} w
     */
    constructor(r, g, b, w = null) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.w = w;
    }

    /**
     * @return {number}
     */
    getR() {
        return this.r;
    }

    /**
     * @return {number}
     */
    getG() {
        return this.g;
    }

    /**
     * @return {number}
     */
    getB() {
        return this.b;
    }

    /**
     * @return {number|null}
     */
    getW() {
        return this.w;
    }

    /**
     * @param {number} r
     * @return {this}
     */
    setR(r) {
        this.r = r;
        return this;
    }

    /**
     * @param {number} g
     * @return {this}
     */
    setG(g) {
        this.g = g;
        return this;
    }

    /**
     * @param {number} b
     * @return {this}
     */
    setB(b) {
        this.b = b;
        return this;
    }

    /**
     * @param {number|null} w
     * @return {this}
     */
    setW(w) {
        this.w = w;
        return this;
    }

    /**
     * @return {Led}
     */
    getLed() {
        return new Led(this.r, this.g, this.b, this.w);
    }

    /**
     * @return {Color}
     */
    clone() {
        return new Color(this.r, this.g, this.b, this.w);
    }

    /**
     * @param {number} percent
     * @return {this}
     */
    lighten(percent) {
        this.r = Math.min(255, Math.round(this.r * (1 + percent)));
        this.g = Math.min(255, Math.round(this.g * (1 + percent)));
        this.b = Math.min(255, Math.round(this.b * (1 + percent)));
        return this;
    }

    /**
     * @param {number} percent
     * @return {this}
     */
    darken(percent) {
        this.r = Math.max(0, Math.round(this.r * (1 - percent)));
        this.g = Math.max(0, Math.round(this.g * (1 - percent)));
        this.b = Math.max(0, Math.round(this.b * (1 - percent)));
        return this;
    }

    /**
     * @param {Color} color
     * @return {boolean}
     */
    isEqualTo(color) {
        return this.getR() === color.getR() && this.getG() === color.getG() && this.getB() === color.getB();
    }
}