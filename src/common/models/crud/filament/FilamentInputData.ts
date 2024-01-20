import { FilamentColumnType } from "./FilamentColumnTypesList"
import { FilamentInputType } from "./FilamentInputTypesList"

export default interface FilamentInputData {
    // Common params
    inputType: FilamentInputType
    autofocus?: boolean
    helperText?: string
    useCustomInput?: boolean

    // Text input params
    autoComplete?: boolean
    dataList?: string[]

    // Select params
    allowHtml?: boolean
    canBePreloaded?: boolean
    isMultiple?: boolean
    canBeSearchable?: boolean
    canSelectPlaceholder?: boolean
    loadingMessage?: string
    noResultMessage?: string
    searchMessage?: string

    // Checkbox & radio params
    inline?: boolean
    inlineLabel?: boolean

    // Date, datetime and time params
    dateFormat?: string
    timezone?: string
    disableSeconds?: boolean
    displayFormat?: string
    closeOnDateSelection?: boolean
    disabledDates?: string[]

    // File params
    disk?: string
    directory?: string  
    visibility?: string
    preserveFilenames?: boolean
    useAvatarMode?: boolean
    useImageEditor?: boolean
    imageEditorAspectRatios?: string[]
    imageEditorMode?: number
    imageEditorViewportWidth?: string
    imageEditorViewportHeight?: string
    useCircleCropper?: boolean
    disablePreview?: boolean
    isDownloadable?: boolean
    canOpenFilesInNewTab?: boolean
    canReorderFiles?: boolean
    disableDeleteButton?: boolean
}