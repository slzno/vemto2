import Crud from "./Crud"
import Column from "../Column"
import CrudPanel from "./CrudPanel"
import * as changeCase from "change-case"
import RelaDB from "@tiago_silva_pereira/reladb"
import GenerateInputValidation, { ValidationRuleType } from "./services/GenerateInputValidation"

export enum InputType {
    TEXT = "text",
    TEXTAREA = "textarea",
    NUMBER = "number",
    FILE = "file",
    IMAGE = "image",
}

export enum InputValidationRuleType {
    TEXTUAL = "textual",
    CODE = "code",
}

export interface InputValidationRule {
    type: InputValidationRuleType,
    value: string,
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
    type: InputType
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
    creationRules: InputValidationRule[]
    updateRules: InputValidationRule[]
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
        input.showOnCreation = true
        input.showOnUpdate = true
        input.showOnDetails = true
        input.showOnIndex = true

        input.generateValidationRules()

        return input
    }

    isPassword() {
        return this.name === "password"
    }

    isFileOrImage() {
        return [InputType.FILE, InputType.IMAGE].includes(this.type)
    }

    needsMaxValidation() {
        return [InputType.TEXT, InputType.TEXTAREA, InputType.NUMBER, InputType.FILE, InputType.IMAGE].includes(this.type) && this.max
    }

    needsMinValidation() {
        return [InputType.NUMBER].includes(this.type) && this.min
    }

    generateValidationRules() {
        const validationGenerator = new GenerateInputValidation(this)

        this.creationRules = validationGenerator.get(ValidationRuleType.CREATION)
        this.updateRules = validationGenerator.get(ValidationRuleType.UPDATE)
    }

    getCreationRulesForTemplate() {
        return this.getRulesForTemplate(this.creationRules)
    }

    getUpdateRulesForTemplate() {
        return this.getRulesForTemplate(this.updateRules)
    }

    getRulesForTemplate(rules: InputValidationRule[]) {
        const templateRules = rules.map((rule) => {
            if (rule.type === InputValidationRuleType.CODE) {
                return rule.value
            }

            return `'${rule.value}'`
        })

        return `[${templateRules.join(", ")}]`
    }
}
