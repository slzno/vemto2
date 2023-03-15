export default class ColumnData {
    static getDefault() {
        return {
            name: '',
            type: '',
            order: 0,
            index: false,
            length: null,
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