import {discoverTwinklyDevices} from "xled-js";
import Device from "./Device.js";
import LayoutMapper from "./Layout/LayoutMapper.js";
import TargetLayout from "./Layout/Target/TargetLayout.js";
import BoardLayout from "./Layout/Board/BoardLayout.js";
import fs from "node:fs/promises";
import Position from "./Position.js";

export default class Board {
    /** @type {Map<string, Device>} */ devices = new Map;
    /** @type {BoardLayout} */ layout;

    /**
     * @param {Device} device
     * @returns {this}
     */
    addDevice(device) {
        device.setBoard(this);
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
        for (let [, twinklyDevice] of devices) {
            let device = new Device(twinklyDevice.ip, twinklyDevice.deviceId);
            await device.autoDetectRGBW();
            this.addDevice(device);
        }
        return this;
    }

    /**
     * @param {string} path
     * @return {Promise<this>}
     */
    async saveDevices(path) {
        let devices = [...this.devices.values()].map(device => device.getAsObject());
        await fs.writeFile(path, JSON.stringify(devices));
        return this;
    }

    /**
     * @param {string} path
     * @return {Promise<this>}
     */
    async loadDevices(path) {
        let content = (await fs.readFile(path)).toString();
        let devices = JSON.parse(content);
        for (let device of devices) {
            this.addDevice(Device.fromObject(device));
        }
        return this;
    }

    /**
     * @param {string} path
     * @param {number} timeout
     * @return {Promise<this>}
     */
    async loadOrDiscoverDevices(path, timeout = 5000) {
        try {
            await this.loadDevices(path);
        } catch (e) {
            await this.discoverDevices(timeout);
            await this.saveDevices(path);
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
        return this.layout = mapper.map(TargetLayout.fromArrayOrObject(targetLayout));
    }

    /**
     * @param {string} filePath
     * @param {TargetLayout|{x?: number, y?: number, width: number, height: number}|{x?: number, y?: number, width: number, height: number}[]} targetLayout     * @param filePath
     * @return {Promise<BoardLayout>}
     */
    async loadOrMapLayout(filePath, targetLayout) {
        try {
            this.layout = await BoardLayout.loadFromFile(this, filePath);
        } catch (e) {
            await this.mapLayout(targetLayout);
            await this.layout.saveToFile(filePath);
        }
        return this.layout;
    }

    /**
     * @return {BoardLayout}
     */
    getLayout() {
        return this.layout;
    }

    /**
     * @param {string} frameMode
     * @param {number|null} frameInterval
     * @return {this}
     */
    start(frameMode = Device.FRAME_MODE_QUEUEING, frameInterval = null) {
        this.devices.forEach(device => device.start(frameMode, frameInterval));
        return this;
    }

    /**
     * @return {Promise<void>}
     */
    async sendFullFrame() {
        let promises = [];
        for (let device of this.devices.values()) {
            promises.push(device.sendCurrentFrame());
        }
        await Promise.all(promises);
    }

    /**
     * @return {Position}
     */
    getRandomPosition() {
        return this.layout.getRandom().getPosition();
    }

    /**
     * @param {Position} position
     * @param {Color} color
     * @return {this}
     */
    setColor(position, color) {
        let led = this.layout.getByPosition(position);
        if (!led) {
            throw new Error("No LED found at " + position.getAsString());
        }
        led.setColor(color);
        return this;
    }

    /**
     * @param {Position} position
     * @return {Color}
     */
    getColor(position) {
        let led = this.layout.getByPosition(position);
        if (!led) {
            throw new Error("No LED found at " + position.getAsString());
        }
        return led.getColor();
    }

    /**
     * @param {Color} color
     * @return {this}
     */
    colorAll(color) {
        for (let led of this.layout.getAllActive()) {
            led.setColor(color);
        }
        return this;
    }

    /**
     * @param {Position} start
     * @param {Position} end
     * @param {Color} color
     * @return {this}
     */
    drawRectangle(start, end, color) {
        for (let x = start.getX(); x <= end.getX(); x++) {
            for (let y = start.getY(); y <= end.getY(); y++) {
                let led = this.layout.getByPosition(new Position(x, y));
                if (!led) {
                    continue;
                }
                led.setColor(color);
            }
        }
        return this;
    }

    /**
     * @param {Position} start
     * @param {Position} end
     * @param {Color} color
     * @return {this}
     */
    drawLine(start, end, color) {
        let dx = Math.abs(end.getX() - start.getX());
        let dy = Math.abs(end.getY() - start.getY());
        let sx = start.getX() < end.getX() ? 1 : -1;
        let sy = start.getY() < end.getY() ? 1 : -1;
        let err = dx - dy;

        let current = start.clone();

        while (true) {
            let led = this.layout.getByPosition(current);
            if (led) {
                led.setColor(color);
            }
            if (current.getX() === end.getX() && current.getY() === end.getY()) {
                break;
            }
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                current.setX(current.getX() + sx);
            }
            if (e2 < dx) {
                err += dx;
                current.setY(current.getY() + sy);
            }
        }
        return this;
    }
}