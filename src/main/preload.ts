import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
    // Common messages
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

    // Database messages
    databaseDataUpdated: (data: any) => {
        ipcRenderer.invoke("database:data:updated", data)
    }
})
