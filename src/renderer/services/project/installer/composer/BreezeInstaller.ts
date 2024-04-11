import Main from "@Renderer/services/wrappers/Main"
import { ProjectCreatorData } from "../../ProjectCreator"

export default class BreezeInstaller {
    static async installFromProjectCreator(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Installing Breeze")

        await Main.API.executeComposerOnPath(data.completePath, "require laravel/breeze --dev --no-interaction")
        await this.runBreezeCommands(data, stateCallback)
    }

    static async runBreezeCommands(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Running Breeze commands")

        await Main.API.executeArtisanOnPath(data.completePath, "breeze:install livewire --no-interaction")
    }
}