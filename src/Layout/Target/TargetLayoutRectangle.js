export default class TargetLayoutRectangle {
    /** @type {number} */ x= 0;
    /** @type {number} */ y= 0;
    /** @type {number} */ width;
    /** @type {number} */ height;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @return {TargetLayoutRectangle}
     */
    static fromObject({x = 0, y = 0, width, height}) {
        return new TargetLayoutRectangle(x, y, width, height);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    constructor(x= 0, y= 0, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
    getMaxX() {
        return this.x + this.width;
    }

    /**
     * @return {number}
     */
    getY() {
        return this.y;
    }

    /**
     * @return {number}
     */
    getMaxY() {
        return this.y + this.height;
    }

    /**
     * @return {number}
     */
    getWidth() {
        return this.width;
    }

    /**
     * @return {number}
     */
    getHeight() {
        return this.height;
    }
}