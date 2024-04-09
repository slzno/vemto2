import { ipcMain } from "electron"
import { handleError } from "./ErrorHandler"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"

export default class ProjectHandler {

    static projectIsOpen: boolean = false

    static handle() {
        ipcMain.handle("prepare:project", async (event, projectPath) => {
            return handleError(event, async () => {
                console.log('Preparing project...')
    
                ProjectPathResolver.setPath(projectPath)
                
                ProjectHandler.open()
    
                console.log('Project path set to:', projectPath)
            })
        })
    }

    static open() {
        ProjectHandler.projectIsOpen = true
    }

    static close() {
        ProjectHandler.projectIsOpen = false
    }

    static isOpen() {
        return ProjectHandler.projectIsOpen
    }

}
