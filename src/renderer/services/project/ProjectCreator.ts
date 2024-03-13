import path from "path"
import Main from "../wrappers/Main"

export interface ProjectCreatorData {
    name: string;
    path: string;
    usesJetstreamTeams: boolean;
}

export default class ProjectCreator {
    static async create(data: ProjectCreatorData) {
        await this.createFolder(data)
    }

    static async createFolder(data: ProjectCreatorData) {
        await Main.API.folderExists(path.join(data.path, data.name))
            .then(async (exists: boolean) => {
                if (exists) return;
                
                await Main.API.createFolder(path.join(data.path, data.name))
                    .then(async () => {
                        await this.createProject(data)
                    })
            })
    }
}