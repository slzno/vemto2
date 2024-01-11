import Crud from "./Crud"
import Column from "../Column"
import CrudPanel from "./CrudPanel"
import Relationship from "../Relationship"
import * as changeCase from "change-case"
import RelaDB from "@tiago_silva_pereira/reladb"
import GenerateInputValidation, { ValidationRuleType } from "./services/GenerateInputValidation"
import Model from "../Model"
import { InputType } from "./InputType"

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
    relationshipId: string
    relationship: Relationship
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

    relationships() {
        return {
            crud: () => this.belongsTo(Crud),
            column: () => this.belongsTo(Column),
            panel: () => this.belongsTo(CrudPanel, "panelId"),
            relationship: () => this.belongsTo(Relationship, "relationshipId"),
        }
    }

    static createFromColumn(crud: Crud, column: Column) {
        const input = new Input()
        input.crudId = crud.id
        input.columnId = column.id
        input.name = column.name
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

        input.calculateType(column)
        input.generateItemsFromField(column)
        input.generateValidationRules()

        return input
    }

    calculateType(column: Column) {
        const defaultInputType = column.getDefaultInputType() as InputType

        if(column.hasBelongsToRelations()) {
            const relationship = column.getFirstBelongsToRelation()

            this.type = InputType.BELONGS_TO
            this.relationshipId = relationship.id

            return
        }

        this.type = defaultInputType || InputType.TEXT
    }

    /**
     * Get the property name for the input. 
     * For eg, if the input name is "first_name", the property name will be "firstName" 
     */
    getPropertyName(): string {
        return changeCase.camelCase(this.name)
    }

    getNewPropertyName(): string {
        return "new" + changeCase.pascalCase(this.name)
    }

    getFileDiskName(): string {
        return changeCase.snakeCase(this.crud.settings.collectionTitle)
    }

    getRelatedModelName(): string {
        const relatedModel = this.getRelatedModel()

        return relatedModel ? relatedModel.name : ""
    }

    getRelatedModel(): Model {
        return this.relationship ? this.relationship.relatedModel : null
    }

    isBelongsTo() {
        return this.type === InputType.BELONGS_TO && !! this.relationshipId
    }

    isCommon() {
        return !this.isFileOrImage()
    }

    isPassword() {
        return this.name === "password"
    }

    isFileOrImage() {
        return [InputType.FILE, InputType.IMAGE].includes(this.type)
    }

    isNullable() {
        return !this.isRequired()
    }

    isRequired() {
        return !! this.required
    }

    needsMaxValidation() {
        return [InputType.TEXT, InputType.TEXTAREA, InputType.NUMBER, InputType.FILE, InputType.IMAGE].includes(this.type) && this.max
    }

    needsMinValidation() {
        return [InputType.NUMBER].includes(this.type) && this.min
    }

    generateItemsFromField(column: Column) {
        if(!column.mustHaveOptions()) return;

        this.items = this.items || []

        column.options.forEach((option) => {
            this.items.push({
                label: changeCase.sentenceCase(option),
                value: option,
            })
        })
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

    getTemplate() {
        return `inputs/blade/${changeCase.pascalCase(this.type)}.vemtl`
    }
}
