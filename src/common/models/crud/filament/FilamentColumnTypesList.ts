import { InputType } from "../InputType";

export enum FilamentColumnType {
    TEXT_COLUMN = "text-column",
    ICON_COLUMN = "icon-column",
    IMAGE_COLUMN = "image-column",
    COLOR_COLUMN = "color-column",
    SELECT_COLUMN = "select-column",
    TOGGLE_COLUMN = "toggle-column",
    TEXT_INPUT_COLUMN = "text-input-column",
    CHECKBOX_COLUMN = "checkbox-column"
}

export class FilamentColumnTypesList {
    static getFromInputType(inputType: InputType): FilamentColumnType {
        let columnType = this.get()[inputType]

        if(!columnType) return FilamentColumnType.TEXT_COLUMN

        return columnType
    }

    static get() {
        return {
            [InputType.TEXT]: FilamentColumnType.TEXT_COLUMN,
            [InputType.TEXTAREA]: FilamentColumnType.TEXT_COLUMN,
            [InputType.NUMBER]: FilamentColumnType.TEXT_COLUMN,
            [InputType.FILE]: FilamentColumnType.TEXT_COLUMN,
            [InputType.IMAGE]: FilamentColumnType.IMAGE_COLUMN,
            [InputType.BELONGS_TO]: FilamentColumnType.TEXT_COLUMN,
            [InputType.CHECKBOX]: FilamentColumnType.CHECKBOX_COLUMN,
            [InputType.SELECT]: FilamentColumnType.TEXT_COLUMN,
            [InputType.EMAIL]: FilamentColumnType.TEXT_COLUMN,
            [InputType.DATE]: FilamentColumnType.TEXT_COLUMN,
            [InputType.DATETIME]: FilamentColumnType.TEXT_COLUMN,
            [InputType.TIME]: FilamentColumnType.TEXT_COLUMN,
            [InputType.COLOR]: FilamentColumnType.COLOR_COLUMN,
        }
    }
}
