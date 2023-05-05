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
    inputs: Input[]

    static identifier() {
        return "Crud"
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            panels: () => this.hasMany(CrudPanel).cascadeDelete(),
            inputs: () => this.hasMany(Input).cascadeDelete(),
        }
    }

    static createFromModel(model: Model) {
        const crud = new Crud()
        crud.type = CrudType.DEFAULT
        crud.name = model.name + " CRUD"
        crud.modelId = model.id
        crud.projectId = model.projectId
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
