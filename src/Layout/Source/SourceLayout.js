import SourceCoordinates from "./SourceCoordinates.js";

export default class SourceLayout {
    static SOURCE_LINEAR = 'linear';
    static SOURCE_2D = '2d';
    static SOURCE_3D = '3d';

    /** @type {Device} */ device;

    /** @type {string} */ uuid;
    /** @type {string} */ source;
    /** @type {SourceCoordinates[]} */ coordinates = [];

    /**
     * @param {Device} device
     * @param {string} uuid
     * @param {string} source
     * @param {{x: number, y: number, z: number}[]} coordinates
     * @return {SourceLayout}
     */
    static fromObject(device, {uuid, source, coordinates}) {
        return new SourceLayout(device, uuid, source, coordinates);
    }

    /**
     * @param {Device} device
     * @param {string} uuid
     * @param {string} source
     * @param {{x: number, y: number, z: number}[]} coordinates
     */
    constructor(device, uuid, source, coordinates) {
        this.device = device;
        this.uuid = uuid;
        this.source = source;
        this.coordinates = SourceCoordinates.allFromArray(this, coordinates);
        this.processCoordinates();
    }

    /**
     * @protected
     * @return void
     */
    processCoordinates() {
        let index = 0;
        for (let coordinates of this.coordinates) {
            coordinates.setIndex(index++);
            if (this.hasCoordinates(coordinates)) {
                coordinates.setInactive();
            }
        }
    }

    /**
     * @param {SourceCoordinates} coordinates
     * @return {boolean}
     */
    hasCoordinates(coordinates) {
        for (let coordinate of this.coordinates) {
            if (coordinate === coordinates) {
                continue;
            }
            if (coordinate.isEqualTo(coordinates)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return {string}
     */
    getSource() {
        return this.source;
    }

    /**
     * @return {boolean}
     */
    is2D() {
        return this.getSource() === SourceLayout.SOURCE_2D;
    }

    /**
     * @return {string}
     */
    getUUID() {
        return this.uuid;
    }

    /**
     * @return {SourceCoordinates[]}
     */
    getCoordinates() {
        return this.coordinates;
    }

    /**
     * @return {SourceCoordinates[]}
     */
    getActiveCoordinates() {
        let activeCoordinates = [];
        for (let coordinates of this.coordinates) {
            if (coordinates.isActive()) {
                activeCoordinates.push(coordinates);
            }
        }
        return activeCoordinates;
    }

    /**
     * @return {SourceCoordinates[]}
     */
    getInactiveCoordinates() {
        let inactiveCoordinates = [];
        for (let coordinates of this.coordinates) {
            if (coordinates.isInactive()) {
                inactiveCoordinates.push(coordinates);
            }
        }
        return inactiveCoordinates;
    }

    /**
     * @return {Device}
     */
    getDevice() {
        return this.device;
    }
}