import Model from "@Common/models/Model"
import Renderable from "../foundation/Renderable"

export default class RenderableModel extends Renderable {
    model: Model

    constructor(model: Model) {
        super()

        this.model = model
    }

    getTemplateFile() {
        return "models/Model.vemtl"
    }

    getPath() {
        return "app/Models"
    }

    getFilename() {
        return this.model.name + ".php"
    }

    getFormatter() {
        return "php"
    }

    getData() {
        return {
            model: this.model,
        }
    }
}