import fs from "fs"
import path from "path"
import shell from "shelljs"
import { app } from "electron"
import BackgroundInternalFiles from "./BackgroundInternalFiles"

class FileSystem {

    fileExists(filePath: string) {
        return fs.existsSync(filePath)
    }

    folderExists(folderPath: string) {
        return fs.existsSync(folderPath)
    }

    folderDoesNotExist(folderPath: string) {
        return !this.folderExists(folderPath)
    }

    isFolder(path: string) {
        try {
            let stat = fs.lstatSync(path)
            return stat.isDirectory()
        } catch (e) {
            return false
        }
    }

    folderIsNotEmpty(folderPath: string): boolean {
        return !this.folderIsEmpty(folderPath)
    }

    folderIsEmpty(folderPath: string): boolean {
        return fs.readdirSync(folderPath).length === 0
    }

    getFileNameFromPath(path: string): string {
        let namePosition = path.search(/[ \w-.]+\.\w+$/)
        return path.substr(namePosition)
    }

    getFileUpdatedDate(filePath): Date {
        if(this.fileExists(filePath)) {
            return fs.statSync(filePath).mtime
        }

        return new Date()
    }

    copyStaticFile(filePath: string, destFilePath: string, manipulationCallback: any = null) {
        const staticPath = path.join(app.getAppPath(), 'static'),
            localFilePath = path.join(staticPath, filePath)

        this.copyFile(localFilePath, destFilePath, manipulationCallback)
    }

    copyFile(filePath: string, destFilePath: string, manipulationCallback: any = null): FileSystem {
        let content = this.readFile(filePath)

        if(manipulationCallback) content = manipulationCallback(content)

        this.writeFile(destFilePath, content)

        return this
    }

    writeProjectFile(projectPath: string, filePath: string, content: string, log = true): FileSystem {
        const projectFilePath = path.join(projectPath, filePath),
            previousFileBasePath = BackgroundInternalFiles.getPreviousGeneratedFileBasePath(filePath),
            previousGeneratedFilePath = path.join(projectPath, previousFileBasePath)

        this.writeFile(projectFilePath, content)
        this.writeFile(previousGeneratedFilePath, content)

        return this
    }

    writeConflictsFile(filePath: string, conflicts: any): FileSystem {
        return this.writeJsonFile(filePath, { conflicts })
    }

    writeJsonFile(filePath: string, data: any): FileSystem {
        return this.writeFile(filePath, JSON.stringify(data, null, 4))
    }

    writeFile(destFilePath: string, content: string, log = true): FileSystem {
        if(log) console.log('Writing File: ' + destFilePath)

        this.makeDirectoryFromFileIfNotExists(destFilePath)

        fs.writeFileSync(destFilePath, content)

        return this
    }

    makeDirectoryFromFileIfNotExists(filePath: string): boolean {
        let directoryName = path.dirname(filePath)
        
        if (fs.existsSync(directoryName)) {
            return false
        }

        this.makeDirectoryFromFileIfNotExists(directoryName)

        fs.mkdirSync(directoryName)

        return true
    }

    /**
     * Makes a folder based on a folder template (copy the folder)
     */
    copyFolderIfNotExists(templateFolder: string, destinationFolder: string) {
        if(this.folderDoesNotExist(destinationFolder)) {
            this.copyFolder(templateFolder, destinationFolder)
        }
    }


    copyFolder(templateFolder: string, destinationFolder: string): boolean {
        console.log('Copying Folder: ' + templateFolder + ' to ' + destinationFolder)
        const result = shell.cp('-R', templateFolder, destinationFolder)

        // set the folder to be writable
        fs.chmodSync(destinationFolder, 0o755)

        return result.code === 0
    }

    deleteFile(destFilePath: string, log = true): FileSystem {
        if(fs.existsSync(destFilePath)) {
            if(log) console.log('Removing File: ' + destFilePath)
            fs.unlinkSync(destFilePath)
        }

        return this
    }

