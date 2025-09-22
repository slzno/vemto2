import fs from "fs"
import path from "path"
import { v4 as uuid } from "uuid"
import { expect } from "@jest/globals"
import Table from "@Common/models/Table"
import Index from "@Common/models/Index"
import Column from "@Common/models/Column"
import Project from "@Common/models/Project"
import FileSystem from "@Main/base/FileSystem"
import Model from "@Common/models/Model"
import SchemaSection from "@Common/models/SchemaSection"
import AppSection from "@Common/models/AppSection"
import Crud, { CrudType } from "@Common/models/crud/Crud"
import Relationship from "@Common/models/Relationship"
import { camelCase } from "change-case"

export default new class TestHelper {

    static currentTestsPath = null

    static latestFilePath = null
    static currentTestName = null
    static currentTestFile = null

    setCurrentTestsPath(testsPath) {
        TestHelper.currentTestsPath = testsPath
    }

    setCurrentTestName(name) {
        TestHelper.currentTestName = name
    }

    getCurrentTestsPath() {
        return TestHelper.currentTestsPath
    }

    setCurrentTestFile(file) {
        TestHelper.currentTestFile = file
    }

    getProject() {
        let project = Project.find(1)

        if(!project) {
            return this.createProject()
        }

        this.addProjectBasicData(project)

        return project
    }

    createProject() {
        const project = new Project
        project.name = "Test Project"
        project.save()

        this.addProjectBasicData(project)

        return project
    }

    addProjectBasicData(project) {
        if(!project.hasSection("Admin")) {
            SchemaSection.create({
                name: "Admin",
                scrollX: 0,
                scrollY: 0,
                projectId: project.id,
            })
        }

        AppSection.create({
            name: "Dashboard",
            routePrefix: "dashboard",
            routeBasePath: "dashboard",
            projectId: project.id,
            requiresAuth: true,
        })

        AppSection.create({
            name: "Site",
            routePrefix: "",
            routeBasePath: "",
            projectId: project.id,
            requiresAuth: false,
        })

        AppSection.create({
            name: "Admin",
            routePrefix: "admin",
            routeBasePath: "admin",
            projectId: project.id,
            requiresAuth: false,
        })
    }

    createTable(data = {}) {
        const table = new Table,
            project = this.getProject()

        table.name = data.name || "users"
        table.projectId = project.id

        table.oldNames = data.oldNames || []
        table.migrations = data.migrations || []

        table.save()

        return table
    }

    createTableWithSchemaState(data = {}) {
        Table.savingInternally()
        const table = this.createTable(data)

        table.saveSchemaState()
        Table.notSavingInternally()

        return table
    }

    createModel(data = {}) {
        const table = data.table || this.createTable(),
            model = new Model(),
            project = this.getProject()

        model.projectId = project.id
        model.tableId = table.id
        
        model.name = data.name || "User"
        model.plural = data.plural || "Users"

        model.save()

        return model
    }

    createColumn(data = {}) {
        if(!data.table) {
            data.table = this.createTable()
        }

        const column = new Column
        column.order = data.hasOwnProperty("order") ? data.order : undefined
        column.name = data.name || "name"

        if(data.hasOwnProperty("length") || data.type === "string") {
            column.length = data.length || 255
        }
        
        column.type = data.type || "string"
        column.autoIncrement = data.autoIncrement || false
        column.nullable = data.nullable || false
        column.unsigned = data.unsigned || false
        column.tableId = data.table.id
        column.options = data.options || []
        column.save()

        return column
    }

    createColumnWithSchemaState(data = {}) {
        Column.savingInternally()

        const column = this.createColumn(data)

        column.saveSchemaState()
        Column.notSavingInternally()

        return column
    }

    createCrud(data = {}) {
        if(!data.model) {
            data.model = this.createModel()
        }

        const type = data.hasOwnProperty('type') ? data.type : CrudType.DEFAULT,
            excludedColumns = data.hasOwnProperty('excludedColumns') ? data.excludedColumns : [],
            generateDetails = data.hasOwnProperty('generateDetails') ? data.generateDetails : false

        const crud = Crud.createFromModel(data.model, type, excludedColumns, generateDetails)

        crud.save()

        return crud
    }

    createPrimaryIndex(data = {}) {
        return this.createIndex({
            ...data,
            type: "primary"
        })
    }

    createForeignIndex(data = {}) {
        return this.createIndex({
            ...data,
            type: "foreign",
            references: data.references || "id",
            on: data.on || "users"
        })
    }

    createIndex(data = {}) {
        if(!data.table) {
            data.table = this.createTable()
        }

        const index = new Index
        index.projectId = data.table.projectId
        index.name = data.name || "index_name"
        index.type = data.type || "index"
        index.tableId = data.table.id
        index.columns = data.columns || ['name']
        index.algorithm = data.algorithm || "BTREE"

        if(data.hasOwnProperty("references")) {
            index.references = data.references
        }

        if(data.hasOwnProperty("on")) {
            index.on = data.on
        }

        index.save()

        return index
    }

    createIndexWithSchemaState(data = {}) {
        Index.savingInternally()
        const index = this.createIndex(data)

        index.saveSchemaState()
        Index.notSavingInternally()

        return index
    }

    createHasManyRelation(model, relatedModel) {
        const relationship = new Relationship()

        relationship.name = camelCase(relatedModel.plural)
        relationship.type = 'HasMany'

        relationship.modelId = model.id
        relationship.relatedModelId = relatedModel.id

        relationship.projectId = model.projectId
        relationship.save()

        return relationship
    }

    createBelongsToManyRelation(model, relatedModel) {
        const relationship = new Relationship()
        relationship.projectId = model.projectId

        relationship.name = camelCase(relatedModel.plural)
        relationship.type = 'BelongsToMany'

        relationship.modelId = model.id
        relationship.relatedModelId = relatedModel.id

        const pivot = this.createTable({
            name: `${camelCase(relatedModel.name)}_${camelCase(model.name)}`
        })

        relationship.pivotId = pivot.id

        relationship.save()
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

    matchesFile(filePath, code, strict = false) {
        let fileCode = this.readOrCreateFile(filePath, code)

        if(strict) {
            return fileCode === code
        }

        return this.compareCode(fileCode, code) 
    }

    readOrCreateTemplate(templatePath, contentForCreation) {
        return this.readOrCreateFile(templatePath, contentForCreation)
    }

    readOrCreateOutputFile(filePath, contentForCreation, forceCreate = false) {   
        const fullPath = path.join(__dirname, 'tests/output', filePath)
        return this.readOrCreateFile(fullPath, contentForCreation, forceCreate)
    }

    readOrCreateFile(filePath, contentForCreation, forceCreate = false) {
        TestHelper.latestFilePath = filePath

        if(process.env.FORCE_CREATE_OUTPUT_FILES) {
            forceCreate = true
        }

        if(!FileSystem.fileExists(filePath) || forceCreate) {
            console.log('\x1b[33m%s\x1b[0m', `CREATING FILE: ${filePath}`)

            FileSystem.writeFile(filePath, contentForCreation, false)
        }

        return FileSystem.readFile(filePath)
    }

    filesRelevantContentIsEqual(firstFile, secondFile, strict = false) {
        this.setCurrentTestFile(expect.getState().testPath)
        this.setCurrentTestName(expect.getState().currentTestName)

        let isEqual = false

        if(strict) {
            isEqual = firstFile === secondFile
        } else {
            const firstFileLines = this.convertFileToArray(firstFile),
                secondFileLines = this.convertFileToArray(secondFile)
    
            isEqual = this.arraysAreEqual(firstFileLines, secondFileLines)
        }

        if(!isEqual) {
            const testId = uuid(),
                basePath = path.join(__dirname, 'templates', 'outputs')

            const testData = {
                templatePath: TestHelper.latestFilePath,
                templateName: TestHelper.latestFilePath.split(/\/|\\/).pop(),
                testName: TestHelper.currentTestName,
                testPath: TestHelper.currentTestFile,
            }

            FileSystem.writeFile(path.join(basePath, `${testId}_data.json`), JSON.stringify(testData), false)
            FileSystem.writeFile(path.join(basePath, `${testId}_firstFile.txt`), firstFile, false)
            FileSystem.writeFile(path.join(basePath, `${testId}_secondFile.txt`), secondFile, false)

            throw new Error(`Templates are different: \n\n TestDiff(${testId})`)
        }

        return isEqual
    }

    convertFileToArray(fileContent) {
        return fileContent.split('\n')
            .map(line => line.trim())
    }

    arraysAreEqual(firstArray, secondArray) {
        if (!firstArray || !secondArray) return false
    
        if (firstArray.length != secondArray.length) return false
    
        for (let i = 0, l = firstArray.length; i < l; i++) {
            // Check if we have nested arrays
            if (firstArray[i] instanceof Array && secondArray[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this.arraysAreEqual(firstArray[i], secondArray[i])) return false     
            }           
            else if (firstArray[i] != secondArray[i]) { 
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false  
            }           
        }     

        return true
    }
}