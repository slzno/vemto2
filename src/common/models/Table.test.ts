import Table from './Table'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
})

test('The Table model identifier is correct', () => {
    expect(Table.identifier()).toBe('Table')
})

test('It can save a new table', () => {
    const table = new Table()
    
    table.name = 'test_table'
    table.save()

    expect(table.id).toBe(1)
})

test('A table has changes when schema state is empty', () => {
    const table = new Table()
    
    table.name = 'test_table'
    table.save()

    expect(table.hasSchemaChanges({})).toBe(true)
})

test('It can check if a table has changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    const hasSchemaChanges = table.hasSchemaChanges({
        name: 'test_table',
    })

    expect(hasSchemaChanges).toBe(true)
})

test('It can check if a table does not have changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    const hasSchemaChanges = table.hasSchemaChanges({
        name: 'users',
    })

    expect(hasSchemaChanges).toBe(false)
})

test('It can apply table changes', () => {
    const table = TestHelper.createTable()

    table.applyChanges({ name: 'test_table_2' })

    expect(table.name).toBe('test_table_2')
    expect(table.schemaState.name).toBe('test_table_2')
})

test('It can save schema state separately', () => {
    const table = TestHelper.createTable()

    table.applyChanges({ name: 'renamed' })

    expect(table.name).toBe('renamed')
    expect(table.schemaState.name).toBe('renamed')

    table.name = 'reverted'
    table.save()

    expect(table.fresh().name).toBe('reverted')
    expect(table.fresh().schemaState.name).toBe('renamed')

    table.saveSchemaState()

    expect(table.fresh().name).toBe('reverted')
    expect(table.fresh().schemaState.name).toBe('reverted')
})

test('It does not apply changes when unnecessary', () => {
    const table = TestHelper.createTable()

    let changesWereApplied = table.applyChanges({ name: 'renamed' })

    expect(changesWereApplied).toBe(true)

    // The changes were already applied, so they should not be applied again
    changesWereApplied = table.applyChanges({ name: 'renamed' })

    expect(changesWereApplied).toBe(false)
})

test('A table was not considered renamed when schema state is empty', () => {
    const table = TestHelper.createTable()

    table.name = 'renamed'
    table.save()

    const wasRenamed = table.wasRenamed()

    expect(wasRenamed).toBe(false)
})

test('It can check if a table was renamed from interface', () => {
    const table = TestHelper.createTable()

    table.applyChanges({ name: 'renamed' })

    expect(table.wasRenamed()).toBe(false)

    table.name = 'reverted'
    table.save()

    expect(table.wasRenamed()).toBe(true)
})

test('A table can not be considered as renamed without schema state', () => {
    const table = TestHelper.createTable()

    expect(table.wasRenamed()).toBe(false)

    table.name = 'reverted'
    table.save()

    expect(table.wasRenamed()).toBe(false)
})

test('It sets the table position when creating', () => {
    const table = TestHelper.createTable()

    expect(table.positionX).toBe(0)
    expect(table.positionY).toBe(0)
})

test('It can check if a table has changes', () => {
    const table = TestHelper.createTable()

    const hasSchemaChanges = table.hasSchemaChanges({
        name: 'test_column',
    })

    expect(hasSchemaChanges).toBe(true)
})

test('It can apply changes to a table', () => {
    const table = TestHelper.createTable()

    table.applyChanges({
        name: 'test_column',
    })

    expect(table.name).toBe('test_column')
})

test('It can check if a table has a column', () => {
    const table = TestHelper.createTable()

    expect(table.hasColumn('test_column')).toBe(false)

    TestHelper.createColumn({ name: 'test_column', table })

    expect(table.hasColumn('test_column')).toBe(true)
})

test('It can check if a table does not have a column', () => {
    const table = TestHelper.createTable()

    expect(table.doesNotHaveColumn('test_column')).toBe(true)

    TestHelper.createColumn({ name: 'test_column', table })

    expect(table.doesNotHaveColumn('test_column')).toBe(false)
})

test('It can find a column by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'test_column', table })

    const column = table.findColumnByName('test_column')

    expect(column.name).toBe('test_column')
})

test('It can get all the columns names', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'test_column', table })

    const columnsNames = table.getColumnsNames()

    expect(columnsNames).toEqual(['test_column'])
})

test('It can get all the columns keyed by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'test_column', table })

    const columns = table.getAllColumnsKeyedByName()

    expect(columns.test_column.name).toBe('test_column')
})

test('It can check if a table has a index', () => {
    const table = TestHelper.createTable()

    expect(table.hasIndex('test_index')).toBe(false)

    TestHelper.createIndex({ name: 'test_index', table })

    expect(table.hasIndex('test_index')).toBe(true)
})

test('It can check if a table does not have a index', () => {
    const table = TestHelper.createTable()

    expect(table.doesNotHaveIndex('test_index')).toBe(true)

    TestHelper.createIndex({ name: 'test_index', table })

    expect(table.doesNotHaveIndex('test_index')).toBe(false)
})

