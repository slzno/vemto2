import Input from "../Input";
import { InputType } from "../InputType";
import NovaInputSettings from "./NovaInputSettings";
import NovaInputTypesList, { NovaInputType } from "./NovaInputTypesList";

export default class NovaInputDataList {
    static getFromInput(input: Input): NovaInputSettings {
        const inputType = NovaInputTypesList.getFromInputType(input.type)

        let data: NovaInputSettings = {
            inputType,
            filterable: false,
            fullWidth: false
        } as NovaInputSettings

        switch (input.type) {
            case InputType.TEXT:
                data = {
                    ...data,
                    maxLength: 0,
                    enforceMaxLength: false,
                    copyable: false,
                    asHtml: false,
                    textAlign: 'left',
                    suggestions: []
                }
                break;
            case InputType.FILE:
            case InputType.IMAGE:
                data = {
                    ...data,
                    disk: null,
                    disableDownload: false,
                    deletable: false,
                    prunable: false,
                    preload: null
                }
                break;
            case InputType.TEXTAREA:
                data = {
                    ...data,
                    alwaysShow: false,
                    preset: null,
                    withFiles: false
                }
                break;
            case InputType.PASSWORD:
                data = {
                    ...data,
                    onlyOnForms: false
                }
                break;
            case InputType.SELECT:
                data = {
                    ...data,
                    searchable: false
                }
                break;
        }

        return data
    }
}