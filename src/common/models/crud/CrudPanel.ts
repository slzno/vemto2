import Crud from './Crud'
import RelaDB from '@tiago_silva_pereira/reladb'
import Input from './Input'

export default class CrudPanel extends RelaDB.Model {
    id: string
    title: string
    crud: Crud
    crudId: string
    order: number
    inputs: Input[]

    static identifier() {
        return 'CrudPanel'
    }

    relationships() {
        return {
            crud: () => this.belongsTo(Crud),
            inputs: () => this.hasMany(Input).cascadeDelete(),
        }
    }
}
