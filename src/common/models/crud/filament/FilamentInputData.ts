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

    prefix?: string
    prefixIcon?: string
    prefixIconColor?: string

    suffix?: string
    suffixIcon?: string
    suffixIconColor?: string
    
    inputMode?: string
    autoCompleteName?: string
    autocapitalize?: string
    isRevealable?: boolean
    mask?: string

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
    onIcon?: string
    offIcon?: string
    onColor?: string
    offColor?: string

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

    // Textarea params
    toolbarButtons?: string[]
    disableToolbarButtons?: string[]
    rows?: number
    cols?: number
    autosize?: boolean
    exactLength?: number

    // Color params
    isHsl?: boolean
    isRgb?: boolean
    isRgba?: boolean
}