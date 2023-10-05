import Project from "@Common/models/Project"
import RenderableFile from "@Common/models/RenderableFile"

export default class HandleModelDataUpdate {

    static start(data: any) {
        if (data.model === "Project") this.updateProject(data)
        if (data.model === "RenderableFile") this.updateRenderableFile(data)
    }

    static updateProject(data: any) {
        const project = Project.find(data.id)

        if (!project) return

        console.log("Updating project from background", data.data)

        project.update(data.data)
    }

    static updateRenderableFile(data: any) {
        const file = RenderableFile.find(data.id)

        if (!file) return

        file.update(data.data)
    }

}