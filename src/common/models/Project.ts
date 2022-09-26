export default class Project {
    path: string = ""

    setPath(path: string) {
        this.path = path
    }

    getPath(): string {
        return this.path
    }
}
