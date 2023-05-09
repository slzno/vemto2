import Crud from "./Crud"
import Column from "../Column"
import CrudPanel from "./CrudPanel"
import * as changeCase from "change-case"
import RelaDB from "@tiago_silva_pereira/reladb"

export enum InputType {
    TEXT = "text",
}

export default class Input extends RelaDB.Model {
    id: string
    crudId: string
    crud: Crud
    panelId: string
    panel: CrudPanel
    columnId: string
    column: Column
    name: string
    type: string
    label: string
    placeholder: string
    order: number
    readOnly: boolean
    required: boolean
    hidden: boolean
    defaultValue: string
    checked: boolean
    max: number
    min: number
    step: number
    items: any[]
    creationRules: any[]
    updateRules: any[]
    showOnCreation: boolean
    showOnUpdate: boolean
    showOnDetails: boolean
    showOnIndex: boolean

    static identifier() {
        return "Input"
    }

    relationships() {
        return {
            crud: () => this.belongsTo(Crud),
            column: () => this.belongsTo(Column),
            panel: () => this.belongsTo(CrudPanel, "panelId"),
        }
    }

    static createFromColumn(column: Column) {
        const input = new Input()
        input.columnId = column.id
        input.name = column.name
        input.type = InputType.TEXT
        input.label = changeCase.sentenceCase(column.name)
        input.placeholder = changeCase.sentenceCase(column.name)
        input.readOnly = false
        input.required = false
        input.hidden = false
        input.defaultValue = ""
        input.checked = false
        input.max = 0
        input.min = 0
        input.step = 0
        input.items = []
        input.creationRules = []
        input.updateRules = []
        input.showOnCreation = true
        input.showOnUpdate = true
        input.showOnDetails = true
        input.showOnIndex = true

        return input
    }
}
