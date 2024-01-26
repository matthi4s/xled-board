import {discoverTwinklyDevices} from "xled-js";
import Device from "./Device.js";
import LayoutMapper from "./Layout/LayoutMapper.js";
import TargetLayout from "./Layout/Target/TargetLayout.js";
import BoardLayout from "./Layout/Board/BoardLayout.js";
import fs from "node:fs/promises";

export default class Board {
    /** @type {Map<string, Device>} */ devices = new Map;
    /** @type {BoardLayout} */ layout;
    /** @type {number} */ frameInterval;
    /** @type {Promise|null} */ frameSendPromise = null;
    /** @type {boolean} */ frameQueued = false;
    /** @type {Timeout|null} */ frameTimeout = null;

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
     * @param {number} frameInterval
     */
    startShowingFrames(frameInterval = 10000) {
        this.frameInterval = frameInterval;
        this.sendNextFrame();
    }

    /**
     * @return {Promise<void>}
     */
    async sendNextFrame() {
        if (this.frameTimeout) {
            clearTimeout(this.frameTimeout);
            this.frameTimeout = null;
        }
        if (this.frameSendPromise) {
            await this.frameSendPromise;
        }
        await this.sendFrame();
        if (this.frameQueued) {
            this.frameQueued = false;
            await this.sendNextFrame();
            return;
        }
        this.frameTimeout = setTimeout(() => this.sendNextFrame(), this.frameInterval);
    }

    /**
     * @return {void}
     */
    queueFrame() {
        if (this.frameQueued) {
            return;
        }
        this.frameQueued = true;
        if (this.frameSendPromise) {
            return;
        }
        this.sendNextFrame();
    }

    /**
     * @return {Promise<void>}
     */
    async sendFrame() {
        let promises = [];
        for (let device of this.devices.values()) {
            let frame = this.layout.getFrame(device);
            promises.push(device.sendRealtimeFrame(frame));
        }
        this.frameSendPromise = Promise.all(promises);
        await this.frameSendPromise;
        this.frameSendPromise = null;
    }
}