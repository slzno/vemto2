import { BrowserWindow } from "electron";

export default class Storage {
    static window: BrowserWindow | null = null

    static async getAll() {
        if (!Storage.hasWindow()) {
            return null
        }

        return await Storage.getWindow().webContents.executeJavaScript(`({...localStorage})`, true)
    }

    static async get(key: string) {
        if (!Storage.hasWindow()) {
            return null
        }

        return await Storage.getWindow().webContents.executeJavaScript(`localStorage.getItem('${key}')`, true)
    }

    static async set(key: string, value: string) {
        if (!Storage.hasWindow()) {
            return
        }

        await Storage.getWindow().webContents.executeJavaScript(`localStorage.setItem('${key}', '${value}')`, true)
    }

    static setWindow(window: BrowserWindow) {
        Storage.window = window
    }

    static hasWindow() {
        return Storage.window !== null
    }

    static getWindow() {
        return Storage.window
    }
}