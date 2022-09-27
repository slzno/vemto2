class FluentTableItem {
    constructor(table, data) {
        Object.assign(this, data)
        this.table = table
    }
}

class Column extends FluentTableItem {
    setName(name) {
        this.name = name
        return this
    }

    isUnique() {
        return this.unique || this.table.uniqueIndexes().some(idx => idx.hasColumn(this))
    }

    foreigns() {
        return this.table.foreigns.filter(foreign => foreign.hasColumn(this))
    }

    isForeign() {
        return this.foreigns().length > 0
    }
}

class Index extends FluentTableItem {
    isUnique() {
        return this.type === 'unique'
    }

    isPrimary() {
        return this.type === 'primary'
    }

    hasColumn(column) {
        return this.columns.includes(column.name)
    }
}

class Foreign extends FluentTableItem {
    hasColumn(column) {
        return this.columns.includes(column.name)
    }
}

class Table {

    constructor() {
        this.columns = []
        this.indexes = []
        this.foreigns = []
        this.relatedTables = []
    }

    setName(name) {
        this.name = name
        return this
    }

    addColumn(column) {
        this.columns.push(column)
        return this
    }

    addIndex(index) {
        this.indexes.push(index)
        return this
    }

    addForeign(foreign) {
        this.foreigns.push(foreign)
        return this
    }

    addRelatedTable(table) {
        if (!this.relatedTables.includes(table)) {
            this.relatedTables.push(table)
        }
        
        return this
    }
    
    hasRelatedTables() {
        return this.relatedTables.length > 0
    }

    uniqueIndexes() {
        return this.indexes.filter(index => index.isUnique())
    }
}

export default class FormatMigrationsTables {

    constructor(baseData) {
        this.tables = []
        this.baseData = baseData

        this.format()
    }

    format() {
        this.mountTables()
        this.calculateRelatedTables()
    }

    mountTables() {
        Object.keys(this.baseData).forEach((tableKey) => {
            let table = this.baseData[tableKey],
                newTable = new Table()
            
            newTable.setName(table.name)

            Object.keys(table.columns).forEach((columnKey) => {
                let column = table.columns[columnKey],
                    newColumn = new Column(newTable, column)

                newColumn.setName(columnKey)

                newTable.addColumn(newColumn)
            })

            Object.keys(table.indexes).forEach((indexKey) => {
                let index = table.indexes[indexKey]

                newTable.addIndex(new Index(newTable, index))
            })

            Object.keys(table.foreigns).forEach((foreignKey) => {
                let foreign = table.foreigns[foreignKey]

                newTable.addForeign(new Foreign(newTable, foreign))
            })
            
            this.tables.push(newTable)
        })
    }

    calculateRelatedTables() {
        this.tables.forEach((table) => {
            table.columns.forEach((column) => {
                if (column.isForeign()) {
                    column.foreigns().forEach((foreign) => {
                        let relatedTable = this.tables.find(t => t.name === foreign.on)
                        table.addRelatedTable(relatedTable)
                        relatedTable.addRelatedTable(table)
                    })
                }
            })
        })
    }
                    

    get() {
        return this.tables
    }

}