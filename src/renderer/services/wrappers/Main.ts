import ElectronApi from "@Renderer/typings/electron"

export default new class Main {
    public API: ElectronApi = null

    constructor() {
        this.API = window.api
    }
}