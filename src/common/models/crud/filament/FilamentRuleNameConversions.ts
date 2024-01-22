import Input from "../Input"
import { InputType } from "../InputType"
import { FilamentInputType } from "./FilamentInputTypesList"

export default class FilamentRuleNameConversions {
    static convert(input: Input, ruleName: string): string {
        let commonConverted = FilamentRuleNameConversions.getCommon()[ruleName],
            fromTypeConversions = FilamentRuleNameConversions.getFromType(input.type)
        
        if (fromTypeConversions && Object.keys(fromTypeConversions).includes(ruleName)) {
            commonConverted = fromTypeConversions[ruleName]
        }

        return commonConverted ?? ruleName
    }

    static getCommon() {
        return {
            min: "minLength",
            max: "maxLength",
        }
    }

    static getFromType(inputType: InputType) {
        let conversions = null

        switch (inputType) {
            case InputType.FILE:
            case InputType.IMAGE:
                conversions = {
                    min: "minSize",
                    max: "maxSize",
                }
                break;
            case InputType.NUMBER:
                conversions = {
                    min: "minValue",
                    max: "maxValue",
                }
                break;
        }

        return conversions
    }
}
