import Input from "./Input"
import CrudPanel from "./CrudPanel"
import Model from "@Common/models/Model"
import { capitalCase } from "change-case"
import Column from "@Common/models/Column"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"

export enum CrudType {
    DEFAULT = "Default",
    VUE = "Vue",
    LIVEWIRE = "Livewire",
}

export interface CrudSettings {
    itemTitle: string
    collectionTitle: string
}

export default class Crud extends RelaDB.Model {
    id: string
    name: string
    type: CrudType
    model: Model
    modelId: string
    project: Project
    projectId: string
    panels: CrudPanel[]
    inputs: Input[]
    settings: CrudSettings
    defaultSearchColumn: Column
    defaultSearchColumnId: string

    static identifier() {
        return "Crud"
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            inputs: () => this.hasMany(Input).cascadeDelete(),
            panels: () => this.hasMany(CrudPanel).cascadeDelete(),
            defaultSearchColumn: () => this.belongsTo(Column, "defaultSearchColumnId"),
        }
    }

    hasDefaultSearchColumn(): boolean {
        return !! this.defaultSearchColumn
    }

    static createFromModel(model: Model) {
        const defaultSearchColumn = model.table.getLabelColumn()

        const crud = new Crud()
        crud.type = CrudType.LIVEWIRE
        crud.name = capitalCase(model.plural)
        crud.modelId = model.id
        crud.projectId = model.projectId

        crud.settings = {
            itemTitle: capitalCase(model.name),
            collectionTitle: capitalCase(model.plural),
        }

        if(defaultSearchColumn) {
            crud.defaultSearchColumnId = defaultSearchColumn.id
        }

        crud.save()

        crud.addInputsFromModel(model)
    }

    addInputsFromModel(model: Model) {
        const panel = new CrudPanel()
        panel.title = 'Main'
        panel.crudId = this.id
        panel.order = 0
        panel.save()

        model.table.getColumns().forEach((column) => {
            if(column.isPrimaryKey()) return
            if(column.isDefaultLaravelTimestamp()) return

            const input = Input.createFromColumn(column)
            input.crudId = this.id
            input.panelId = panel.id
            input.save()
        })
    }
}
