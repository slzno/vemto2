import RenderableDatabaseSeeder from "./RenderableDatabaseSeeder"

export default class GenerateDatabaseSeeder {
    async start() {
        await new RenderableDatabaseSeeder().render()
    }
}
