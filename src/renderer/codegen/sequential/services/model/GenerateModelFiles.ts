import RenderableModel from "./RenderableModel";

export default class GenerateModelFiles {

    async start() {
        await (new RenderableModel).render()
    }

}