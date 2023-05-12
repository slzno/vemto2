import Input from "@Common/models/crud/Input"
import ColumnTypeList from "@Common/models/column-types/base/ColumnTypeList"
import ColumnsDefaultData from "@Common/models/column-types/default/ColumnsDefaultData"
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
        let baseValidationRules = this.getBaseValidationRules(type)

        // If there is no update validation rules, fallback to creation validation rules if
        // fallback is enabled
        if (!baseValidationRules.length && type === ValidationRuleType.UPDATE && fallback) {
            baseValidationRules = this.getBaseValidationRules(ValidationRuleType.CREATION)
        }

        return baseValidationRules.map((rule) => {
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
}
