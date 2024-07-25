import Crud from "./Crud"
import Model from "../Model"
import Column from "../Column"
import CrudPanel from "./CrudPanel"
import { InputType } from "./InputType"
import * as changeCase from "change-case"
import Relationship from "../Relationship"
import RelaDB from "@tiago_silva_pereira/reladb"
import InputSettingsList from "../data/InputSettingsList"
import FillInputFilamentData from "./fillers/FillInputFilamentData"
import FilamentInputSettings from "./filament/FilamentInputSettings"
import FilamentRuleNameConversions from "./filament/FilamentRuleNameConversions"
import FilamentIndividualValidations from "./filament/FilamentIndividualValidations"
import GenerateInputValidation, { ValidationRuleType } from "./services/GenerateInputValidation"
import FillInputNovaData from "./fillers/FillInputNovaData"
import NovaInputSettings from "./nova/NovaInputSettings"

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

    filamentSettings: FilamentInputSettings
    novaSettings: NovaInputSettings

    relationships() {
        return {
            crud: () => this.belongsTo(Crud),
            column: () => this.belongsTo(Column),
            panel: () => this.belongsTo(CrudPanel, "panelId"),
            relationship: () => this.belongsTo(Relationship, "relationshipId"),
        }
    }

    static deleting(input: Input) {
        const hasInputWithSameTranslation = (translationProperty: string) => Crud.get().filter(
            (crud: Crud) => crud.id !== input.crud.id && crud.inputs.filter(
                (input: Input) => input[translationProperty] === input[translationProperty]
            ).length > 1
        ).length > 0

        if(!hasInputWithSameTranslation("label")) {
            input.crud.project.deleteTranslationOnAllLanguages(input.getLangKeyForLabel())
        }

        if(!hasInputWithSameTranslation("placeholder")) {
            input.crud.project.deleteTranslationOnAllLanguages(input.getLangKeyForPlaceholder())
        }

    }

    static createFromColumn(crud: Crud, column: Column, forceType?: InputType | null, ignoreColumnHidden: boolean = false) {
        const input = new Input()
        input.crudId = crud.id
        input.columnId = column.id
        input.name = column.name
        input.label = input.generateTranslationForLabel()
        input.placeholder = input.generateTranslationForPlaceholder()
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

        let columnIsHidden = false
        
        if(crud.model) {
            columnIsHidden = ignoreColumnHidden ? false : crud.model.hidden && crud.model.hidden.indexOf(column.name) !== -1
        }

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

        if(crud.isForNova()) {
            FillInputNovaData.onInput(input)
        }

        return input
    }

    static fakeFromColumn(crud: Crud, column: Column, forceType?: InputType | null, ignoreColumnHidden: boolean = false) {
        const input = new Input()

        input.disableAutomaticRelations()

        input.crud = crud
        input.column = column
        input.name = column.name
        input.label = input.generateTranslationForLabel()
        input.placeholder = input.generateTranslationForPlaceholder()
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

        let columnIsHidden = false
        
        if(crud.model) {
            columnIsHidden = ignoreColumnHidden ? false : crud.model.hidden && crud.model.hidden.indexOf(column.name) !== -1
        }

        input.showOnDetails = !columnIsHidden
        input.showOnIndex = !columnIsHidden

        input.calculateType(column)

        if (forceType) {
            input.type = forceType
        }

        input.calculateInputParamsByType()
        input.generateItemsFromColumn()
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
        return changeCase.snakeCase(this.crud.getLabel())
    }

    getRelatedModelName(): string {
        const relatedModel = this.getRelatedModel()

        return relatedModel ? relatedModel.name : ""
    }

    getRelatedModelLabel(): string {
        const relatedModel = this.getRelatedModel()

        return relatedModel ? relatedModel.table.getLabelColumnName() : ""
    }

    getRelatedModel(): Model {
        return this.relationship ? this.relationship.relatedModel : null
    }

    isRelatedToModel(model: Model) {
        return this.isForRelationship() && this.relationship.relatedModelId === model.id
    }

    isBelongsTo(): boolean {
        return this.type === InputType.BELONGS_TO && !! this.relationshipId
    }

    isForRelationship(): boolean {
        return this.isBelongsTo() || this.column.isForeignKey()
    }

    getColumnNameForFilament(isBelongsToManyDetail: boolean = false, manyToManyRelationshipInputKey: Column): string {
        if((isBelongsToManyDetail && manyToManyRelationshipInputKey) && this.name === manyToManyRelationshipInputKey.name) {
            return this.getRelatedModelLabel()
        }

        if(this.isBelongsTo()) {
            return `${this.relationship.name}.${this.relationship.relatedModel.table.getLabelColumnName()}`
        }

        return this.name
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

    isSelect(): boolean {
        return this.type === InputType.SELECT
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

    isJson(): boolean {
        return this.column.isJson()
    }

    isRequiredOnCreation(): boolean {
        return this.isRequired() && this.showOnCreation
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

    getCreationRulesForLivewireMethod(crud: Crud) {
        return this.getRulesForLivewireMethod(this.creationRules, crud)
    }

    getUpdateRulesForLivewireMethod(crud: Crud) {
        return this.getRulesForLivewireMethod(this.updateRules, crud)
    }

    getRulesForLivewireMethod(rules: InputValidationRule[], crud: Crud) {
        let allRules: string[] = rules.map((rule) => rule.value)

        const dynamicVariables = ['unique', 'exists']

        return allRules.map((rule: string) => {
            const [ruleName, ruleArgs] = rule.split(':')

            if(dynamicVariables.includes(ruleName)) {
                let args = ruleArgs.split(',').map((arg) => `'${arg}'`).join(', ')
            
                let rule = `Rule::${ruleName}(${args})`

                if(ruleName === 'unique' && rules === this.updateRules) {
                    rule += `->ignore($this->${crud.settings.itemName})`
                }

                return rule
            }

            return `"${rule}"`
        })
    }

    getCreationRulesForNova() {
        return this.getRulesForNovaMethod(this.creationRules)
    }

    getUpdateRulesForNova() {
        return this.getRulesForNovaMethod(this.updateRules)
    }

    getRulesForNovaMethod(rules: InputValidationRule[]) {
        let allRules: string[] = rules.map((rule) => rule.value)

        const dynamicVariables = ['unique']

        return allRules.map((rule: string) => {
            const [ruleName, ruleArgs] = rule.split(':')

            if(dynamicVariables.includes(ruleName)) {
                let rule = `${ruleName}:${ruleArgs}`

                if(ruleName === 'unique' && rules === this.updateRules) {
                    rule += `,{{resourceId}}`
                }

                rule = `'${rule}'`

                return rule
            }

            return `"${rule}"`
        })
    }

    getCreationRulesForCrudRequest() {
        return this.getRulesForCrudRequest(this.creationRules)
    }

    getUpdateRulesForCrudRequest() {
        return this.getRulesForCrudRequest(this.updateRules)
    }

    getRulesForCrudRequest(rules: InputValidationRule[]) {
        let allRules: string[] = rules.map((rule) => rule.value)

        const dynamicVariables = ['unique', 'exists']

        return allRules.map((rule: string) => {
            const [ruleName, ruleArgs] = rule.split(':')

            if(dynamicVariables.includes(ruleName)) {
                let args = ruleArgs.split(',').map((arg) => `'${arg}'`).join(', ')
            
                let rule = `Rule::${ruleName}(${args})`

                if(ruleName === 'unique' && rules === this.updateRules) {
                    rule += `->ignore($this->${changeCase.camelCase(this.crud.settings.itemName)})`
                }

                return rule
            }

            return `"${rule}"`
        })
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
                        if(Number(ruleArg) >= 0) return ruleArg
    
                        return `"${ruleArg.trim()}"`
                    }).join(', ')
                }
    
                // Ignore record for unique rule
                if(laravelRuleName.toLowerCase() == 'unique') {
                    methodArgs += ', ignoreRecord: true'
                }

                const hasRequiredRuleInUpdate = this.updateRules.find((rule: InputValidationRule) => rule.value.toLowerCase() == 'required'),
                    isRequiredOnlyOnCreate = laravelRuleName.toLowerCase() == 'required' && !hasRequiredRuleInUpdate,
                    isNullableOnlyOnCreate = laravelRuleName.toLowerCase() == 'nullable' && hasRequiredRuleInUpdate

                if(isRequiredOnlyOnCreate || isNullableOnlyOnCreate) {
                    methodArgs += `fn (string $context): bool => $context === 'create'`
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

    generateTranslationForLabel() {
        const key = this.getLangKeyForLabel(),
            label = changeCase.sentenceCase(this.column.name)

        this.crud.project.setTranslationOnAllLanguages(key, label)

        return key
    }

    generateTranslationForPlaceholder() {
        const key = this.getLangKeyForPlaceholder(),
            placeholder = changeCase.sentenceCase(this.column.name)

        this.crud.project.setTranslationOnAllLanguages(key, placeholder)

        return key
    }

    getLangKeyForLabel() {
        return `${this.getBaseLangKey()}.label`
    }

    getLangKeyForPlaceholder() {
        return `${this.getBaseLangKey()}.placeholder`
    }

    getBaseLangKey() {
        const crudKey = this.crud.getBaseLangKey()

        return `${crudKey}.inputs.${this.name}`
    }

    getFilamentBaseLangKey(filamentData: string): string {
        const crudKey = this.crud.getBaseLangKey()

        return `${crudKey}.filament.${this.name}`
    }

    getFilamentLangKeyFor(filamentData: string): string {
        filamentData = changeCase.snakeCase(filamentData)

        return `${this.getFilamentBaseLangKey(filamentData)}.${filamentData}`
    }

    generateFilamentTranslationFor(filamentData: string, defaultValue: string): string {
        const key = this.getFilamentLangKeyFor(filamentData)

        this.crud.project.setTranslationOnAllLanguages(key, defaultValue)

        return key
    }
}
