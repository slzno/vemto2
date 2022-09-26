import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
    loadSchema: (path: string) => { 
        ipcRenderer.invoke("get:project:schema", path) 
    },
    onSchemaLoaded: (callback: (data: any) => void) => { 
        ipcRenderer.on("data:project:schema", (event, data) => callback(data))
    },
})
