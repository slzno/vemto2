import Model from "@Common/models/Model"
import FactoryRenderable from "./FactoryRenderable"
import SeederRenderable from "./SeederRenderable"
import PolicyRenderable from "./PolicyRenderable"

export default class GenerateModelFiles {
    async start() {
        const models = Model.getValid()

        for (const model of models) {
            await new FactoryRenderable(model).render()
            await new SeederRenderable(model).render()
            await new PolicyRenderable(model).render()
        }
    }
}
