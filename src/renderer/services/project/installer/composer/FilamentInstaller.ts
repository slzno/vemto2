import Main from "@Renderer/services/wrappers/Main"
import { ProjectCreatorData } from "../../ProjectCreator"

export default class FilamentInstaller {
    static async installFromProjectCreator(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Installing Filament")

        await Main.API.executeComposerOnPath(data.completePath, "require filament/filament --no-interaction")
        await this.runFilamentCommands(data, stateCallback)
    }

    static async runFilamentCommands(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Running Filament commands")

        await this.installDefaultPanel(data, stateCallback)
    }

    static async installDefaultPanel(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Installing default panel")

        await Main.API.executeArtisanOnPath(data.completePath, "filament:install --panels --no-interaction")
    }
}