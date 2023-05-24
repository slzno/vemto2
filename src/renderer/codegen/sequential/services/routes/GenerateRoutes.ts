import Routes from "./Routes"
import Route from "@Common/models/Route"

export default class GenerateRoutes {
    async start() {
        const routes = Route.get()

        await new Routes(routes).render()
    }
}
