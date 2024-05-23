import Table from './Table'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class SchemaSection extends RelaDB.Model {
    id: string
    name: string
    tables: Table[]
    project: Project
    projectId: string
    scrollX: number
    scrollY: number
    scrollCenteringRequested: boolean

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            tables: () => this.hasMany(Table, "sectionId"),
        }
    }

    static deleting(section: SchemaSection) {
        const defaultSection = section.project.getDefaultSchemaSection()

        section.tables.forEach(table => {
            table.moveToSection(defaultSection)
        })
    }

    isDefault() {
        return ["App", "Main"].includes(this.name)
    }

    canBeRemoved() {
        if(this.project.schemaSections.length <= 1) return false

        return !this.isDefault()
    }

    hasScroll(): boolean {
        return !! this.scrollX && !! this.scrollY
    }

    centerScroll(canvasWidth, canvasHeight, baseSize: number = 50000) {
        this.scrollX = (baseSize / 2) - (canvasWidth / 2)
        this.scrollY = (baseSize / 2) - (canvasHeight / 2)
        this.save()
    }

    saveScroll(x: number, y: number) {
        this.scrollX = x
        this.scrollY = y
        this.save()
    }

    checkAndDelete() {
        if(this.isDefault()) {
            throw new Error("Cannot delete default schema section")
        }

        this.delete()
    }

    requestScrollCentering() {
        this.scrollCenteringRequested = true
        this.save()
    }

    clearScrollCenteringRequest() {
        this.scrollCenteringRequested = false
        this.save()
    }
}