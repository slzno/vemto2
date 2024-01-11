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
            unsigned: true,
            order: 0,
        }).saveFromInterface()

        new Column({
            tableId: this.table.id,
            name: 'created_at',
            type: 'timestamp',
            nullable: true,
            order: 1,
        }).saveFromInterface()

        new Column({
            tableId: this.table.id,
            name: 'updated_at',
            type: 'timestamp',
            nullable: true,
            order: 2,
        }).saveFromInterface()
    }
}