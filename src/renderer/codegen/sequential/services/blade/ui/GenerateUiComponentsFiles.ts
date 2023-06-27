import { paramCase } from "change-case"
import PathUtil from "@Renderer/util/PathUtil"
import Main from "@Renderer/services/wrappers/Main"
import RenderableUiComponent from "./RenderableUiComponent"

export default class GenerateUiComponentsFiles {
    async start() {
        
        const files = await Main.API.readInternalFolder("templates/blade/ui", true)

        for(let file of files) {
            const templateName = PathUtil.getFileName(file),
                templatePath = PathUtil.join(`blade/ui`, file),
                fileNameWithoutExtension = templateName.split(".").slice(0, -1).join("."),
                filePath = PathUtil.join(PathUtil.getOnlyFilePath(file), `${paramCase(fileNameWithoutExtension)}.blade.php`)

            await new RenderableUiComponent(filePath, templatePath).render()
        }
        
    }
}