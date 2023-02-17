import Project from "@Common/models/Project"
import RenderableFile from "./base/RenderableFile"

export default class FileQueue {
    static project: Project
    static instance: FileQueue

    private files: RenderableFile[] = []

    static getInstance() {
        if (!FileQueue.instance) {
            FileQueue.initInstance()
        }

        return FileQueue.instance
    }

    static initInstance() {
        FileQueue.instance = new FileQueue()
    }

    static async add(file: RenderableFile) {
        FileQueue.getInstance().files.push(file)
    }

    static getQueue() {
        return FileQueue.getInstance()
    }

    static getQueueFiles() {
        return FileQueue.getInstance().files
    }

    static clear() {
        FileQueue.getInstance().files = []
    }
}