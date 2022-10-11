import { ipcMain } from "electron"
import ReadProjectSchema from "./services/ReadProjectSchema"

export function IpcMessagesHandler() {
    ipcMain.handle("get:project:schema", (event, path) => {
        ReadProjectSchema
            .run(path)
            .then(data => event.sender.send("data:project:schema", data))
            .catch(error => event.sender.send("error:default", error))
    })

    ipcMain.handle("get:project:database", (event, path) => {
        event.sender.send("data:project:database", {})
    })
}
