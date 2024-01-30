import {deviceMode, Light} from "xled-js";
import SourceLayout from "./Layout/Source/SourceLayout.js";

export default class Device {
    static MODE_REALTIME = 'rt';

    static FRAME_MODE_QUEUEING = 'queueing';
    static FRAME_MODE_INTERVAL = 'interval';

    static INTERVAL_DEFAULTS = {
        [Device.FRAME_MODE_QUEUEING]: 10_000,
        [Device.FRAME_MODE_INTERVAL]: 100
    }

    /** @type {Board} */ board;
    /** @type {string} */ ip;
    /** @type {string|null} */ id;
    /** @type {Light} */ light;
    /** @type {boolean} */ rgbw = false;
    /** @type {boolean} */ loggedIn = false;
    /** @type {string|null} */ lastMode = null;
    /** @type {string|null} */ frameMode = null;
    /** @type {number} */ frameInterval;
    /** @type {Promise|null} */ frameSendPromise = null;
    /** @type {boolean} */ frameQueued = false;
    /** @type {Timeout|null} */ frameQueueTimeout = null;
    /** @type {Timeout|null} */ frameTimeout = null;

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
     * @param {Board} board
     * @return {this}
     */
    setBoard(board) {
        this.board = board;
        return this;
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
     * @return {string|null}
     */
    getFrameMode() {
        return this.frameMode;
    }

    /**
     * @param {number} frameInterval
     * @return {this}
     */
    setFrameInterval(frameInterval) {
        this.frameInterval = frameInterval;
        return this;
    }

    /**
     * @return {number}
     */
    getFrameInterval() {
        return this.frameInterval;
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

    /**
     * @return {Promise<this>}
     */
    async sendCurrentFrame() {
        let frame = this.board.getLayout().getFrame(this);
        await this.sendRealtimeFrame(frame);
        return this;
    }

    /**
     * @param {string} frameMode
     * @param {number|null} frameInterval
     * @return {this}
     */
    start(frameMode = Device.FRAME_MODE_QUEUEING, frameInterval = null) {
        this.frameMode = frameMode;
        if (frameInterval === null) {
            if (this.frameInterval === undefined) {
                this.frameInterval = Device.INTERVAL_DEFAULTS[frameMode];
            }
        } else {
            this.frameInterval = frameInterval;
        }
        if (frameMode === Device.FRAME_MODE_QUEUEING) {
            this.sendNextQueueFrame().catch(console.error);
            return this;
        }
        if (frameMode === Device.FRAME_MODE_INTERVAL) {
            this.runInterval().catch(console.error);
        }
    }

    /**
     * @return {Promise<void>}
     */
    async runInterval() {
        while (true) {
            await this.sendCurrentFrame();
            await new Promise(resolve => setTimeout(resolve, this.frameInterval));
        }
    }

    /**
     * @return {Promise<void>}
     */
    async sendNextQueueFrame() {
        if (this.frameTimeout) {
            clearTimeout(this.frameTimeout);
            this.frameTimeout = null;
        }
        if (this.frameSendPromise) {
            return this.frameSendPromise;
        }
        this.frameSendPromise = this.sendCurrentFrame();
        await this.frameSendPromise;
        this.frameSendPromise = null;
        if (this.frameQueued) {
            this.frameQueued = false;
            await this.sendNextQueueFrame();
            return;
        }
        this.frameTimeout = setTimeout(() => this.sendNextQueueFrame(), this.frameInterval);
    }

    /**
     * @return {void}
     */
    queueFrame() {
        if (this.frameMode !== Device.FRAME_MODE_QUEUEING) {
            return;
        }
        if (this.frameQueued || this.frameQueueTimeout) {
            return;
        }
        this.frameQueueTimeout = setTimeout(() => {
            this.frameQueueTimeout = null;
            if (this.frameSendPromise) {
                this.frameQueued = true;
            } else {
                this.sendNextQueueFrame().catch(console.error);
            }
        }, 25);
    }
}