import Input from "./Input"
import CrudPanel from "./CrudPanel"
import Model from "@Common/models/Model"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"

export enum CrudType {
    DEFAULT = "Default",
    VUE = "Vue",
    LIVEWIRE = "Livewire",
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

    static identifier() {
        return "Crud"
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            panels: () => this.hasMany(CrudPanel),
        }
    }

    createFromModel(model: Model) {
        const crud = new Crud()
        crud.type = CrudType.DEFAULT
        crud.name = model.name + " CRUD"
        crud.modelId = model.id
        crud.projectId = model.projectId
        crud.save()

        crud.addInputsFromModel(model)
    }

    addInputsFromModel(model: Model) {
        model.table.columns.forEach((column, index) => {
            const panel = new CrudPanel()
            panel.title = column.name
            panel.crudId = this.id
            panel.order = index
            panel.save()

            const input = Input.createFromColumn(column)
            input.crudId = this.id
            input.panelId = panel.id
            input.save()
        })
    }
}
