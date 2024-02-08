import { isEqual } from 'lodash'
import DataHelper from './DataHelper'

export default class DataComparator {

    static stringsAreDifferent(value1: string, value2: string): boolean {
        return DataComparator.coalesceString(value1) !== DataComparator.coalesceString(value2)
    }

    static numbersAreDifferent(value1: number, value2: number): boolean {
        return DataComparator.coalesceNumber(value1) !== DataComparator.coalesceNumber(value2)
    }

    static booleansAreDifferent(value1: boolean, value2: boolean): boolean {
        return DataComparator.coalesceBoolean(value1) !== DataComparator.coalesceBoolean(value2)
    }

    static arraysAreDifferent(value1: any[], value2: any[]): boolean {
        return !isEqual(value1, value2)
    }

    static objectsAreDifferent(value1: any, value2: any): boolean {
        return !isEqual(DataComparator.cloneObject(value1), DataComparator.cloneObject(value2))
    }

    static coalesceString(value: string): string {
        return value || ''
    }

    static coalesceNumber(value: number, defaultValue: number = null): number {
        return value || defaultValue
    }

    static coalesceBoolean(value: boolean): boolean {
        return value || false
    }

    static cloneArray(arr: any[]): any[] {
        return DataHelper.cloneArray(arr)
    }

    static cloneObject(obj: any): any {
        return DataHelper.cloneObject(obj)
    }

}