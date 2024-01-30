export default class SourceCoordinates {
    /** @type {SourceLayout} */ sourceLayout;
    /** @type {number} */ x;
    /** @type {number} */ y;
    /** @type {number} */ z;
    /** @type {boolean} */ active = true;
    /** @type {number|null} */ index = null;

    /**
     * @param {SourceLayout} sourceLayout
     * @param {{x: number, y: number, z: number}[]} coordinates
     * @return {SourceCoordinates[]}
     */
    static allFromArray(sourceLayout, coordinates) {
        let sourceCoordinates = [];
        for (let coordinate of coordinates) {
            coordinate = SourceCoordinates.fromObject(sourceLayout, coordinate);
            sourceCoordinates.push(coordinate);
        }
        return sourceCoordinates;
    }

    /**
     * @param {SourceLayout} sourceLayout
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {SourceCoordinates}
     */
    static fromObject(sourceLayout, {x, y, z}) {
        return new SourceCoordinates(sourceLayout, x, y, z);
    }

    /**
     * @param {SourceLayout} sourceLayout
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(sourceLayout, x, y, z) {
        this.sourceLayout = sourceLayout;
        this.x = x;
        this.y = y;
        this.z = z;
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
     * @return {number}
     */
    getZ() {
        return this.z;
    }

    /**
     * @param {number} index
     * @return {this}
     */
    setIndex(index) {
        this.index = index;
        return this;
    }

    /**
     * @return {this}
     */
    setInactive() {
        this.active = false;
        return this;
    }

    /**
     * @return {this}
     */
    setActive() {
        this.active = true;
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
        return !this.isActive();
    }

    /**
     * @param {SourceCoordinates} coordinates
     * @return {boolean}
     */
    isEqualTo(coordinates) {
        return this.getX() === coordinates.getX()
            && this.getY() === coordinates.getY()
            && this.getZ() === coordinates.getZ();
    }

    /**
     * @return {SourceLayout}
     */
    getSourceLayout() {
        return this.sourceLayout;
    }

    /**
     * @return {Device}
     */
    getDevice() {
        return this.getSourceLayout().getDevice();
    }
}