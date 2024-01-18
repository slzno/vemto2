import { InputType } from "../InputType";

export enum FilamentInputType {
    TEXT_INPUT = "text-input",
    SELECT = "select",
    CHECKBOX = "checkbox",
    TOGGLE = "toggle",
    RADIO = "radio",
    DATETIME_PICKER = "datetime-picker",
    FILE_UPLOAD = "file-upload",
    RICH_EDITOR = "rich-editor",
    MARKDOWN_EDITOR = "markdown-editor",
    TEXTAREA = "textarea",
    HIDDEN = "hidden",
    COLOR_PICKER = "color-picker"
}

export class FilamentInputTypesList {
    static getFromInputType(type: InputType): FilamentInputType {
        let inputType = this.get()[type]

        if(!inputType) return FilamentInputType.TEXT_INPUT

        return inputType
    }

    static get() {
        return {
            [InputType.TEXT]: FilamentInputType.TEXT_INPUT,
            [InputType.TEXTAREA]: FilamentInputType.MARKDOWN_EDITOR,
            [InputType.NUMBER]: FilamentInputType.TEXT_INPUT,
            [InputType.FILE]: FilamentInputType.FILE_UPLOAD,
            [InputType.IMAGE]: FilamentInputType.FILE_UPLOAD,
            [InputType.BELONGS_TO]: FilamentInputType.SELECT,
            [InputType.CHECKBOX]: FilamentInputType.CHECKBOX,
            [InputType.SELECT]: FilamentInputType.SELECT,
            [InputType.HIDDEN]: FilamentInputType.HIDDEN,
            [InputType.PASSWORD]: FilamentInputType.TEXT_INPUT,
            [InputType.EMAIL]: FilamentInputType.TEXT_INPUT,
            [InputType.DATE]: FilamentInputType.DATETIME_PICKER,
            [InputType.DATETIME]: FilamentInputType.DATETIME_PICKER,
            [InputType.TIME]: FilamentInputType.DATETIME_PICKER,
            [InputType.RADIO]: FilamentInputType.RADIO,
            [InputType.COLOR]: FilamentInputType.COLOR_PICKER,
        }
    }
}
