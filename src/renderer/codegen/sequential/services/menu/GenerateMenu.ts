import RenderableAppMenu from "./RenderableAppMenu"
import RenderableAppResponsiveMenu from "./RenderableAppResponsiveMenu"

export default class GenerateMenu {
    async start() {
        await new RenderableAppMenu().render()
        await new RenderableAppResponsiveMenu().render()
    }
}
