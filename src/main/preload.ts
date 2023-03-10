import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
    onDevelopment: () => { return process.env.NODE_ENV === "development" },

    // Common messages
    prepareProject: (path: string) => { 
        return ipcRenderer.invoke("prepare:project", path)
    },
    loadSchema: (path: string) => { 
        return ipcRenderer.invoke("get:project:schema", path) 
    },
    loadProjectDatabase: (path: string) => { 
        return ipcRenderer.invoke("get:project:database", path) 
    },

    // Error messages
    onDefaultError: (callback: Callback) => { 
        ipcRenderer.on("error:default", (event, error) => callback(error))
    },

    onModelDataUpdated: (callback: Callback) => {
        ipcRenderer.on("model:data:updated", (event, data) => callback(data))
    },

    // Database messages
    databaseDataUpdated: (data: any) => {
        return ipcRenderer.invoke("database:data:updated", data)
    },

    // Files Queue
    addFileToGenerationQueue: (filePath: string, content: string) => {
        return ipcRenderer.invoke("file-queue:add", filePath, content)
    },

    // Files Management
    readProjectFile: (path: string) => {
        return ipcRenderer.invoke("file:project:read", path)
    },
    readTemplateFile: (path: string) => {
        return ipcRenderer.invoke("file:template:read", path)
    },
    openProjectFile: (path: string) => {
        return ipcRenderer.invoke("file:project:open", path)
    },
    readConflictsFile: (path: string) => {
        return ipcRenderer.invoke("file:conflicts:read", path)
    },
    solveConflictReplacingCode: (fileId: string, conflictId: string, content: string) => {
        return ipcRenderer.invoke("file:conflicts:solve:replace", fileId, conflictId, content)
    },
})
