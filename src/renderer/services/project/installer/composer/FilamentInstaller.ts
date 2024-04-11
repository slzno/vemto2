import Main from "@Renderer/services/wrappers/Main"
import { ProjectCreatorData } from "../../ProjectCreator"
import PathUtil from "@Common/util/PathUtil"

export default class FilamentInstaller {
    static async installFromProjectCreator(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Installing Filament")

        await Main.API.executeComposerOnPath(data.completePath, "require filament/filament --no-interaction")
        await this.runFilamentCommands(data, stateCallback)
    }

    static async runFilamentCommands(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Running Filament commands")

        await this.installDefaultPanel(data, stateCallback)
        await this.updateUserModel(data, stateCallback)
    }

    static async installDefaultPanel(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Installing default panel")

        await Main.API.executeArtisanOnPath(data.completePath, "filament:install --panels --no-interaction")
    }

    static async updateUserModel(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Updating User model for Filament")

        const completePath = PathUtil.join(data.completePath, "App", "Models", "User.php")

        await Main.API.readFile(completePath)
            .then(async (fileContent: string) => {
                fileContent = fileContent.toString()
                    .replace(
                        "use Laravel\\Sanctum\\HasApiTokens;",
                        "use Laravel\\Sanctum\\HasApiTokens;\nuse Filament\\Models\\Contracts\\FilamentUser;"
                    )
                    .replace(
                        "class User extends Authenticatable",
                        "class User extends Authenticatable implements FilamentUser"
                    )

                await Main.API.writeFile(completePath, fileContent)
            })
            .catch(error => {
                console.log(error)
                throw new Error("Could not open User model file")
            })
    }
}