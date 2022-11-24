import fs from "fs"
import path from "path"
import Table from "@Common/models/Table"
import Column from "@Common/models/Column"
import Project from "@Common/models/Project"

export default new class TestHelper {

    getProject() {
        let project = Project.find(1)

        if(!project) {
            return this.createProject()
        }

        return project
    }

    createProject() {
        const project = new Project
        project.name = "Test Project"
        project.save()

        return project
    }

    createTable(data = {}) {
        const table = new Table,
            project = this.getProject()

        table.name = data.name || "users"
        table.projectId = project.id
        table.save()

        return table
    }

    createColumn(data = {}) {
        if(!data.table) {
            data.table = this.createTable()
        }

        const column = new Column
        column.name = data.name || "name"
        column.length = data.length || 255
        column.typeDefinition = data.type || "string"
        column.autoIncrement = data.autoIncrement || false
        column.nullable = data.nullable || false
        column.unsigned = data.unsigned || false
        column.tableId = data.table.id
        column.save()

        return column
    }

    createColumnWithSchemaState(data = {}) {
        const column = this.createColumn(data)

        column.saveSchemaState()

        return column
    }

    compareCode(code1, code2) {
        return this.removeSpacesAndTabs(code1) === this.removeSpacesAndTabs(code2)
    }

    removeSpacesAndTabs(code) {
        return code.replace(/\s/g, "")
    }

    readInputFile(basePath, name) {
        return fs.readFileSync(path.join(basePath, `tests/input/${name}`), 'utf8')
    }
}