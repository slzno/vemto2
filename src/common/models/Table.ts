import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Table extends RelaDB.Model {
    
    static identifier() {
        return 'Table'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }
}
