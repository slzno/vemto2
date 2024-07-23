import { InputType } from "../InputType";

export enum NovaInputType {
    AUDIO = "audio",
    AVATAR = "avatar",
    BADGE = "badge",
    BOOLEAN = "boolean",
    BOOLEAN_GROUP = "boolean-group",
    CODE = "code",
    COLOR = "color",
    COUNTRY = "country",
    CURRENCY = "currency",
    DATE = "date",
    DATETIME = "date-time",
    EMAIL = "email",
    FILE = "file",
    HIDDEN = "hidden",
    ID = "id",
    IMAGE = "image",
    MARKDOWN = "markdown",
    MULTI_SELECT = "multi-select",
    NUMBER = "number",
    PASSWORD = "password",
    SELECT = "select",
    SLUG = "slug",
    TEXT = "text",
    TEXTAREA = "textarea",
    TIMEZONE = "timezone",
    TRIX = "trix",
    URL = "url",
    BELONGS_TO = "belongs-to"
}

export default class NovaInputTypesList {
    static getFromInputType(type: InputType): NovaInputType {
        let inputType = this.get()[type]

        if(!inputType) return NovaInputType.TEXT
        
        // If the input type is an array, we'll use the first type
        if(inputType instanceof Array) {
            inputType = inputType[0]
        }

        return inputType
    }

    static getSuggestionsFromInputType(type: InputType): NovaInputType[] {
        let inputType = this.get()[type]

        if(!inputType) return [NovaInputType.TEXT]

        if(!(inputType instanceof Array)) {
            inputType = [inputType]
        }

        return inputType
    }

    static get() {
        return {
            [InputType.TEXT]: [
                NovaInputType.TEXT, NovaInputType.TEXTAREA, NovaInputType.MARKDOWN, NovaInputType.URL, NovaInputType.SLUG, NovaInputType.EMAIL, NovaInputType.TRIX, NovaInputType.COUNTRY, NovaInputType.CODE,
                NovaInputType.CURRENCY, NovaInputType.TIMEZONE, NovaInputType.COLOR
            ],
            [InputType.TEXTAREA]: [
                NovaInputType.MARKDOWN, NovaInputType.CODE, NovaInputType.TEXTAREA, NovaInputType.TRIX
            ],
            [InputType.NUMBER]: [
                NovaInputType.NUMBER, NovaInputType.CURRENCY
            ],
            [InputType.FILE]: [
                NovaInputType.FILE, NovaInputType.IMAGE, NovaInputType.AUDIO, NovaInputType.AVATAR
            ],
            [InputType.IMAGE]: [
                NovaInputType.IMAGE, NovaInputType.AVATAR
            ],
            [InputType.BELONGS_TO]: NovaInputType.BELONGS_TO,
            [InputType.CHECKBOX]: [
                NovaInputType.BOOLEAN, NovaInputType.BOOLEAN_GROUP
            ],
            [InputType.SELECT]: [
                NovaInputType.SELECT, NovaInputType.MULTI_SELECT, NovaInputType.BADGE
            ],
            [InputType.HIDDEN]: NovaInputType.HIDDEN,
            [InputType.PASSWORD]: [
                NovaInputType.PASSWORD, NovaInputType.TEXT
            ],
            [InputType.EMAIL]: [
                NovaInputType.EMAIL, NovaInputType.TEXT
            ],
            [InputType.DATE]: NovaInputType.DATE,
            [InputType.DATETIME]: NovaInputType.DATETIME,
            [InputType.TIME]: NovaInputType.DATETIME,
            [InputType.RADIO]: NovaInputType.SELECT,
            [InputType.COLOR]: [
                NovaInputType.COLOR, NovaInputType.TEXT
            ],
            [InputType.URL]: [
                NovaInputType.URL, NovaInputType.TEXT
            ],
        }
    }
}
