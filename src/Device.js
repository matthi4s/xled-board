import {Light} from "xled-js";
import SourceLayout from "./Layout/Source/SourceLayout.js";

export default class Device {
    static MODE_REALTIME = 'rt';

    /** @type {string} */ ip;
    /** @type {string|null} */ id;
    /** @type {Light} */ light;
    /** @type {boolean} */ rgbw = false;
    /** @type {boolean} */ loggedIn = false;
    /** @type {string|null} */ lastMode = null;

    /**
     * @param {string} ip
     * @param {string} id
     * @param {boolean} rgbw
     * @return {Device}
     */
    static fromObject({ip, id, rgbw}) {
        let device = new Device(ip, id);
        if (rgbw !== undefined) {
            device.setRGBW(rgbw);
        }
        return device;
    }

    /**
     * @param {string} ip
     * @param {string|null} id
     */
    constructor(ip, id = null) {
        this.ip = ip;
        this.id = id;
        this.light = new Light(this.ip);
    }

    /**
     * @return {string|null}
     */
    getId() {
        return this.id;
    }

    /**
     * @return {Promise<this>}
     */
    async login() {
        await this.light.login();
        this.loggedIn = true;
        return this;
    }

    /**
     * @return {Promise<this>}
     */
    async loginIfNecessary() {
        if (!this.loggedIn) {
            await this.login();
        }
        return this;
    }

    /**
     * @param {string|import('xled-js').deviceMode} mode
     * @return {Promise<this>}
     */
    async setMode(mode) {
        await this.loginIfNecessary();
        await this.light.setMode(mode);
        this.lastMode = mode;
        return this;
    }

    /**
     * @param {string|import('xled-js').deviceMode} mode
     * @return {Promise<this>}
     */
    async setModeIfNecessary(mode) {
        if (this.lastMode !== mode) {
            await this.setMode(mode);
        }
        return this;
    }

    /**
     * @return {Promise<SourceLayout>}
     */
    async getLayout() {
        await this.loginIfNecessary();
        let layout = await this.light.getLayout();
        return SourceLayout.fromObject(this, layout);
    }

    /**
     * @return {{}}
     */
    getAsObject() {
        return {
            ip: this.ip,
            id: this.id,
            rgbw: this.rgbw
        };
    }

    /**
     * @return {Promise<this>}
     */
    async autoDetectRGBW() {
        await this.loginIfNecessary();
        this.rgbw = await this.light.autoDetectRGBW();
        return this;
    }

    /**
     * @param {boolean} rgbw
     * @return {this}
     */
    setRGBW(rgbw = true) {
        this.rgbw = rgbw;
        if (rgbw) {
            this.light.enableRGBW();
        }
        return this;
    }

    /**
     * @param {import("xled-js").Frame} frame
     * @return {Promise<this>}
     */
    async sendRealtimeFrame(frame) {
        await this.loginIfNecessary();
        await this.setModeIfNecessary(Device.MODE_REALTIME);
        await this.light.sendRealTimeFrame(frame);
        return this;
    }
}