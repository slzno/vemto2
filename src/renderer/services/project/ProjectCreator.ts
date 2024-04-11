import PathUtil from "@Common/util/PathUtil";
import Main from "../wrappers/Main"
import Alert from "@Renderer/components/utils/Alert"
import FilamentInstaller from "./installer/composer/FilamentInstaller";
import JetstreamInstaller from "./installer/composer/JetstreamInstaller";
import BreezeInstaller from "./installer/composer/BreezeInstaller";

export interface ProjectCreatorData {
    name: string;
    path: string;
    completePath: string;
    starterKit: string; // Jetstream, Fortify, Breeze
    database: string;

    // Jetstream options
    usesJetstreamTeams: boolean;

    // Filament options
    mustInstallFilament: boolean;
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

            await this.installStarterKit()
            await this.changeDatabase()

            if(this.data.mustInstallFilament) {
                await FilamentInstaller.installFromProjectCreator(this.data, stateCallback)
            }

            this.data = null
            this.hasErrors = false
            this.stateCallback = null
        } catch (error: any) {
            this.hasErrors = true

            Alert.error("Error creating project: " + error.message)
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

    async installStarterKit() {
        if(this.data.starterKit === "jetstream") {
            await JetstreamInstaller.installFromProjectCreator(this.data, this.stateCallback)
        }

        if(this.data.starterKit === "breeze") {
            await BreezeInstaller.installFromProjectCreator(this.data, this.stateCallback)
        }
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