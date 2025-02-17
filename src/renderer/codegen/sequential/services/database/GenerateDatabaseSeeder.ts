import DatabaseSeederRenderable from "./DatabaseSeederRenderable"

export default class GenerateDatabaseSeeder {
    async start() {
        await new DatabaseSeederRenderable().render()
    }
}
