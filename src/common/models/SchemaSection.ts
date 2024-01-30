import Table from './Table'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class SchemaSection extends RelaDB.Model {
    id: string
    name: string
    tables: Table[]
    project: Project
    projectId: string

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            tables: () => this.hasMany(Table, "sectionId"),
        }
    }

    deleting() {
        const defaultSection = this.project.getDefaultSchemaSection()

        this.tables.forEach(table => {
            table.sectionId = defaultSection.id
            table.save()
        })
    }

    isDefault() {
        return ["App", "Main"].includes(this.name)
    }

    canBeRemoved() {
        if(this.project.schemaSections.length <= 1) return false

        return !this.isDefault()
    }
}