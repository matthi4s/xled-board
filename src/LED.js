import Color from "./Color.js";

export default class LED {
    /** @type {Device} */ device;
    /** @type {number} */ position;
    /** @type {boolean} */ active = true;
    /** @type {number} */ x;
    /** @type {number} */ y;
    /** @type {Color} */ color= Color.BLACK;

    /**
     * @param {SourceCoordinates} sourceCoordinates
     * @return {LED}
     */
    static fromSourceCoordinates(sourceCoordinates) {
        return new LED(sourceCoordinates.getDevice(), sourceCoordinates.position)
            .setActive(sourceCoordinates.isActive());
    }

    /**
     * @param {Device} device
     * @param {number} position
     */
    constructor(device, position) {
        this.device = device;
        this.position = position;
    }

    /**
     * @param {number} x
     * @return {this}
     */
    setX(x) {
        this.x = x;
        return this;
    }

    /**
     * @return {number}
     */
    getX() {
        return this.x;
    }

    /**
     * @param {number} y
     * @return {this}
     */
    setY(y) {
        this.y = y;
        return this;
    }

    /**
     * @return {number}
     */
    getY() {
        return this.y;
    }

    /**
     * @return {this}
     */
    setInactive() {
        this.active = false;
        return this;
    }

    /**
     * @param {boolean} [active=true]
     * @return {this}
     */
    setActive(active = true) {
        this.active = active;
        return this;
    }

    /**
     * @return {boolean}
     */
    isActive() {
        return this.active;
    }

    /**
     * @return {boolean}
     */
    isInactive() {
        return !this.active;
    }

    /**
     * @return {Device}
     */
    getDevice() {
        return this.device;
    }

    /**
     * @return {number}
     */
    getPosition() {
        return this.position;
    }

    /**
     * @param {Color} color
     * @return {this}
     */
    setColor(color) {
        this.color = color;
        return this;
    }

    /**
     * @return {Color}
     */
    getColor() {
        return this.color;
    }

    /**
     * @return {{}}
     */
    getAsObject() {
        let result = {};
        if (this.active !== true) {
            result.active = this.active;
        }
        if (this.x !== undefined) {
            result.x = this.x;
        }
        if (this.y !== undefined) {
            result.y = this.y;
        }
        return result;
    }

    /**
     * @param {{}} led
     * @return {this}
     */
    setFromObject(led) {
        if (led.active !== undefined) {
            this.setActive(led.active);
        }
        if (led.x !== undefined) {
            this.setX(led.x);
        }
        if (led.y !== undefined) {
            this.setY(led.y);
        }
        return this;
    }
}