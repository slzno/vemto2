export interface InputType {
    name: string,
    label: string,
    disableDefault?: boolean,
    disableMax?: boolean,
    disableMin?: boolean,
    disablePlaceholder?: boolean,
    hasStep?: boolean,
    allowsItems?: boolean,
    validationRules?: string[],
    updateValidationRules?: string[],
}

export default class InputTypeList {
    static getType(type: string): InputType {
        let column = this.get()[type]

        if (!column) return null

        return column as InputType
    }

    static get(): Object {
        return {
            "text": {
                name: "Text",
                disableMax: true,
                disableMin: true,
            },
            "select": {
                name: "Select",
                allowsItems: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
            },
            "image": {
                name: "Image",
                disableDefault: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
                validationRules: [
                    'image',
                    'max:1024'
                ],
            },
            "file": {
                name: "File",
                disableDefault: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
                validationRules: [
                    'file',
                    'max:1024'
                ],
            },
            "number": {
                name: "Number",
                hasStep: true,
            },
            "textarea": {
                name: "Textarea",
                disableMax: true,
                disableMin: true,
            },
            "email": {
                name: "Email",
                disableMax: true,
                disableMin: true,
            },
            "date": {
                name: "Date",
            },
            "datetime": {
                name: "Date Time",
            },
            "password": {
                name: "Password",
                disableMax: true,
                disableMin: true,
            },
            "checkbox": {
                name: "Checkbox",
                disableDefault: true,
                disablePlaceholder: true,
                disableMax: true,
                disableMin: true,
            },
            "radio": {
                name: "Radio",
                disableDefault: true,
                disablePlaceholder: true,
                disableMax: true,
                disableMin: true,
            },
            "radioGroup": {
                name: "Radio",
                disableDefault: true,
                disablePlaceholder: true,
                disableMax: true,
                disableMin: true,
            },
            "url": {
                name: "Url",
                disableMax: true,
                disableMin: true,
                validationRules: [
                    'url',
                ],
            },
            "hidden": {
                name: "Hidden",
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
            },
            "related-dependent-select": {
                name: "Database Dependent Select",
                allowsItems: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
            },
            "manual-dependent-select": {
                name: "Array Dependent Select",
                allowsItems: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
            },
        }
    }
}