    deleteFolder(folderPath: string, allowed = false, log = true): FileSystem {
        if(!allowed) {
            throw new Error('It is necessary to manually allow to remove a folder through Vemto')
        }

        if(fs.existsSync(folderPath)) {
            if(log) console.log('Removing Folder: ' + folderPath)
            fs.rmdirSync(folderPath, { recursive: true })
        }

        return this
    }

    manipulateFile(filePath: string, callback: Function): FileSystem {
        let fileContent = this.readFile(filePath)

        if(callback) {
            fileContent = callback(fileContent)
        }
        
        return this.writeFile(filePath, fileContent)
    }

    readFileIfExists(filePath: string): string {
        if(!this.fileExists(filePath)) return null
        return this.readFile(filePath)
    }

    readFile(filePath: string): string {
        return fs.readFileSync(filePath, 'utf8')
    }

    readFileAsJsonIfExists(filePath: string): any {
        if(!this.fileExists(filePath)) return null
        return this.readFileAsJson(filePath)
    }

    readFileAsJson(filePath: string): any {
        let fileContent = this.readFile(filePath)

        if(!fileContent) return null

        return JSON.parse(fileContent)
    }

    readFolderIfExists(folderPath: string, removeBasePath: boolean): Array<string> {
        if(!this.folderExists(folderPath)) return []

        return this.readFolder(folderPath, removeBasePath)
    }

    readFolder(folderPath: string, removeBasePath: boolean): Array<string> {
        const removeFromPathString = removeBasePath ? folderPath : ''

        return this.walkSync(folderPath, [], removeFromPathString)
    }

    readFolderIncludingEmptyIfExists(folderPath: string, removeBasePath: boolean): Array<string> {
        if(!this.folderExists(folderPath)) return []

        return this.readFolderIncludingEmpty(folderPath, removeBasePath)
    }

    readFolderIncludingEmpty(folderPath: string, removeBasePath: boolean): Array<string> {
        const removeFromPathString = removeBasePath ? folderPath : ''

        return this.walkSyncIncludingEmptyFolders(folderPath, [], removeFromPathString)
    }

    clearFolder(folderPath: string, removeOwnFolder: boolean = false): FileSystem {
        if(this.folderDoesNotExist(folderPath)) return this

        console.log('Clearing Folder: ' + folderPath)

        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file)

            if (fs.lstatSync(curPath).isDirectory()) {
                this.clearFolder(curPath, true)
            } else {
                fs.unlinkSync(curPath)
            }
        })

        if(removeOwnFolder) {
            fs.rmdirSync(folderPath)
        }

        return this
    }

    walkSync(
        dir: string, 
        fileList: Array<string> = [], 
        removeFromPathString: string = ''
    ): Array<string> {
        let files = fs.readdirSync(dir)

        files.forEach((file) => {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                fileList = this.walkSync(path.join(dir, file, '/'), fileList, removeFromPathString)
            } else {
                let filePath = path.join(dir, file).replace(removeFromPathString, '')

                filePath = filePath.replace(/\\/g, '/')

                fileList.push(filePath)
            }
        })

        return fileList
    }

    walkSyncIncludingEmptyFolders(
        dir: string, 
        fileList: Array<string> = [], 
        removeFromPathString: string = ''
    ): Array<string> {
        let files = fs.readdirSync(dir)
    
        // Check if the directory is empty and if so, add it to the fileList
        if (files.length === 0) {
            let dirPath = dir.replace(removeFromPathString, '').replace(/\\/g, '/')
            fileList.push(dirPath)
        }
    
        files.forEach((file) => {
            const fullPath = path.join(dir, file)
            if (fs.statSync(fullPath).isDirectory()) {
                // Recursively call walkSync for directories
                fileList = this.walkSyncIncludingEmptyFolders(fullPath + '/', fileList, removeFromPathString)
            } else {
                // Process file path and add to fileList for files
                let filePath = fullPath.replace(removeFromPathString, '').replace(/\\/g, '/')
                fileList.push(filePath)
            }
        })
    
        return fileList
    }

}

export default new FileSystem