import BootstrapAppRenderable from "./BootstrapAppRenderable";

export default class GenerateBootstrapApp {
    async start() {
        await new BootstrapAppRenderable().render()
    }
}
