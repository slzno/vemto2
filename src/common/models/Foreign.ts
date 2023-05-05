import pad from 'pad'
import Model from './Model'
import Column from './Column'
import RelaDB from '@tiago_silva_pereira/reladb'
import WordManipulator from '@Common/util/WordManipulator'

export default class Foreign extends RelaDB.Model {
    indexName: string
    defaultIndexName: string

    columnId: string
    column: Column

    relatedModelId: string
    relatedModel: Model

    relatedColumnId: string
    relatedColumn: Column

    static identifier() {
        return 'Foreign'
    }

    relationships() {
        return {
            column: () => this.belongsTo(Column, 'columnId').atMostOne(),
            relatedColumn: () => this.belongsTo(Column, 'relatedColumnId'),
            relatedModel: () => this.belongsTo(Model, 'relatedModelId'),
        }
    }

    calculateDefaultIndexName(): void {
        let indexNameConvention = this.getIndexNameConvention()

        this.indexName = indexNameConvention
        this.defaultIndexName = indexNameConvention

        this.save()
        this.checkValidIndexName()
    }

    checkValidIndexName(): void {
        if(this.indexName.length <= 64) return

        let foreignAlias = this.calculateForeignAlias()

        // this.addWarning(`The ${this.getIndexNameConvention()} identifier was renamed to ${foreignAlias} because the original identifier has more than 64 characters`)

        this.indexName = foreignAlias
        this.save()
    }

    calculateForeignAlias(): string {
        let project = this.relatedModel.project

        project.lastForeignAlias++
        project.save()

        let aliasIdentificator = pad(7, project.lastForeignAlias.toString(), '0')

        return `foreign_alias_${aliasIdentificator}`
    }

    getIndexNameConvention(): string {
        if(!this.column || !this.column.model) return ''

        const columnEntityNameSnakeCase = WordManipulator.snakeCase(this.column.model.name)

        return `${columnEntityNameSnakeCase}_${this.column.name}_foreign`
    }
}