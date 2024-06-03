import RenderableSearchable from "../model/RenderableSearchable";

export default class GenerateModelScopes {
    async start() {
        await new RenderableSearchable().render()
    }
}
