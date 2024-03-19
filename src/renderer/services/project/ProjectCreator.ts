import PathUtil from "@Common/util/PathUtil";
import Main from "../wrappers/Main"

export interface ProjectCreatorData {
    name: string;
    path: string;
    completePath: string;
    starterKit: string; // Jetstream, Fortify, Breeze

    // Jetstream options
    usesJetstreamTeams: boolean;
}

export default class ProjectCreator {
    static data: ProjectCreatorData | null = null
    static stateCallback: ((state: string) => void) | null = null

    static async create(data: ProjectCreatorData, stateCallback: (state: string) => void) {
        if(this.data || this.stateCallback) return

        this.data = data
        this.stateCallback = stateCallback

        try {
            await this.createProject()
            await this.generateStorageLink()

            if(data.starterKit === "jetstream") await this.installJetstream()

            await this.runStarterKitCommands()
        } catch (error) {
            stateCallback("Error creating project")
        } finally {
            this.data = null
            this.stateCallback = null
        }
    }

    static async createProject() {
        this.stateCallback("Creating project! Please, wait... This may take a while.")

        await Main.API.executeComposerOnPath(this.data.path, `create-project laravel/laravel:^11.0 ${this.data.name}`)
    }

    static async generateStorageLink() {
        this.stateCallback("Generating storage link...")

        await Main.API.executeArtisanOnPath(this.data.completePath, "storage:link")
    }

    static async installJetstream() {
        const state = this.data.usesJetstreamTeams ? "Creating Jetstream with Teams..." : "Creating Jetstream..."

        this.stateCallback(state)

        await Main.API.executeComposerOnPath(this.data.completePath, "require laravel/jetstream --no-interaction")
    }

    static async runStarterKitCommands() {
        if(this.data.starterKit === "jetstream") {
            await this.runJetstreamCommands()
        }
    }
    
    static async runJetstreamCommands() {
        const command = this.data.usesJetstreamTeams
            ? "jetstream:install livewire --teams --no-interaction"
            : "jetstream:install livewire --no-interaction"

        this.stateCallback("Running Jetstream commands...")

        await Main.API.executeArtisanOnPath(this.data.completePath, command)
    }
}