import path from "path"
import { app } from "electron"
import FileSystem from "./base/FileSystem"
import Project from "../common/models/Project"
import RenderableFile, { RenderableFileStatus } from "../common/models/RenderableFile"

export function HandleRenderableFileQueue() {
    let project = null
    
    setInterval(() => {
        project = Project.find(1)

        if(project === null) return

        generateFiles()
    }, 1000)

    const generateFiles = () => {
        if (project.renderableFiles.length === 0) return

        const pendingFiles = project.renderableFiles.filter(file => file.status === RenderableFileStatus.PENDING)

        if (pendingFiles.length === 0) return

        pendingFiles.forEach(file => {
            processFile(file)
        })
    }

    const processFile = (file: RenderableFile) => {
        const completePath = path.join(project.getPath(), ".vemto", "templates", file.template)

        let templateContent = ''

        if(FileSystem.fileExists(completePath)) {
            templateContent = FileSystem.readFile(completePath)
        }

        templateContent = FileSystem.readFile(path.join(app.getAppPath(), "static", "templates", file.template))

        // renderiza o template (precisa trazer replicar a lógica do renderer)

        // salva o arquivo no disco

        // atualiza o status do arquivo
    }
}
