export default class Namespace {

    namespace: string

    constructor(namespace: string) {
        this.namespace = namespace
    }

    static from(namespace: string): Namespace {
        return new Namespace(namespace)
    }

    get(): string {
        return this.namespace
    }

    toPath(): string {
        let path = this.namespace.replace(/\\/g, "/")

        const replacements = this.pathReplacements()

        for (const [key, value] of Object.entries(replacements)) {
            path = path.replace(key, value as string)
        }

        return path
    }

    pathReplacements(): any {
        return {
            "App/": "app/",
        }
    }

}