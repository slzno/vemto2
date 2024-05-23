import Main from "../wrappers/Main"
import SchemaBuilder from "../schema/SchemaBuilder"
import Project, { ProjectSettings, ProjectUIStarterKit } from "@Common/models/Project"
import GenerateBasicProjectData from "@Renderer/services/project/GenerateBasicProjectData"

export default class ProjectConnector {

    project: Project
    projectSettings: ProjectSettings

    constructor(project: Project) {
        this.project = project
    }

    async connect(settings: ProjectSettings) {
        try {
            if(this.project.connectionFinished) {
                return
            }
    
            this.projectSettings = settings
            this.setProjectSettingsDefaults(settings)
    
            await this.createVemtoFolder()
            await this.createNecessaryFiles()
            await this.doFirstSchemaSync()
            await this.generateBasicProjectData()
            await this.saveProject()
        } catch (error) {
            throw error
        }
    }

    async createVemtoFolder() {
        console.log("Creating vemto folder")
        await Main.API.copyInternalFolderIfNotExists("vemto-folder-base", ".vemto")
    }

    async createNecessaryFiles() {
        if(!this.projectSettings.isFreshLaravelProject) {
            console.log("Skip creating files for non-fresh Laravel project")
            return
        }

        console.log("Creating files for fresh Laravel project")

        // TODO: change this to render the files instead of copying
        // const bootstrapPath = "file-templates/starter-kits/default/bootstrap"
        // await Main.API.copyInternalFolderToProject(bootstrapPath, "/")

        if(this.isBreezeLivewire()) {
            console.log("Creating files for Breeze project")
            const templatesPath = "file-templates/starter-kits/breeze-livewire/resources"
            await Main.API.copyInternalFolderToProject(templatesPath, "/")
        }

        if(this.isJetstreamLivewire()) {
            console.log("Creating files for Jetstream Livewire project")
            const templatesPath = "file-templates/starter-kits/jetstream-livewire/resources"
            
            await Main.API.copyInternalFolderToProject(templatesPath, "/")
        }
    }

    async doFirstSchemaSync() {
        if(this.project.connectionFinished) {
            throw new Error("Project connection is already finished, cannot do first schema sync")
        }

        const schemaBuilder = new SchemaBuilder(this.project),
            syncTables = true,
            syncModels = true

        return await schemaBuilder.build(syncTables, syncModels)
    }

    isBreezeLivewire() {
        return this.projectSettings.uiStarterKit === ProjectUIStarterKit.BREEZE
            && this.projectSettings.usesLivewire
    }

    isJetstreamLivewire() {
        return this.projectSettings.uiStarterKit === ProjectUIStarterKit.JETSTREAM 
            && this.projectSettings.usesLivewire
    }

    async generateBasicProjectData() {
        const defaultDataGenerator = new GenerateBasicProjectData(this.project)

        await defaultDataGenerator.handle()
    }

    setProjectSettingsDefaults(settings: ProjectSettings) {
        this.project.settings = settings
    }

    async saveProject() {
        this.project.connectionFinished = true
        this.project.canIgnoreNextSchemaSourceChanges = true

        return await this.project.save()
    }

}