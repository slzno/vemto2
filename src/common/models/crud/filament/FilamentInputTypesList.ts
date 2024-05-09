import { InputType } from "../InputType";

export enum FilamentInputType {
    TEXT_INPUT = "text-input",
    SELECT = "select",
    CHECKBOX = "checkbox",
    TOGGLE = "toggle",
    RADIO = "radio",
    DATE_PICKER = "date-picker",
    DATETIME_PICKER = "date-time-picker",
    FILE_UPLOAD = "file-upload",
    RICH_EDITOR = "rich-editor",
    MARKDOWN_EDITOR = "markdown-editor",
    TEXTAREA = "textarea",
    HIDDEN = "hidden",
    COLOR_PICKER = "color-picker",
    TIME_PICKER = "time-picker"
}

export default class FilamentInputTypesList {
    static getFromInputType(type: InputType): FilamentInputType {
        let inputType = this.get()[type]

        if(!inputType) return FilamentInputType.TEXT_INPUT
        
        // If the input type is an array, we'll use the first type
        if(inputType instanceof Array) {
            inputType = inputType[0]
        }

        return inputType
    }

    static getSuggestionsFromInputType(type: InputType): FilamentInputType[] {
        let inputType = this.get()[type]

        if(!inputType) return [FilamentInputType.TEXT_INPUT]

        if(!(inputType instanceof Array)) {
            inputType = [inputType]
        }

        return inputType
    }

    static get() {
        return {
            [InputType.TEXT]: [
                FilamentInputType.TEXT_INPUT, FilamentInputType.TEXTAREA, FilamentInputType.RICH_EDITOR, FilamentInputType.MARKDOWN_EDITOR, FilamentInputType.COLOR_PICKER
            ],
            [InputType.TEXTAREA]: [
                FilamentInputType.RICH_EDITOR, FilamentInputType.MARKDOWN_EDITOR, FilamentInputType.TEXTAREA
            ],
            [InputType.NUMBER]: FilamentInputType.TEXT_INPUT,
            [InputType.FILE]: FilamentInputType.FILE_UPLOAD,
            [InputType.IMAGE]: FilamentInputType.FILE_UPLOAD,
            [InputType.BELONGS_TO]: FilamentInputType.SELECT,
            [InputType.CHECKBOX]: [
                FilamentInputType.CHECKBOX, FilamentInputType.TOGGLE
            ],
            [InputType.SELECT]: FilamentInputType.SELECT,
            [InputType.HIDDEN]: FilamentInputType.HIDDEN,
            [InputType.PASSWORD]: FilamentInputType.TEXT_INPUT,
            [InputType.EMAIL]: FilamentInputType.TEXT_INPUT,
            [InputType.DATE]: FilamentInputType.DATE_PICKER,
            [InputType.DATETIME]: FilamentInputType.DATETIME_PICKER,
            [InputType.TIME]: FilamentInputType.TIME_PICKER,
            [InputType.RADIO]: FilamentInputType.RADIO,
            [InputType.COLOR]: FilamentInputType.COLOR_PICKER,
            [InputType.URL]: FilamentInputType.TEXT_INPUT,
        }
    }
}
