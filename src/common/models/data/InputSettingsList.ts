export interface InputSettings {
    name: string
    label: string
    disableDefault?: boolean
    disableMax?: boolean
    disableMin?: boolean
    disablePlaceholder?: boolean
    hasStep?: boolean
    allowsItems?: boolean
    validationRules?: string[]
    updateValidationRules?: string[]
}

export default class InputSettingsList {
    static getFromType(type: string): InputSettings {
        let column = this.get()[type]

        if (!column) return null

        return column as InputSettings
    }

    static get(): Object {
        return {
            text: {
                name: "Text",
                disableMax: true,
                disableMin: true,
            },
            select: {
                name: "Select",
                allowsItems: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
            },
            image: {
                name: "Image",
                disableDefault: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
                validationRules: ["image", "max:1024"],
                updateValidationRules: ["nullable", "image", "max:1024"],
            },
            file: {
                name: "File",
                disableDefault: true,
                disableMax: true,
                disableMin: true,
                disablePlaceholder: true,
                validationRules: ["file", "max:1024"],
                updateValidationRules: ["nullable", "file", "max:1024"],
            },
            number: {
                name: "Number",
                hasStep: true,
            },
            textarea: {
                name: "Textarea",
                disableMax: true,
                disableMin: true,
            },
            email: {
                name: "Email",
                disableMax: true,
                disableMin: true,
            },
            date: {
                name: "Date",
                validationRules: ["date"],
            },
            datetime: {
                name: "Date Time",
                validationRules: ["date"],
            },
            password: {
                name: "Password",
                disableMax: true,
                disableMin: true,
                validationRules: ["required", "string", "min:6"],
                updateValidationRules: ["nullable", "string", "min:6"],
            },
            checkbox: {
                name: "Checkbox",
                disableDefault: true,
                disablePlaceholder: true,
                disableMax: true,
                disableMin: true,
            },
            radio: {
                name: "Radio",
                disableDefault: true,
                disablePlaceholder: true,
                disableMax: true,
                disableMin: true,
                allowsItems: true,
            },
            radioGroup: {
                name: "Radio",
                disableDefault: true,
                disablePlaceholder: true,
                disableMax: true,
                disableMin: true,
                allowsItems: true
            },
            url: {
                name: "Url",
                disableMax: true,
                disableMin: true,
                validationRules: ["url"],
            },
            hidden: {
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
