import Main from "@Renderer/services/wrappers/Main"
import { ProjectCreatorData } from "../../ProjectCreator"

export default class JetstreamInstaller {
    static async installFromProjectCreator(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        const state = data.usesJetstreamTeams ? "Installing Jetstream with Teams" : "Installing Jetstream"

        stateCallback(state)

        await Main.API.executeComposerOnPath(data.completePath, "require laravel/jetstream --no-interaction")
        await this.runJetstreamCommands(data, stateCallback)
    }

    static async runJetstreamCommands(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        const command = data.usesJetstreamTeams
            ? "jetstream:install livewire --teams --no-interaction"
            : "jetstream:install livewire --no-interaction"

        stateCallback("Running Jetstream commands")

        await Main.API.executeArtisanOnPath(data.completePath, command)
    }
}