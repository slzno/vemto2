import Input from "@Common/models/crud/Input"
import ColumnTypeList from "@Common/models/column-types/base/ColumnTypeList"
import ColumnsDefaultData from "@Common/models/column-types/default/ColumnsDefaultDataList"
import InputTypeList from "@Common/models/input-types/InputTypeList"
import {
    InputValidationRule,
    InputValidationRuleType,
} from "@Common/models/crud/Input"

export enum ValidationRuleType {
    CREATION = "validationRules",
    UPDATE = "updateValidationRules",
}

export default class GenerateInputValidation {
    input: Input

    constructor(input: Input) {
        this.input = input
    }

    get(type: ValidationRuleType = ValidationRuleType.CREATION, fallback: boolean = true): InputValidationRule[] {
        let baseValidationRules = this.getBaseValidationRules(type),
            validationRules = []

        // If there is no update validation rules, fallback to creation validation rules if
        // fallback is enabled
        if (!baseValidationRules.length && type === ValidationRuleType.UPDATE && fallback) {
            baseValidationRules = this.getBaseValidationRules(ValidationRuleType.CREATION)
        }

        console.log('baseValidationRules', baseValidationRules)

        validationRules = this.addLogicValidationToRules(baseValidationRules, type)

        return validationRules.map((rule) => {
            return {
                type: InputValidationRuleType.TEXTUAL,
                value: rule,
            }
        })
    }

    getBaseValidationRules(
        type: ValidationRuleType = ValidationRuleType.CREATION
    ): string[] {
        const inputType = InputTypeList.getType(this.input.type),
            columnType = ColumnTypeList.getByIdentifier(this.input.column.type),
            columnDefaultData = ColumnsDefaultData.getSettingsByColumnName(
                this.input.column.name
            )

        if (columnDefaultData && columnDefaultData[type]) {
            return columnDefaultData[type]
        }

        if (inputType && inputType[type]) {
            return inputType[type]
        }

        return columnType[type] || []
    }

    addLogicValidationToRules(rules: string[], type: ValidationRuleType = ValidationRuleType.CREATION): string[] {
        if(this.input.column.nullable) {
            rules.push("nullable")
        } else {
            rules.push("required")
        }

        if(this.input.column.unique) {
            rules.push(`unique:{TABLE},${this.input.column.name}`)
        }

        if(this.input.needsMaxValidation()) {
            rules.push(`max:${this.input.max}`)
        }

        if(this.input.needsMinValidation()) {
            rules.push(`min:${this.input.min}`)
        }

        if(type === ValidationRuleType.UPDATE) {
            rules = this.treatUpdateRules(rules)
        }

        rules = [...new Set(rules)]

        rules = this.replacePlaceholders(rules)
        rules = this.removeAntagonisticRules(rules)
        rules = this.moveRequiredToStart(rules)
        rules = this.moveNullableToStart(rules)
        
        return rules
    }

    replacePlaceholders(rules: string[]): string[] {
        rules = rules.map(rule => {
            rule = rule.replace('{TABLE}', this.input.column.table.name)
            
            const columnOptions = this.input.column.options

            if(columnOptions && Array.isArray(columnOptions)) {
                rule = rule.replace('{IMPLODED_OPTIONS}', columnOptions.join(',').toLowerCase())
            }

            return rule
        })

        return rules
    }

    treatUpdateRules(rules: string[]) {
        if(this.input.isPassword() || this.input.isFileOrImage()) {
            rules = rules.filter(rule => rule !== 'required')

            if(this.input.column.nullable) rules.push('nullable')
        }

        return rules
    }

    removeAntagonisticRules(rules: string[]): string[] {
        if(rules.includes('nullable')) {
            rules = rules.filter(rule => rule !== 'required')
        }

        return rules
    }

    moveRequiredToStart(rules: string[]): string[] {
        if(rules.includes('required')) {
            rules = rules.filter(rule => rule !== 'required')
            rules.unshift('required')
        }

        return rules
    }

    moveNullableToStart(rules: string[]): string[] {
        if(rules.includes('nullable')) {
            rules = rules.filter(rule => rule !== 'nullable')
            rules.unshift('nullable')
        }

        return rules
    }
}
