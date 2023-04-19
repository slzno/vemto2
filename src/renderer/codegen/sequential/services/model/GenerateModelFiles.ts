import Model from "@Common/models/Model";
import RenderableModel from "./RenderableModel";

export default class GenerateModelFiles {

    async start() {
        const models = Model.get()

        console.log(models)

        for (const model of models) {
            await (new RenderableModel(model)).render()
        }
    }

}