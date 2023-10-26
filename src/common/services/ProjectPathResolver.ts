export default new class ProjectPathResolver {

    path: string

    setPath(path: string) {
        this.path = path
    }

    getPath() {
        return this.path
    }

    hasPath() {
        return !!this.path
    }

    clearPath() {
        this.path = null
    }

}