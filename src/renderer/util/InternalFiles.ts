import PathUtil from "@Common/util/PathUtil"
import Main from "@Renderer/services/wrappers/Main"

export default class InternalFiles {

    static async readProcessedFile(relativePath: string): Promise<string> {
        const path = PathUtil.join(".vemto", "processed-files", relativePath)

        return await Main.API.readProjectFile(path)
    }

    static async readGeneratedFile(relativePath: string): Promise<string> {
        const path = PathUtil.join(".vemto", "generated-files", relativePath)

        return await Main.API.readProjectFile(path)
    }

    static async writeGeneratedFile(relativePath: string, content: string): Promise<any> {
        const path = PathUtil.join(".vemto", "generated-files", relativePath)

        await Main.API.writeProjectFile(path, content)

        return path
    }

}