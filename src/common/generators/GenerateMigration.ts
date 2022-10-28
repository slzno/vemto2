import Table from "../models/Table"

export default class GenerateMigration {
    table: Table

    constructor(table: Table) {
        this.table = table
    }

    run() {
        console.log(this.table.name)

        // if(this.table.doesNotHaveChanges()) return

        if(this.needsNewMigrationFile()) {
            this.createNewMigrationFile()
        } else {
            this.appendToExistingMigrationFile()
        }
    }

    needsNewMigrationFile() {
        return false
    }

    createNewMigrationFile() {
    }

    appendToExistingMigrationFile() {
    }
}