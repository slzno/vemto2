import path from "path"
import { ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import Project from "../common/models/Project"

export function HandleFileQueue() {
    const fileQueue = []
    
    let project = null

    let needsToSave = false

    ipcMain.handle("file-queue:add", (event, filePath: string, content: string) => {
        fileQueue.push({ filePath, content })
        needsToSave = true
    })
    
    setInterval(() => {
        project = Project.find(1)

        if(project === null) return

        generateFiles()
        saveQueue()
    }, 1000)

    const generateFiles = () => {
        if (fileQueue.length === 0) return

        fileQueue.forEach(file => {
            const completePath = path.join(project.getPath(), file.filePath)
            
            FileSystem.writeFile(completePath, file.content)
            
            const index = fileQueue.indexOf(file)
            fileQueue.splice(index, 1)

            needsToSave = true
        })
    }

    const saveQueue = () => {
        if (!needsToSave) return

        console.log('Saving file queue...')

        let queueFilePath = path.join(project.getPath(), ".vemto", "file-queue.json")
        
        FileSystem.writeJsonFile(
            queueFilePath, 
            fileQueue
        )

        needsToSave = false
    }
}
