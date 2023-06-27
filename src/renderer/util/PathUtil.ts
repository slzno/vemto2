export default class PathUtil {

    static join(...paths: string[]): string {
        return PathUtil.normalize(paths.join("/"))
    }

    static normalize(path: string): string {
        const unixPath = path.replace(/\\/g, "/"),
            withoutDoubleSlashes = unixPath.replace(/\/\//g, "/"),
            withoutTrailingSlash = withoutDoubleSlashes.replace(/\/$/, "")

        return withoutTrailingSlash
    }

    static getFileName(filePath: string): string {
        return filePath.split("/").pop()!
    }

    static getOnlyFilePath(filePath: string): string {
        return filePath.split("/").slice(0, -1).join("/")
    }

}