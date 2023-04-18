import Crud from './Crud'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class CrudPanel extends RelaDB.Model {
    id: string
    title: string
    crud: Crud
    crudId: string

    static identifier() {
        return 'CrudPanel'
    }

    relationships() {
        return {
            crud: () => this.belongsTo(Crud),
        }
    }
}
