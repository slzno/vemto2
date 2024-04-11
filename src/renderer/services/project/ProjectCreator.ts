import PathUtil from "@Common/util/PathUtil";
import Main from "../wrappers/Main"

export interface ProjectCreatorData {
    name: string;
    path: string;
    completePath: string;
    starterKit: string; // Jetstream, Fortify, Breeze
    database: string;

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

        const uiKitsMethodNames = {
            jetstream: 'installJetstream',
            breeze: 'installBreeze',
        }
        
        const uiKitMethodName = uiKitsMethodNames[this.data.starterKit] || null

        try {
            if (!uiKitMethodName) throw new Error("Invalid starter kit")

            await this.createProject()
            await this.generateStorageLink()

            await this[uiKitMethodName]()
            await this.changeDatabase()

            this.data = null
            this.hasErrors = false
            this.stateCallback = null
        } catch (error: any) {
            this.hasErrors = true

            return
        }
    }

    async createProject() {
        this.stateCallback("Creating project, please wait! This may take a while")

        await Main.API.executeComposerOnPath(this.data.path, `create-project laravel/laravel:^11.0 ${this.data.name}`)
    }

    async generateStorageLink() {
        this.stateCallback("Generating storage link")

        await Main.API.executeArtisanOnPath(this.data.completePath, "storage:link")
    }

    async installJetstream() {
        const state = this.data.usesJetstreamTeams ? "Installing Jetstream with Teams" : "Installing Jetstream"

        this.stateCallback(state)

        await Main.API.executeComposerOnPath(this.data.completePath, "require laravel/jetstream --no-interaction")
        await this.runJetstreamCommands()
    }
    
    async runJetstreamCommands() {
        const command = this.data.usesJetstreamTeams
            ? "jetstream:install livewire --teams --no-interaction"
            : "jetstream:install livewire --no-interaction"

        this.stateCallback("Running Jetstream commands")

        await Main.API.executeArtisanOnPath(this.data.completePath, command)
    }

    async installBreeze() {
        this.stateCallback("Installing Breeze")

        await Main.API.executeComposerOnPath(this.data.completePath, "require laravel/breeze --dev --no-interaction")
        await this.runBreezeCommands()
    }

    async runBreezeCommands() {
        this.stateCallback("Running Breeze commands")

        await Main.API.executeArtisanOnPath(this.data.completePath, "breeze:install livewire --no-interaction")
    }

    async changeDatabase() {
        if(this.data.database === "sqlite") return

        this.stateCallback("Changing database to " + this.data.database)

        await Main.API.readFile(
            PathUtil.join(this.data.completePath, ".env")
        ).then(async (fileContent: string) => {
            fileContent = fileContent.toString()
                .replace("DB_CONNECTION=sqlite", `DB_CONNECTION=${this.data.database}`)

            await Main.API.writeFile(PathUtil.join(this.data.completePath, ".env"), fileContent)
        })
        .catch(error => {
            console.log(error)
            throw new Error("Could not open .env file")
        })
    }
}