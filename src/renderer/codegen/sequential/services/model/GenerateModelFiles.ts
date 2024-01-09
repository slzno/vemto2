import Model from "@Common/models/Model"
import RenderableFactory from "./RenderableFactory"
import RenderableSeeder from "./RenderableSeeder"
import RenderablePolicy from "./RenderablePolicy"

export default class GenerateModelFiles {
    async start() {
        const models = Model.getValid()

        for (const model of models) {
            await new RenderableFactory(model).render()
            await new RenderableSeeder(model).render()
            await new RenderablePolicy(model).render()
        }
    }
}
