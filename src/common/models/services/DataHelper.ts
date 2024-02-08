export default class DataHelper {

    static cloneArray(arr: any[]): any[] {
        if(!arr) return []
        return JSON.parse(JSON.stringify(arr))
    }

    static cloneObject(obj: any): any {
        if(!obj) return {}
        return JSON.parse(JSON.stringify(obj))
    }

}