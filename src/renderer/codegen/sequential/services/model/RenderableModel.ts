import Model from "@Common/models/Model"

export default class RenderableModel {
    model: Model

    constructor(model: Model) {
        this.model = model
    }

    async render() {
        console.log('Rendering model...')
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

    getData() {
        return {
            model: this.model,
        }
    }
}