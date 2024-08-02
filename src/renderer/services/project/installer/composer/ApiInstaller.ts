import Main from "@Renderer/services/wrappers/Main"
import { ProjectCreatorData } from "../../ProjectCreator"
import PathUtil from "@Common/util/PathUtil"

export default class ApiInstaller {
    static async installFromProjectCreator(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Installing Sanctum and setup API")

        await Main.API.executeArtisanOnPath(data.completePath, "install:api --no-interaction")
        await this.addApiTraitToUserModel(data, stateCallback)
    }

    static async addApiTraitToUserModel(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Adding API trait to User Model")

        const userModelPath = PathUtil.join(data.completePath, "app/Models/User.php")

        await Main.API.readFile(userModelPath)
            .then(async (fileContent: string) => {
                const trait = "HasApiTokens",
                    traitImport = "Laravel\\Sanctum\\HasApiTokens"
        
                fileContent = fileContent.toString()

                if(!fileContent.includes(trait)) {
                    fileContent = fileContent
                        .replace(/use HasFactory, Notifiable;/, `use HasFactory, Notifiable, ${trait};`)
                }

                if(!fileContent.includes(traitImport)) {
                    fileContent = fileContent
                        .replace(/use Illuminate\\Notifications\\Notifiable;/, `use Illuminate\\Notifications\\Notifiable;\nuse ${traitImport};`)
                }

                await Main.API.writeFile(userModelPath,fileContent)
            }).catch(error => {
                console.error(error)

                throw new Error("Could not read User model")
            })
    }
}