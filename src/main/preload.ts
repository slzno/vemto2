import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
    onDevelopment: () => { 
        return process.env.NODE_ENV === "development" 
    },

    isRecording: () => {
        return !! process.env.VEMTO_RECORDING
    },

    // Common messages
    prepareDatabase: (path: string) => {
        return ipcRenderer.invoke("prepare:project:database", path)
    },
    loadProjectDatabase: (path: string) => { 
        return ipcRenderer.invoke("get:project:database", path) 
    },
    closeProjectDatabase: () => { 
        return ipcRenderer.invoke("close:project:database") 
    },
    databaseDataUpdated: (data: any) => {
        return ipcRenderer.invoke("database:data:updated", data)
    },

    // Schema messages
    loadSchema: (path: string) => { 
        return ipcRenderer.invoke("get:project:schema", path) 
    },

    // Error messages
    onDefaultError: (callback: Callback) => { 
        ipcRenderer.on("error:default", (event, error) => callback(error))
    },

    // Data Synchronization messages
    onModelDataUpdated: (callback: Callback) => {
        ipcRenderer.on("model:data:updated", (event, data) => callback(data))
    },

    // System windows messages
    confirm: (message: string) => {
        return ipcRenderer.invoke("confirm", message)
    },

    openFolderDialog: () => {
        return ipcRenderer.invoke("dialog:folder:open")
    },

    openURL: (url: string) => {
        return ipcRenderer.invoke("open:url", url)
    },

    // Files Queue
    addFileToGenerationQueue: (filePath: string, content: string) => {
        return ipcRenderer.invoke("file-queue:add", filePath, content)
    },

    // Files Management
    readFile: (path: string) => {
        return ipcRenderer.invoke("file:read", path)
    },
    folderExists: (path: string) => {
        return ipcRenderer.invoke("folder:exists", path)
    },
    readProjectFile: (path: string) => {
        return ipcRenderer.invoke("file:project:read", path)
    },
    writeProjectFile: (path: string, content: string) => {
        return ipcRenderer.invoke("file:project:write", path, content)
    },
    projectFileExists: (path: string) => {
        return ipcRenderer.invoke("file:project:exists", path)
    },
    readTemplateFile: (path: string) => {
        return ipcRenderer.invoke("file:template:read", path)
    },
    writeTemplateFile: (path: string, content: string) => {
        return ipcRenderer.invoke("file:template:write", path, content)
    },
    openFolder: (path: string) => {
        return ipcRenderer.invoke("folder:open", path)
    },
    openTerminal: (path: string) => {
        return ipcRenderer.invoke("folder:open:terminal", path)
    },
    openProjectFile: (path: string) => {
        return ipcRenderer.invoke("file:project:open", path)
    },
    openProjectFolder: (path: string) => {
        return ipcRenderer.invoke("folder:project:open", path)
    },
    openProjectFolderOnTerminal: (path: string) => {
        return ipcRenderer.invoke("folder:project:open:terminal", path)
    },
    clearProjectFolder: (path: string) => {
        return ipcRenderer.invoke("folder:project:clear", path)
    },
    fileHasConflicts: (relativePath: string, newContent: string) => {
        return ipcRenderer.invoke("file:has:conflicts", relativePath, newContent)
    },
    readConflictsFile: (path: string) => {
        return ipcRenderer.invoke("file:conflicts:read", path)
    },
    solveConflictReplacingCode: (fileId: string, conflictId: string, content: string) => {
        return ipcRenderer.invoke("file:conflicts:solve:replace", fileId, conflictId, content)
    },
    readProjectFolder: (path: string, removeBasePath: boolean = false) => {
        return ipcRenderer.invoke("folder:project:read", path, removeBasePath)
    },
    readInternalFolder: (path: string, removeBasePath: boolean = false) => {
        return ipcRenderer.invoke("folder:internal:read", path, removeBasePath)
    },
    copyInternalFolderToProject: (path: string, destination: string) => {
        return ipcRenderer.invoke("folder:internal:copy", path, destination)
    },
    copyInternalFolderIfNotExists: (path: string, destination: string) => {
        return ipcRenderer.invoke("folder:internal:copy:if-not-exists", path, destination)
    },
    mergePHPFile: (relativePath: string) => {
        return ipcRenderer.invoke("php:file:merge", relativePath)
    },
})
