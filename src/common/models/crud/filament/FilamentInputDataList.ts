import Input, { FilamentInputData } from "../Input";
import { InputType } from "../InputType";
import { FilamentColumnType, FilamentColumnTypesList } from "./FilamentColumnTypesList";
import { FilamentInputTypesList } from "./FilamentInputTypesList";

export class FilamentInputDataList {
    static getFromInput(input: Input): FilamentInputData {
        const inputType = FilamentInputTypesList.getFromInputType(input.type),
            columnType = FilamentColumnTypesList.getFromInputType(input.type)
        
        let data: FilamentInputData = {
            inputType,
            columnType,
        } as FilamentInputData

        switch (input.type) {
            case InputType.TEXT:
            case InputType.EMAIL:
            case InputType.PASSWORD:
            case InputType.NUMBER:
            case InputType.URL:
            default:
                data = {
                    ...data,
                    autofocus: !input.crud.inputs.length, // Autofocus on first input
                    helperText: null,
                    autoComplete: true,
                }
                break;
            case InputType.SELECT:
            case InputType.BELONGS_TO:
                data = {
                    ...data,
                    allowHtml: false,
                    canBePreloaded: false,
                    canBeSearchable: false,
                    canSelectPlaceholder: true,
                    loadingMessage: null,
                    useCustomInput: true
                }
                break;
            case InputType.CHECKBOX:
                data = {
                    ...data,
                    inline: true
                }
                break;
            case InputType.RADIO:
                data = {
                    ...data,
                    inline: false,
                    inlineLabel: true,
                }
                break;
            case InputType.DATE:
            case InputType.TIME:
            case InputType.DATETIME:
                data = {
                    ...data,
                    closeOnDateSelection: false,
                    timezone: null,
                    dateFormat: null,
                    displayFormat: null,
                    disableSeconds: false,
                    useCustomInput: true
                }
        }

        return data
    }
}
