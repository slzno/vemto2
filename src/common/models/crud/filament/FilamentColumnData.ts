import { FilamentColumnType } from "./FilamentColumnTypesList";

export default interface FilamentColumnData {
    columnType: FilamentColumnType

    description?: string
    label?: string

    canBeSortable?: boolean
    showAsBadge?: boolean

    prefix?: string
    suffix?: string

    canBeSearchable?: boolean
    canBeToggled?: boolean
}