import { ipcMain } from "electron"
import ReadProjectSchema from "./services/ReadProjectSchema"

export function IpcMessagesHandler() {
    ipcMain.handle("get:project:schema", (event, path) => {
        ReadProjectSchema
            .run(path)
            .then(data => event.sender.send("data:project:schema", data))
    })
}
