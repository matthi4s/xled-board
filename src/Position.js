export default class Position {
    /** @type {number} */ x;
    /** @type {number} */ y;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x = undefined, y = undefined) {
        this.x = x;
        this.y = y;
    }

    /**
     * @return {number}
     */
    getX() {
        return this.x;
    }

    /**
     * @return {number}
     */
    getY() {
        return this.y;
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
     * @param {number} y
     * @return {this}
     */
    setY(y) {
        this.y = y;
        return this;
    }

    getAsString() {
        return `${this.x},${this.y}`;
    }

    /**
     * @return {Position}
     */
    clone() {
        return new Position(this.x, this.y);
    }

    /**
     * @param {Position} position
     * @return {Position}
     */
    addPosition(position) {
        this.add(position.getX(), position.getY());
        return this;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {this}
     */
    add(x, y) {
        this.addX(x);
        this.addY(y);
        return this;
    }

    /**
     * @param {number} x
     * @return {this}
     */
    addX(x) {
        this.x += x;
        return this;
    }

    /**
     * @param {number} y
     * @return {this}
     */
    addY(y) {
        this.y += y;
        return this;
    }

    /**
     * @param {Position} position
     * @return {boolean}
     */
    isEqualTo(position) {
        return this.getX() === position.getX() && this.getY() === position.getY();
    }
}