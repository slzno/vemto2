import Input from "../Input"
import { FilamentInputType } from "./FilamentInputTypesList"

export default class FilamentRuleNameConversions {
    static convert(input: Input, ruleName: string): string {
        let commonConverted = FilamentRuleNameConversions.getCommon()[ruleName],
            fromTypeConversions = FilamentRuleNameConversions.getFromType()[input.filamentData.inputType]
        
        if (fromTypeConversions && fromTypeConversions[ruleName]) {
            return fromTypeConversions[ruleName]
        }

        return commonConverted ?? ruleName
    }

    static getCommon() {
        return {
            min: "minLength",
            max: "maxLength",
        }
    }

    static getFromType() {
        return {
            [FilamentInputType.FILE_UPLOAD]: {
                min: "minSize",
                max: "maxSize",
            }
        }
    }
}
