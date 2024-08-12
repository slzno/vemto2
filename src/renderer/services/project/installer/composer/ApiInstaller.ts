import Main from "@Renderer/services/wrappers/Main"
import { ProjectCreatorData } from "../../ProjectCreator"
import PathUtil from "@Common/util/PathUtil"
import Project from "@Common/models/Project"

export default class ApiInstaller {
    static async installFromProjectCreator(data: ProjectCreatorData, stateCallback: (state: string) => void = () => {}) {
        stateCallback("Installing Sanctum and setup API")

        await Main.API.executeArtisanOnPath(data.completePath, "install:api --no-interaction")

        stateCallback("Adding API trait to User Model")

        await this.addHasApiTokensTraitToUserModel(data.completePath)
    }

    static async installFromProjectGeneration(project: Project) {
        await Main.API.executeArtisanOnProject("install:api --no-interaction")
        
        await this.addHasApiTokensTraitToUserModel(project.getPath())
    }

    static async addHasApiTokensTraitToUserModel(path: string) {
        const userModelPath = PathUtil.join(path, "app/Models/User.php")

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