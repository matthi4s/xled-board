import {discoverTwinklyDevices} from "xled-js";
import Device from "./Device.js";
import LayoutMapper from "./Layout/LayoutMapper.js";

export default class Board {
    /** @type {Map<string, Device>} */ devices= new Map;
    /** @type {BoardLayout} */ layout;

    /**
     * @param {Device} device
     * @returns {this}
     */
    addDevice(device) {
        this.devices.set(device.getId(), device);
        return this;
    }

    /**
     * @param {string} id
     * @returns {Device|null}
     */
    getDevice(id) {
        return this.devices.get(id) ?? null;
    }

    /**
     * @param {number} [timeout=5000]
     * @return {Promise<Board>}
     */
    async discoverDevices(timeout = 5000) {
        let devices = await discoverTwinklyDevices(timeout);
        for (let device of devices) {
            this.addDevice(new Device(device.ip, device.deviceId));
        }
        return this;
    }

    /**
     * @param {TargetLayout|{x?: number, y?: number, width: number, height: number}|{x?: number, y?: number, width: number, height: number}[]} targetLayout
     * @return {Promise<BoardLayout>}
     */
    async mapLayout(targetLayout) {
        let mapper = new LayoutMapper();
        for (let device of this.devices.values()) {
            mapper.addSourceLayout(await device.getLayout());
        }
        return this.layout = mapper.map(targetLayout);
    }

    /**
     * @return {BoardLayout}
     */
    getLayout() {
        return this.layout;
    }
}