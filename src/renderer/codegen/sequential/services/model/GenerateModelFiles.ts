import Model from "@Common/models/Model"
import RenderableFactory from "./RenderableFactory"

export default class GenerateModelFiles {
    async start() {
        const models = Model.getValid()

        for (const model of models) {
            await new RenderableFactory(model).render()
        }
    }
}
