import Crud, { CrudType } from "./Crud"
import Column from "../Column"
import CrudPanel from "./CrudPanel"
import Relationship from "../Relationship"
import * as changeCase from "change-case"
import RelaDB from "@tiago_silva_pereira/reladb"
import GenerateInputValidation, { ValidationRuleType } from "./services/GenerateInputValidation"
import Model from "../Model"
import { InputType } from "./InputType"
import InputSettingsList from "../data/InputSettingsList"
import FillInputFilamentData from "./fillers/FillInputFilamentData"
import FilamentRuleNameConversions from "./filament/FilamentRuleNameConversions"
import FilamentIndividualValidations from "./filament/FilamentIndividualValidations"
import FilamentInputData from "./filament/FilamentInputData"

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

    filamentData: FilamentInputData

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
        input.required = !column.nullable
        input.hidden = false
        input.defaultValue = ""
        input.checked = false
        input.max = 0
        input.min = 0
        input.step = 0
        input.items = []
        input.showOnCreation = true
        input.showOnUpdate = true

        const columnIsHidden = crud.model.hidden && crud.model.hidden.indexOf(column.name) !== -1

        input.showOnDetails = !columnIsHidden
        input.showOnIndex = !columnIsHidden

        input.calculateType(column)

        if (forceType) {
            input.type = forceType
        }

        input.calculateInputParamsByType()
        input.generateItemsFromColumn()
        input.generateValidationRules()

        if(crud.isForFilament()) {
            FillInputFilamentData.onInput(input)
        }

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

    isBelongsTo(): boolean {
        return this.type === InputType.BELONGS_TO && !! this.relationshipId
    }

    isCommon(): boolean {
        return !this.isFileOrImage()
    }

    isPassword(): boolean {
        return this.name === "password"
    }

    isFileOrImage(): boolean {
        return [InputType.FILE, InputType.IMAGE].includes(this.type)
    }

    isImage(): boolean {
        return this.type === InputType.IMAGE
    }

    isTextarea(): boolean {
        return this.type === InputType.TEXTAREA
    }

    isEmail(): boolean {
        return this.type === InputType.EMAIL
    }

    isNumber(): boolean {
        return this.type === InputType.NUMBER
    }

    isUrl(): boolean {
        return this.type === InputType.URL
    }

    isNullable(): boolean {
        return !this.isRequired()
    }

    isRequired(): boolean {
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

    calculateInputParamsByType() {
        if (this.type === InputType.NUMBER) {
            this.step = 1
        }
    }

    resetItemsFromColumn() {
        this.items = []

        this.generateItemsFromColumn()

        this.save()
    }

    generateItemsFromColumn() {
        if(!this.column.mustHaveOptions()) return;

        this.items = this.items || []

        this.column.options.forEach((option) => {
            this.items.push({
                label: changeCase.sentenceCase(option),
                value: option,
            })
        })
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

    getRulesForFilamentTemplate() {
        const inlineRules = [],
            individualRules = this.creationRules.map((rule: InputValidationRule) => {
                const [laravelRuleName, ruleArgs] = rule.value.split(':'),
                    laravelRuleNameCamelCase = changeCase.camelCase(laravelRuleName),
                    filamentMethodName = FilamentRuleNameConversions.convert(this, laravelRuleNameCamelCase)
    
                if(!FilamentIndividualValidations.match(filamentMethodName)) {
                    inlineRules.push(`"${rule.value}"`)
                    return null
                }
    
                let methodArgs = ''
    
                if(ruleArgs?.length) {
                    methodArgs = ruleArgs.split(',').map((ruleArg: any) => {
                        if(Number(ruleArg)) return ruleArg
    
                        return `"${ruleArg.trim()}"`
                    }).join(', ')
                }
    
                // Ignore record for unique rule
                if(laravelRuleName.toLowerCase() == 'unique') {
                    methodArgs += ', ignoreRecord: true'
                }

                // Methods where arguments need to be passed by array
                if(['in', 'doesntStartWith', 'doesntEndWith', 'endsWith', 'notIn', 'prohibits', 'startsWith'].includes(laravelRuleName.toLowerCase())) {
                    methodArgs = `[${methodArgs}]`
                }
    
                return [
                    changeCase.camelCase(filamentMethodName),
                    methodArgs
                ];
            }).filter(rule => rule)

        return [
            inlineRules,
            individualRules
        ];
    }

    getTypeSettings() {
        return InputSettingsList.getFromType(this.type)
    }

    getTemplate() {
        return `inputs/blade/${changeCase.pascalCase(this.type)}.vemtl`
    }
}
