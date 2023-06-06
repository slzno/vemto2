import Page from "@Common/models/page/Page"
import RenderablePageView from "./RenderablePageView"
// import RenderablePageComponent from "./RenderablePageComponent"

export default class GeneratePageFiles {
    async start() {
        const pages = Page.get()

        for (const page of pages) {
            await new RenderablePageView(page).render()
            // await new RenderablePageComponent(page).render()
        }
    }
}
