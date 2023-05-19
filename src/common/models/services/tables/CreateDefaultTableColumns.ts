import Table from "@Common/models/Table"
import Column from "@Common/models/Column"

export default new class CreateDefaultTableColumns {
    table: Table

    setTable(table: Table): CreateDefaultTableColumns {
        this.table = table

        return this
    }

    create() {
        new Column({
            tableId: this.table.id,
            name: 'id',
            type: 'bigInteger',
            autoIncrement: true,
            unsigned: true
        }).saveFromInterface()

        new Column({
            tableId: this.table.id,
            name: 'created_at',
            type: 'timestamp',
            nullable: true
        }).saveFromInterface()

        new Column({
            tableId: this.table.id,
            name: 'update_at',
            type: 'timestamp',
            nullable: true
        }).saveFromInterface()
    }
}