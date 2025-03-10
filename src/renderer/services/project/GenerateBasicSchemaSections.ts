import Project from "@Common/models/Project"
import SchemaSection from "@Common/models/SchemaSection"

export default class GenerateBasicSchemaSections {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        console.log("Generating basic schema sections")

        if(this.project.connectionFinished) {
            return
        }

        if(!this.project.hasSection("App")) {
            SchemaSection.create({
                name: "App",
                scrollX: 0,
                scrollY: 0,
                zoom: this.project.currentZoom || 100,
                projectId: this.project.id,
            })
        }

        if(!this.project.hasSection("Laravel")) {
            SchemaSection.create({
                name: "Laravel",
                scrollX: 0,
                scrollY: 0,
                zoom: this.project.currentZoom || 100,
                projectId: this.project.id,
            })
        }

        if(!this.project.hasSection("Jetstream") && this.project.isJetstream()) {
            SchemaSection.create({
                name: "Jetstream",
                scrollX: 0,
                scrollY: 0,
                zoom: this.project.currentZoom || 100,
                projectId: this.project.id,
            })
        }
                
        this.moveLaravelTablesToLaravelSection()
        this.moveJetsreamTablesToJetstreamSection()
        this.moveRemainingTablesToAppSection()
    }

    moveLaravelTablesToLaravelSection() {
        const laravelSection = this.project.getSchemaSectionByName("Laravel")

        this.project.tables.forEach(table => {
            const tableGoesToLaravelSection = table.isLaravelDefaultTable() || table.isNovaTable()

            if(tableGoesToLaravelSection && !table.belongsToASection()) {
                table.sectionId = laravelSection.id
                table.save()
            }
        })
    }

    moveJetsreamTablesToJetstreamSection() {
        if(!this.project.isJetstream()) return

        const jetstreamSection = this.project.getSchemaSectionByName("Jetstream")

        this.project.tables.forEach(table => {
            if(table.isJetstreamDefaultTable() && !table.belongsToASection()) {
                table.sectionId = jetstreamSection.id
                table.save()
            }
        })
    }

    moveRemainingTablesToAppSection() {
        const appSection = this.project.getSchemaSectionByName("App")

        this.project.tables.forEach(table => {
            if(!table.belongsToASection()) {
                table.sectionId = appSection.id
                table.save()
            }
        })
    }

}