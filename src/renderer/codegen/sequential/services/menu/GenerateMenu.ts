import RenderableAppMenu from "./RenderableAppMenu"

export default class GenerateMenu {
    async start() {
        await new RenderableAppMenu().render()
    }
}
