import Color from "./Color.js";
import Position from "./Position.js";

export default class LED {
    /** @type {Device} */ device;
    /** @type {number} */ index;
    /** @type {boolean} */ active = true;
    /** @type {Position} */ position= new Position();
    /** @type {Color} */ color= Color.BLACK;

    /**
     * @param {SourceCoordinates} sourceCoordinates
     * @return {LED}
     */
    static fromSourceCoordinates(sourceCoordinates) {
        return new LED(sourceCoordinates.getDevice(), sourceCoordinates.index)
            .setActive(sourceCoordinates.isActive());
    }

    /**
     * @param {Device} device
     * @param {number} index
     */
    constructor(device, index) {
        this.device = device;
        this.index = index;
    }

    /**
     * @param {number} x
     * @return {this}
     */
    setX(x) {
        this.position.setX(x);
        return this;
    }

    /**
     * @return {number}
     */
    getX() {
        return this.position.getX();
    }

    /**
     * @param {number} y
     * @return {this}
     */
    setY(y) {
        this.position.setY(y);
        return this;
    }

    /**
     * @return {number}
     */
    getY() {
        return this.position.getY();
    }

    /**
     * @param {Position} position
     * @return {this}
     */
    setPosition(position) {
        this.position = position;
        return this;
    }

    /**
     * @return {Position}
     */
    getPosition() {
        return this.position.clone();
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
    getIndex() {
        return this.index;
    }

    /**
     * @param {Color} color
     * @return {this}
     */
    setColor(color) {
        this.device.queueFrame();
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
        if (this.getX() !== undefined) {
            result.x = this.getX();
        }
        if (this.getY() !== undefined) {
            result.y = this.getY();
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