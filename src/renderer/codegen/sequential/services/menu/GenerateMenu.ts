import Project from "@Common/models/Project"
import AppMenuRenderable from "./AppMenuRenderable"
import BreezeNavigationRenderable from "./BreezeNavigationRenderable"
import AppResponsiveMenuRenderable from "./AppResponsiveMenuRenderable"

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
        await new AppMenuRenderable().render()
        await new AppResponsiveMenuRenderable().render()
    }

    async generateBreezeMenu() {
        await new BreezeNavigationRenderable().render()
    }
}
