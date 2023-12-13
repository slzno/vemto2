import Table from "@Common/models/Table"
import Model from "@Common/models/Model"
import WordManipulator from "@Renderer/../common/util/WordManipulator"

export default new class CreateDefaultTableModel {
    table: Table

    setTable(table: Table): CreateDefaultTableModel {
        this.table = table

        return this
    }

    create(): Model {
        const model = new Model({
            tableId: this.table.id,
            projectId: this.table.project.id,
            namespace: "App\\Models",
            hasGuarded: true,
            hasTimestamps: true,
            guarded: []
        })
        
        const modelNameByTableName = WordManipulator.runMultiple(
            ['singularize', 'pascalCase'],
            this.table.name
        )

        model.name = modelNameByTableName
        model.plural = this.table.name

        model.calculateDataByName()
        model.saveFromInterface()

        return model
    }
}