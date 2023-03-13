export default class ColumnData {
    static getDefault() {
        return {
            name: '',
            type: '',
            order: 0,
            index: false,
            length: 0,
            unique: false,
            tableId: '',
            removed: false,
            schemaState: null,
            nullable: false,
            unsigned: false,
            default: '',
            autoIncrement: false,
        }
    }
}