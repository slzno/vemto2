import Project from "@Common/models/Project"
import RenderableAppMenu from "./RenderableAppMenu"
import RenderableBreezeNavigation from "./RenderableBreezeNavigation"
import RenderableAppResponsiveMenu from "./RenderableAppResponsiveMenu"

export default class GenerateMenu {
    async start(project: Project) {
        if(project.isJetstream()) {
            await this.generateJetstreamMenu()
        }

        if(project.isBreeze()) {
            await this.generateBreezeMenu()
        }
    }

    async generateJetstreamMenu() {
        await new RenderableAppMenu().render()
        await new RenderableAppResponsiveMenu().render()
    }

    async generateBreezeMenu() {
        await new RenderableBreezeNavigation().render()
    }
}