test('It can find a index by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createIndex({ name: 'test_index', table })

    const index = table.findIndexByName('test_index')

    expect(index.name).toBe('test_index')
})

test('It can get all the indexes names', () => {
    const table = TestHelper.createTable()

    TestHelper.createIndex({ name: 'test_index', table })

    const indexesNames = table.getIndexesNames()

    expect(indexesNames).toEqual(['test_index'])
})

test('It can get all the indexes keyed by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createIndex({ name: 'test_index', table })

    const indexes = table.getAllIndexesKeyedByName()

    expect(indexes.test_index.name).toBe('test_index')
})

test('It can check if a table has related tables', () => {
    const table = TestHelper.createTable()

    expect(table.hasRelatedTables()).toBe(true)
})

test('It can get the related tables', () => {
    const table = TestHelper.createTable({ name: 'users' })

    const relatedTables = table.getRelatedTables()

    expect(relatedTables.length).toBe(0)
})

test('It can get the table models', () => {
    const table = TestHelper.createTable({ name: 'users' })

    const models = table.getModels()

    expect(models.length).toBe(1)

    expect(models[0].name).toBe('User.php')
    expect(models[0].relationships.length).toBe(1)
    expect(models[0].relationships[0].type).toBe('hasMany')
    expect(models[0].relationships[0].model).toBe('Post')
})

test('It can check if a table has timestamps', () => {
    const table = TestHelper.createTable({ name: 'users' })

    const createdAtColumn = TestHelper.createColumn({ name: 'created_at', table }),
        updatedAtColumn = TestHelper.createColumn({ name: 'updated_at', table })

    expect(table.hasTimestamps()).toBe(true)

    createdAtColumn.delete()
    
    expect(table.hasTimestamps()).toBe(false)

    updatedAtColumn.delete()

    expect(table.hasTimestamps()).toBe(false)
})

test('It can check if a table has soft deletes', () => {
    const table = TestHelper.createTable({ name: 'users' })

    const deletedAtColumn = TestHelper.createColumn({ name: 'deleted_at', table })

    expect(table.hasSoftDeletes()).toBe(true)

    deletedAtColumn.delete()

    expect(table.hasSoftDeletes()).toBe(false)
})

test('It can mark a table as changed', () => {
    const project = TestHelper.getProject(), 
        table = TestHelper.createTable({ name: 'users' })

    table.markAsChanged()

    expect(project.fresh().hasChangedTables()).toBe(true)
})

test('It can check if a table has migrations data', () => {
    const table = TestHelper.createTable({ name: 'users' })

    expect(table.hasMigrations()).toBe(false)

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
    }]
    table.save()

    expect(table.hasMigrations()).toBe(true)
})

test('It can check if latest migration created the table', () => {
    const table = TestHelper.createTable({ name: 'users' })

    expect(table.latestMigrationCreatedTable()).toBe(false)

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
        createdTables: ['users'],
    }]

    table.save()

    expect(table.latestMigrationCreatedTable()).toBe(true)
})

test('It can get the latest migration', () => {
    const table = TestHelper.createTable({ name: 'users' })

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
    }]

    table.save()

    expect(table.getLatestMigration().migration).toBe('2020_01_01_000000_create_users_table')
})

test('It can get the creation migration', () => {
    const table = TestHelper.createTable({ name: 'users' })

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
        createdTables: ['users'],
    }]

    table.save()

    expect(table.getCreationMigration().migration).toBe('2020_01_01_000000_create_users_table')
})

test('It can can check if updating latest migration is possible', () => {
    const table = TestHelper.createTable({ name: 'users' })

    expect(table.canUpdateLatestMigration()).toBe(false)

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
    }]

    table.save()

    expect(table.canUpdateLatestMigration()).toBe(true)
})

test('It can can check if creating a new migration is possible', () => {
    const table = TestHelper.createTable({ name: 'users' })

    expect(table.canCreateNewMigration()).toBe(true)
})

test('It can can get all columns except removed ones', () => {
    const table = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ name: 'column0', table })
    TestHelper.createColumn({ name: 'column1', table })

    const columnToRemove = TestHelper.createColumn({ name: 'column2', table })

    let columns = table.getColumns()

    expect(columns[0].name).toBe('column0')
    expect(columns[1].name).toBe('column1')
    expect(columns[2].name).toBe('column2')

    columnToRemove.remove()

    columns = table.getColumns()

    expect(columns[0].name).toBe('column0')
    expect(columns[1].name).toBe('column1')
    expect(columns[2]).toBe(undefined)
})

test('It can get all removed columns', () => {
    const table = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ name: 'column0', table })
    TestHelper.createColumn({ name: 'column1', table })

    // Create a column with schema state because new columns are destroyed when removed
    const columnToRemove = TestHelper.createColumnWithSchemaState({ name: 'column2', table })

    let columns = table.getRemovedColumns()

    expect(columns.length).toBe(0)

    columnToRemove.remove()

    columns = table.getRemovedColumns()

    expect(columns[0].name).toBe('column2')
})