import RenderableBootstrapApp from "./RenderableBootstrapApp";

export default class GenerateBootstrapApp {
    async start() {
        await new RenderableBootstrapApp().render()
    }
}
