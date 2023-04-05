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
        if(!value1 && !value2) return false

        if(!value1 || !value2) return true

        if(value1.length !== value2.length) return true

        for(let i = 0; i < value1.length; i++) {
            if(value1[i] !== value2[i]) return true
        }

        return false
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

}