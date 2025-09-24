import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach, jest } from '@jest/globals'
import BlueprintSchemaUpdater from './BlueprintSchemaUpdater'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It updates tables schema state', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' })

    const updater = new BlueprintSchemaUpdater(project)

    expect(table.schemaState).toBeUndefined()

    updater.updateTables()

    expect(table.fresh().schemaState).toBeDefined()
})

test('It updates columns schema state', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' }),
        column = TestHelper.createColumn({ name: 'name', table: table })

    const updater = new BlueprintSchemaUpdater(project)

    expect(column.schemaState).toBeFalsy()

    updater.updateTables()

    expect(column.fresh().schemaState).toBeDefined()
})

test('It updates indexes schema state', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' }),
        index = TestHelper.createIndex({ name: 'name_index', table: table })

    const updater = new BlueprintSchemaUpdater(project)

    expect(index.schemaState).toBeUndefined()

    updater.updateTables()

    expect(index.fresh().schemaState).toBeDefined()
})

test('It updates models schema state', () => {
    const project = TestHelper.getProject(),
        model = TestHelper.createModel({ name: 'User' })

    const updater = new BlueprintSchemaUpdater(project)

    expect(model.schemaState).toBeUndefined()

    updater.updateModels()

    expect(model.fresh().schemaState).toBeDefined()
})

test('It updates relationships schema state', () => {
    const project = TestHelper.getProject(),
        model = TestHelper.createModel({ name: 'User' }),
        relatedModel = TestHelper.createModel({ name: 'Post' }),
        relationship = TestHelper.createHasManyRelation(model, relatedModel)

    const updater = new BlueprintSchemaUpdater(project)

    expect(relationship.schemaState).toBeUndefined()

    updater.updateModels()

    expect(relationship.fresh().schemaState).toBeDefined()
})

test('It calls update on all components', () => {
    const project = TestHelper.getProject()

    const updater = new BlueprintSchemaUpdater(project)

    const updateTablesSpy = jest.spyOn(updater, 'updateTables')
    const updateModelsSpy = jest.spyOn(updater, 'updateModels')

    updater.update()

    expect(updateTablesSpy).toHaveBeenCalled()
    expect(updateModelsSpy).toHaveBeenCalled()
})