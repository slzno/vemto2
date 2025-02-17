import Page from "@Common/models/page/Page"
import PageViewRenderable from "./PageViewRenderable"
import PageComponentRenderable from "./PageComponentRenderable"

export default class GeneratePageFiles {
    async start() {
        const pages = Page.get()

        for (const page of pages) {
            await new PageViewRenderable(page).render()
            await new PageComponentRenderable(page).render()
        }
    }
}
