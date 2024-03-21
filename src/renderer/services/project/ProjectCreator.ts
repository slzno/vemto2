import Main from "../wrappers/Main"
import Alert from "@Renderer/components/utils/Alert";

export interface ProjectCreatorData {
    name: string;
    path: string;
    completePath: string;
    starterKit: string; // Jetstream, Fortify, Breeze

    // Jetstream options
    usesJetstreamTeams: boolean;
}

export default class ProjectCreator {
    hasErrors: boolean = false
    data: ProjectCreatorData | null = null
    stateCallback: ((state: string) => void) | null = null

    async create(data: ProjectCreatorData, stateCallback: (state: string) => void) {
        this.data = data
        this.stateCallback = stateCallback

        try {
            await this.createProject()
            await this.generateStorageLink()

            if(data.starterKit === "jetstream") await this.installJetstream()

            await this.runStarterKitCommands()

            this.data = null
            this.hasErrors = false
            this.stateCallback = null
        } catch (error: any) {
            this.hasErrors = true

            Alert.error("Error creating project: " + error.message)
        }
    }

    async createProject() {
        this.stateCallback("Creating project! Please, wait... This may take a while.")

        await Main.API.executeComposerOnPath(this.data.path, `create-project laravel/laravel:^11.0 ${this.data.name}`)
    }

    async generateStorageLink() {
        this.stateCallback("Generating storage link...")

        await Main.API.executeArtisanOnPath(this.data.completePath, "storage:link")
    }

    async installJetstream() {
        const state = this.data.usesJetstreamTeams ? "Creating Jetstream with Teams..." : "Creating Jetstream..."

        this.stateCallback(state)

        await Main.API.executeComposerOnPath(this.data.completePath, "require laravel/jetstream --no-interaction")
    }

    async runStarterKitCommands() {
        if(this.data.starterKit === "jetstream") {
            await this.runJetstreamCommands()
        }
    }
    
    async runJetstreamCommands() {
        const command = this.data.usesJetstreamTeams
            ? "jetstream:install livewire --teams --no-interaction"
            : "jetstream:install livewire --no-interaction"

        this.stateCallback("Running Jetstream commands...")

        await Main.API.executeArtisanOnPath(this.data.completePath, command)
    }
}