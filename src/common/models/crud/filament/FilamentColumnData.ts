import { FilamentColumnType } from "./FilamentColumnTypesList";

export interface FilamentColumnBadgeColor {
    label: string
    color: string
}

export interface FilamentIconColumnData {
    label: string
    iconName: string
}

export default interface FilamentColumnData {
    columnType: FilamentColumnType

    description?: string
    label?: string

    // Text column icon
    iconName?: string
    iconColor?: string

    showAsBadge?: boolean
    badgeColors?: FilamentColumnBadgeColor[]
    
    prefix?: string
    textLimit?: number
    suffix?: string
    
    canBeSortable?: boolean
    canBeSearchable?: boolean
    canBeToggled?: boolean

    isMarkdown?: boolean

    showAsNumeric?: boolean
    decimalPlaces?: number
    decimalSeparator?: string
    thousandsSeparator?: string

    showAsCurrency?: boolean
    currencySymbol?: string
    divideBy?: number

    icons?: FilamentIconColumnData[]
}