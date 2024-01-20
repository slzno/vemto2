import Input from "../Input";
import { InputType } from "../InputType";
import FilamentColumnData from "./FilamentColumnData";
import FilamentColumnTypesList from "./FilamentColumnTypesList";

export default class FilamentColumnDataList {
    static getFromInput(input: Input): FilamentColumnData {
        const columnType = FilamentColumnTypesList.getFromInputType(input.type)
        
        let data: FilamentColumnData = {
            columnType
        } as FilamentColumnData

        switch (input.type) {
            case InputType.TEXT:
            case InputType.EMAIL:
            case InputType.PASSWORD:
            case InputType.NUMBER:
            case InputType.URL:
            default:
                data = {
                    ...data,
                }
                break;
            case InputType.SELECT:
            case InputType.BELONGS_TO:
                data = {
                    ...data,
                }
                break;
            case InputType.CHECKBOX:
                data = {
                    ...data,
                }
                break;
            case InputType.RADIO:
                data = {
                    ...data
                }
                break;
            case InputType.DATE:
            case InputType.TIME:
            case InputType.DATETIME:
                data = {
                    ...data
                }
                break;
            case InputType.FILE:
            case InputType.IMAGE:
                data = {
                    ...data
                }
                break;
            case InputType.TEXTAREA:
                data = {
                    ...data
                }
                break;
        }

        return data
    }
}
