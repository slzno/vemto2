import fs from "fs"
import path from "path"

class FileSystem {

    fileExists(filePath: string) {
        return fs.existsSync(filePath)
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
        // let localFilePath = path.join(__static, filePath)
        // this.copyFile(localFilePath, destFilePath, manipulationCallback)
    }

    copyFile(filePath: string, destFilePath: string, manipulationCallback: any = null): FileSystem {
        let content = this.readFile(filePath)

        if(manipulationCallback) content = manipulationCallback(content)

        this.writeFile(destFilePath, content)

        return this
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
    makeFolderFromTemplate(destinationFolder: string, templateFolder: string): boolean {
        // return shell.cp('-R', templateFolder, destinationFolder)
        return true
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
                fileList.push(filePath)
            }
        })

        return fileList
    }

}

export default new FileSystem