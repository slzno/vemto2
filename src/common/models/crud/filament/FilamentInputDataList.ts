import Input, { FilamentInputData } from "../Input";
import { InputType } from "../InputType";
import { FilamentColumnType, FilamentColumnTypesList } from "./FilamentColumnTypesList";
import { FilamentInputTypesList } from "./FilamentInputTypesList";

export class FilamentInputDataList {
    static getFromInput(input: Input): FilamentInputData {
        let data: FilamentInputData = {} as FilamentInputData

        const inputType = FilamentInputTypesList.getFromInputType(input.type),
            columnType = FilamentColumnTypesList.getFromInputType(input.type)

        switch (input.type) {
            case InputType.TEXT:
            case InputType.EMAIL:
            case InputType.PASSWORD:
            case InputType.NUMBER:
            case InputType.URL:
            default:
                data = {
                    inputType,
                    columnType,
                    autofocus: !input.crud.inputs.length, // Autofocus on first input
                    helperText: null,
                    autoComplete: true,
                }
                break;
            case InputType.SELECT:
                data = {
                    inputType,
                    columnType,
                    allowHtml: false,
                    canBePreloaded: false,
                    canBeSearchable: false,
                    canSelectPlaceholder: true,
                    loadingMessage: null,
                }
        }

        return data
    }
}
