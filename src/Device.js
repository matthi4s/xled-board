import {Light} from "xled-js";
import SourceLayout from "./Layout/Source/SourceLayout.js";

export default class Device {
    /** @type {string} */ ip;
    /** @type {string|null} */ id;
    /** @type {Light} */ light;
    /** @type {boolean} */ loggedIn = false;

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
     * @return {Promise<SourceLayout>}
     */
    async getLayout() {
        await this.loginIfNecessary();
        let layout = await this.light.getLayout();
        return SourceLayout.fromObject(this, layout);
    }
}