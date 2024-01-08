import Crud from "./Crud"
import Column from "../Column"
import CrudPanel from "./CrudPanel"
import Relationship from "../Relationship"
import * as changeCase from "change-case"
import RelaDB from "@tiago_silva_pereira/reladb"
import GenerateInputValidation, { ValidationRuleType } from "./services/GenerateInputValidation"
import Model from "../Model"
import { InputType } from "./InputType"
import InputSettingsList from "../data/InputSettingsList"

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

    static createFromColumn(crud: Crud, column: Column, forceType?: InputType | null) {
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

        if (forceType) {
            input.type = forceType
        }

        input.generateColumnParities()
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
        return [InputType.NUMBER, InputType.TEXT, InputType.TEXTAREA].includes(this.type) && this.min
    }

    generateValidationRules() {
        const validationGenerator = new GenerateInputValidation(this)

        this.creationRules = validationGenerator.get(ValidationRuleType.CREATION)
        this.updateRules = validationGenerator.get(ValidationRuleType.UPDATE)
    }

    generateColumnParities() {
        if (this.type === InputType.NUMBER) {
            this.step = 1
        }

        if(['set', 'enum'].includes(this.column.type)) {
            const options = this.column.options

            if(options && Array.isArray(options)) {
                options.forEach(option => this.items.push({ value: option, label: changeCase.capitalCase(option), }))
            }
        }
    }

    getCreationRulesForTemplate() {
        return this.getRulesForTemplate(this.creationRules)
    }

    getUpdateRulesForTemplate() {
        return this.getRulesForTemplate(this.updateRules)
    }

    allowsPlaceholder() {
        const typeSettings = this.getTypeSettings()

        return typeSettings && !typeSettings.disablePlaceholder
    }

    allowsDefaultValue() {
        const typeSettings = this.getTypeSettings()

        return typeSettings && !typeSettings.disableDefault
    }

    allowsItems() {
        const typeSettings = this.getTypeSettings()

        return typeSettings && typeSettings.allowsItems
    }

    allowsMinimumLength() {
        const typeSettings = this.getTypeSettings()

        return typeSettings && !typeSettings.disableMin
    }

    allowsMaximumLength() {
        const typeSettings = this.getTypeSettings()

        return typeSettings && !typeSettings.disableMax
    }

    allowsStep() {
        const typeSettings = this.getTypeSettings()

        return typeSettings && typeSettings.hasStep
    }

    isDateOrDateTime() {
        return [InputType.DATE, InputType.DATETIME].includes(this.type)
    }

    getRulesForTemplate(rules: InputValidationRule[]) {
        return rules.map((rule) => rule.value).join("|")
    }

    getTypeSettings() {
        return InputSettingsList.getFromType(this.type)
    }

    getTemplate() {
        return `inputs/blade/${changeCase.pascalCase(this.type)}.vemtl`
    }
}
