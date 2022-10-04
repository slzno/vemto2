import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
    loadSchema: (path: string) => { 
        ipcRenderer.invoke("get:project:schema", path) 
    },
    onSchemaLoaded: (callback: (data: any) => void) => { 
        ipcRenderer.on("data:project:schema", (event, data) => callback(data))
    },
    offSchemaLoaded: () => {
        ipcRenderer.removeAllListeners("data:project:schema")
    },
    onDefaultError: (callback: (error: any) => void) => { 
        ipcRenderer.on("error:default", (event, error) => callback(error))
    },
})
