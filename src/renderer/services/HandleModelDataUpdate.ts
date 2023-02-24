import RenderableFile from "@Common/models/RenderableFile"

export default class HandleModelDataUpdate {

    static start(data: any) {
        if (data.model === "RenderableFile") this.updateRenderableFile(data)
    }

    static updateRenderableFile(data: any) {
        console.log(data)
        
        const file = RenderableFile.find(data.id)

        if (!file) return
        
        file.update(data.data)
    }

}