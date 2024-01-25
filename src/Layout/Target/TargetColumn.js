export default class TargetColumn {
    /** @type {number} */ x;
    /** @type {number[]} */ y= [];

    /**
     * @param {number} x
     */
    constructor(x) {
        this.x = x;
    }

    /**
     * @return {number}
     */
    getX() {
        return this.x;
    }

    /**
     * @return {number[]}
     */
    getYs() {
        return this.y;
    }

    /**
     * @return {this}
     */
    sortYs() {
        this.y.sort((a, b) => a - b);
        return this;
    }

    /**
     * @return {this}
     */
    addY(y) {
        this.y.push(y);
        return this;
    }
}