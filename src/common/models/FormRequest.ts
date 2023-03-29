import RelaDB from '@tiago_silva_pereira/reladb'

export default class FormRequest extends RelaDB.Model {
    id: string

    static identifier() {
        return 'FormRequest'
    }

    relationships() {
        return {
            // table: () => this.belongsTo(Table),
        }
    }
}
